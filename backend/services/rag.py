from __future__ import annotations

import threading

from rag.pipeline import RAGPipeline

_lock = threading.Lock()
_pipeline: RAGPipeline | None = None


def _get_pipeline() -> RAGPipeline:
    global _pipeline
    if _pipeline is None:
        with _lock:
            if _pipeline is None:
                _pipeline = RAGPipeline()
    return _pipeline


def reset_vectorstore() -> None:
    """Clear all existing embeddings so the next ingestion starts fresh."""
    pipeline = _get_pipeline()
    pipeline.reset_vectorstore()


def ingest_transcript(transcript: str) -> None:
    """Reset the vectorstore and ingest a new transcript."""
    reset_vectorstore()
    pipeline = _get_pipeline()
    pipeline.process_transcript(transcript)


def ask_question(question: str) -> dict:
    pipeline = _get_pipeline()
    answer = pipeline.answer_question(question)
    return {"answer": answer}
