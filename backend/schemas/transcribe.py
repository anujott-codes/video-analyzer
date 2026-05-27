from pydantic import BaseModel, Field
from typing import Optional


class TranscribeRequest(BaseModel):
    """JSON body schema — kept for documentation / internal use.

    The actual /transcribe endpoint now uses Form + UploadFile (multipart),
    so this model is no longer used as a direct request body.
    """

    model_config = {"json_schema_extra": {
        "examples": [{"source": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "translate": False}]
    }}

    source: Optional[str] = Field(
        default=None,
        description="YouTube URL or absolute path to a local audio/video file.",
    )
    translate: bool = Field(
        default=False,
        description="If True, Whisper translates non-English audio to English.",
    )


class TranscribeResponse(BaseModel):
    transcript: str = Field(..., description="Full transcript text.")
    num_chunks: int = Field(..., description="Number of audio chunks processed.")
    source_type: str = Field(
        ...,
        description="How the source was provided: 'youtube_url' or 'file_upload'.",
    )
