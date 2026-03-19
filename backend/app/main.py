from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils import get_full_graph
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.utils import get_full_graph, add_source_node
import os
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="LearnPulse API")

# Allow your Next.js frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the LearnPulse Backend!"}

@app.get("/api/graph")
def fetch_graph_data():
    """Endpoint that sends the Neo4j Knowledge Graph to the frontend."""
    return get_full_graph()

app = FastAPI(title="LearnPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the LearnPulse Backend!"}

@app.get("/api/graph")
def fetch_graph_data():
    """Endpoint that sends the Neo4j Knowledge Graph to the frontend."""
    return get_full_graph()

@app.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...), 
    topic: str = Form(...), 
    user_id: str = Form(...)
):
    """Receives a file from the frontend and adds it to the Knowledge Graph."""
    
    # ==========================================
    # RAG PLACEHOLDER: Teammate's ChromaDB code goes here
    # text_chunks = process_pdf(file)
    # save_to_chroma(text_chunks)
    # ==========================================
    mock_chunk_count = 5 # Simulating a successful RAG extraction

    # Save to Neo4j (The Knowledge Graph)
    try:
        add_source_node(filename=file.filename, topic_name=topic, user_id=user_id)
        status_message = "Success! Source node linked to Knowledge Graph."
    except Exception as e:
        print(f"Graph Error: {e}")
        status_message = "Error adding to graph."

    # Return the response to your React frontend
    return {
        "status": status_message, 
        "filename": file.filename,
        "chunks": mock_chunk_count 
    }
# Load environment variables and configure Gemini
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class LearnRequest(BaseModel):
    topic: str
    goal: str
    user_id: str
    # Making format optional just in case the frontend doesn't send it yet
    format: Optional[str] = None

@app.post("/learn")
async def generate_learning_output(request: LearnRequest):
    """Takes the user goal, pulls RAG context, and generates a Gemini study guide."""
    
    # 1. RAG PLACEHOLDER: Tomorrow, your teammate's code will go here to pull real text from ChromaDB.
    # For tonight, we will give Gemini some fake "extracted text" so it has something to read.
    simulated_rag_text = f"The core principle of {request.topic} involves structuring systems efficiently. Caching is a major strategy used to reduce latency and database load."

    # 2. Build the precise prompt for Gemini
    prompt = f"""
    You are an expert computer science tutor building a microlearning artifact.
    The user wants to learn about: {request.topic}.
    Their specific goal is: {request.goal}.
    
    Here is the contextual text extracted from their uploaded Knowledge Graph documents:
    "{simulated_rag_text}"
    
    Using ONLY the extracted text and your expert knowledge, generate a brief, helpful study guide to help them achieve their goal. 
    Format it beautifully with markdown headers and bullet points.
    """

    try:
        # 3. Call the Gemini API!
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        ai_output = response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        ai_output = "Error generating content. Please check your API key."

    # 4. Send the real text back to your frontend UI
    return {"output": ai_output}