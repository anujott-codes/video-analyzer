from __future__ import annotations

import os
import threading

from utils.audio_processor import AudioProcessor
from utils.transcriber import Transcriber

# ── Singletons (double-checked locking, same pattern as services/rag.py) ──────
_lock = threading.Lock()
_transcriber: Transcriber | None = None
_processor: AudioProcessor | None = None


def _get_transcriber() -> Transcriber:
    global _transcriber
    if _transcriber is None:
        with _lock:
            if _transcriber is None:
                _transcriber = Transcriber()  # whisper.load_model() runs once
    return _transcriber


def _get_processor() -> AudioProcessor:
    global _processor
    if _processor is None:
        with _lock:
            if _processor is None:
                _processor = AudioProcessor()
    return _processor


def run_transcription(source: str, *, translate: bool = False, source_type: str = "youtube_url") -> dict:
    # Validate local paths early so we can return a clear 404
    if not (source.startswith("http://") or source.startswith("https://")):
        if not os.path.isfile(source):
            raise FileNotFoundError(f"Local file not found: {source}")

    processor = _get_processor()
    chunks = processor.process(source)

    transcriber = _get_transcriber()
    transcript = transcriber.transcribe(chunks, translate=translate)

    return {"transcript": transcript, "num_chunks": len(chunks), "source_type": source_type}
