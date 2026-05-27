from fastapi import APIRouter, HTTPException

from backend.schemas.rag import ChatRequest, ChatResponse
from backend.services.rag import ask_question

router = APIRouter(tags=["rag"])


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Ask a question over the ingested transcript via the RAG pipeline."""
    try:
        result = ask_question(req.question)
        return ChatResponse(**result)

    except RuntimeError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"RAG query failed: {exc}",
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {exc}",
        )
