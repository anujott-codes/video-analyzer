from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(
        ..., min_length=1, description="Natural-language question about the meeting."
    )


class ChatResponse(BaseModel):
    answer: str = Field(..., description="Answer grounded in the transcript context.")
