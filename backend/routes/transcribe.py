import tempfile
import os
from typing import Optional

from fastapi import APIRouter, HTTPException, File, Form, UploadFile

from backend.schemas.transcribe import TranscribeResponse
from backend.services.transcribe import run_transcription
from backend.services.rag import ingest_transcript

router = APIRouter(tags=["transcribe"])


@router.post("/transcribe", response_model=TranscribeResponse)
def transcribe(
    file: Optional[UploadFile] = File(None, description="Upload a local audio/video file."),
    youtube_url: Optional[str] = Form(None, description="YouTube URL to transcribe."),
    translate: bool = Form(False, description="If true, Whisper translates non-English audio to English."),
):
    # ── Validate: exactly one source must be provided ──────────────────
    if file and youtube_url:
        raise HTTPException(
            status_code=422,
            detail="Provide either 'file' or 'youtube_url', not both.",
        )
    if not file and not youtube_url:
        raise HTTPException(
            status_code=422,
            detail="Provide either a 'file' upload or a 'youtube_url'.",
        )

    tmp_path: Optional[str] = None

    try:
        # ── Determine source path ──────────────────────────────────────
        if youtube_url:
            source = youtube_url
            source_type = "youtube_url"
        else:
            # Write uploaded bytes to a temp file, preserving the extension
            # so ffmpeg / pydub can infer the codec.
            ext = os.path.splitext(file.filename)[1] if file.filename else ""
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
            tmp.write(file.file.read())
            tmp.close()
            tmp_path = tmp.name
            source = tmp_path
            source_type = "file_upload"

        # ── Run transcription ──────────────────────────────────────────
        result = run_transcription(source, translate=translate, source_type=source_type)

        # ── Auto-ingest into RAG vectorstore (Fix 2) ───────────────────
        ingest_transcript(result["transcript"])

        return TranscribeResponse(**result)

    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {exc}",
        )

    finally:
        # Clean up the temp file regardless of success or failure
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
