import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import get_settings
from backend.routes import health, transcribe, summary, extract, rag


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if not settings.mistral_api_key:
        import warnings
        warnings.warn("MISTRAL_API_KEY is not set — LLM endpoints will fail.")
    yield



app = FastAPI(
    title="VideoAnalyzer API",
    description="AI Meeting Assistant — transcribe, summarise, extract, and Q&A over recordings.",
    version="0.1.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(transcribe.router)
app.include_router(summary.router)
app.include_router(extract.router)
app.include_router(rag.router)
