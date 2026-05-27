from pydantic import BaseModel, Field


class ExtractRequest(BaseModel):
    transcript: str = Field(
        ..., min_length=1, description="Full transcript text to extract from."
    )


class ExtractResponse(BaseModel):

    action_items: str = Field(..., description="Numbered list of action items.")
    decisions: str = Field(..., description="Numbered list of decisions.")
    questions: str = Field(..., description="Numbered list of open / follow-up questions.")
