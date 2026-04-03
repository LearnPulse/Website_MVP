from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class OrchestratorState(TypedDict):
    # Input fields (set by caller)
    user_id: str
    concept_id: str
    goal: str
    query: str
    artifact_type: str
    preferred_formats: list[str]

    # Populated by tool calls during ReAct loop
    mastery_summary: dict          # from get_user_state
    retrieved_concepts: list[dict] # from query_concepts
    chunk_texts: list[str]         # from fetch_chunks

    # Output
    gemini_output: str             # raw Gemini response
    artifact_payload: dict         # structured output from artifact sub-agent

    # LangGraph message history for ReAct reasoning
    messages: Annotated[list, add_messages]
