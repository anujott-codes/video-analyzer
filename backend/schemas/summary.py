from pydantic import BaseModel, Field


class SummaryRequest(BaseModel):

    transcript: str = Field(
        ..., min_length=1, description="Full transcript text to summarize."
    )


class SummaryResponse(BaseModel):
    title: str = Field(..., description="Generated title for the transcript.")
    summary: str = Field(..., description="Bullet-point summary of the transcript.")
