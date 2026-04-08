"""
Learning Orchestration Agent — LangGraph ReAct loop.

Flow:
  reason → act (tool calls) → observe → repeat → generate → artifact node

The orchestrator:
  1. Calls query_concepts → finds relevant KG nodes + chunk_ids
  2. Calls fetch_chunks   → retrieves raw text
  3. Calls get_user_state → gets mastery + preferences
  4. Generates with Gemini (mastery-aware prompt)
  5. Routes output to the appropriate artifact sub-agent
"""

import logging
from typing import Literal

import google.generativeai as genai
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode

from app.agent.state import OrchestratorState
from app.agent.artifacts.cheatsheet import generate_cheatsheet
from app.agent.artifacts.flashcards import generate_flashcards
from app.agent.artifacts.quiz import generate_quiz
from app.agent.artifacts.diagram import generate_diagram
from app.agent.artifacts.audio import generate_audio
from app.core.config import settings
from app.tools import query_concepts, fetch_chunks, get_user_state
from app.knowledge_graph import get_concept, load_kg

logger = logging.getLogger(__name__)

TOOLS = [query_concepts, fetch_chunks, get_user_state]

SYSTEM_PROMPT = """\
You are the Learning Orchestration Agent for LearnPulse.

User goal: {goal}
Current mastery state: {mastery_summary}
User preferences: {preferences}
Concept to learn: {query}

You have access to: query_concepts, fetch_chunks, get_user_state.

Steps:
1. Call query_concepts to find relevant concept nodes and relationships
2. Call fetch_chunks with the chunk_ids from those nodes
3. Call get_user_state to confirm mastery and preferences
4. You now have enough context — stop calling tools and respond with DONE

Prioritise concepts where mastery < 50. Build on concepts where mastery >= 70.
Always ground output in retrieved context. Never hallucinate.
When you have retrieved context, respond with exactly: DONE
"""

GENERATION_PROMPT = """\
You are an expert tutor generating a {artifact_type} for a student.

Concept: {concept_name}
Student goal: {goal}
Mastery level: {mastery_score}/100

Context from their documents:
{context}

Generate thorough, accurate content grounded in the context above.
"""


# ── ReAct nodes ───────────────────────────────────────────────────────────

def reason_node(state: OrchestratorState) -> dict:
    """Invoke the LLM with tool-binding for the ReAct loop."""
    # convert_system_message_to_human=True merges SystemMessage content into the
    # first HumanMessage so Gemini never sees a standalone SystemMessage turn,
    # which would violate its function-call ordering constraint.
    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_chat_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.3,
        convert_system_message_to_human=True,
    ).bind_tools(TOOLS)

    mastery = state.get("mastery_summary", {})
    system = SYSTEM_PROMPT.format(
        goal=state["goal"],
        mastery_summary=mastery,
        preferences=mastery.get("preferences", {}),
        query=state["query"],
    )

    messages = state.get("messages", [])
    if not messages:
        # First call — seed with system context + user request
        messages = [
            SystemMessage(content=system),
            HumanMessage(content=f"Help me learn: {state['query']}"),
        ]

    response = llm.invoke(messages)
    return {"messages": [response]}


def should_continue(state: OrchestratorState) -> Literal["tools", "generate"]:
    """Route: if the last message has tool calls, run tools; otherwise generate."""
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return "generate"


def collect_tool_results(state: OrchestratorState) -> dict:
    """
    After ToolNode runs, extract structured data from messages into state fields.
    """
    updates: dict = {}

    for msg in reversed(state["messages"]):
        if not hasattr(msg, "name"):
            continue
        try:
            content = msg.content if isinstance(msg.content, dict) else {}
        except Exception:
            continue

        if msg.name == "query_concepts" and not state.get("retrieved_concepts"):
            updates["retrieved_concepts"] = content.get("nodes", [])
            chunk_ids = content.get("chunk_ids", [])
            updates.setdefault("_pending_chunk_ids", chunk_ids)

        elif msg.name == "fetch_chunks" and not state.get("chunk_texts"):
            if isinstance(msg.content, list):
                updates["chunk_texts"] = msg.content
            elif isinstance(msg.content, dict):
                updates["chunk_texts"] = msg.content.get("result", [])

        elif msg.name == "get_user_state" and not state.get("mastery_summary"):
            updates["mastery_summary"] = content

    return updates


def generate_node(state: OrchestratorState) -> dict:
    """Assemble context and call Gemini for the final generation."""
    G = load_kg()
    concept = get_concept(G, state["concept_id"]) or {"name": state["query"], "description": ""}
    context = "\n\n".join(state.get("chunk_texts", []))[:4000]
    mastery_score = (
        state.get("mastery_summary", {}).get("mastery", {}).get(state["concept_id"], 0)
    )

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_chat_model)
    prompt = GENERATION_PROMPT.format(
        artifact_type=state["artifact_type"],
        concept_name=concept.get("name", state["query"]),
        goal=state["goal"],
        mastery_score=mastery_score,
        context=context,
    )
    try:
        response = model.generate_content(prompt)
        gemini_output = response.text or ""
    except Exception as exc:
        logger.warning("Gemini generation failed: %s", exc)
        gemini_output = ""

    return {"gemini_output": gemini_output}


def artifact_node(state: OrchestratorState) -> dict:
    """Route Gemini output to the correct artifact formatter."""
    G = load_kg()
    concept = get_concept(G, state["concept_id"]) or {"name": state["query"], "description": ""}
    context = "\n\n".join(state.get("chunk_texts", []))[:4000]
    artifact_type = state["artifact_type"]

    dispatch = {
        "cheatsheet": generate_cheatsheet,
        "flashcards": generate_flashcards,
        "quiz": generate_quiz,
        "diagram": generate_diagram,
        "audio": generate_audio,
    }
    fn = dispatch.get(artifact_type, generate_cheatsheet)
    payload = fn(concept, context)
    return {"artifact_payload": payload}


# ── Graph assembly ─────────────────────────────────────────────────────────

tool_node = ToolNode(TOOLS)


def build_graph():
    graph = StateGraph(OrchestratorState)

    graph.add_node("reason", reason_node)
    graph.add_node("tools", tool_node)
    graph.add_node("collect", collect_tool_results)
    graph.add_node("generate", generate_node)
    graph.add_node("artifact", artifact_node)

    graph.set_entry_point("reason")
    graph.add_conditional_edges("reason", should_continue, {"tools": "tools", "generate": "generate"})
    graph.add_edge("tools", "collect")
    graph.add_edge("collect", "reason")
    graph.add_edge("generate", "artifact")
    graph.add_edge("artifact", END)

    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


async def run_orchestrator(
    user_id: str,
    concept_id: str,
    goal: str,
    artifact_type: str,
) -> dict:
    """Entry point called by the /ask route handler."""
    G = load_kg()
    concept = get_concept(G, concept_id)
    query = concept["name"] if concept else concept_id

    initial_state: OrchestratorState = {
        "user_id": user_id,
        "concept_id": concept_id,
        "goal": goal,
        "query": query,
        "artifact_type": artifact_type,
        "preferred_formats": [],
        "mastery_summary": {},
        "retrieved_concepts": [],
        "chunk_texts": [],
        "gemini_output": "",
        "artifact_payload": {},
        "messages": [],
    }

    graph = get_graph()
    final_state = await graph.ainvoke(initial_state)
    return {
        "artifact_type": artifact_type,
        "concept_id": concept_id,
        "payload": final_state.get("artifact_payload", {}),
    }
