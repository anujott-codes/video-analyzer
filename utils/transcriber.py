import whisper
import os

from typing import List

from configs.transcriber_config import WHISPER_MODEL_SIZE,DEVICE
from logger.logger import get_logger

logger = get_logger(__name__)

class Transcriber:
    def __init__(self, model_size: str = WHISPER_MODEL_SIZE, device: str = DEVICE):
        self.model = self._load_model(model_size, device)

    def _load_model(self, model_size: str, device: str) -> whisper.Whisper:
        try:
            logger.info(f"Loading Whisper model of size: {model_size} and device: {device}")
            model = whisper.load_model(model_size, device=device)
            logger.info("Whisper model loaded successfully")
            return model
        except Exception as e:
            logger.exception(f"Error loading Whisper model")
            raise

    def transcribe_chunk(self, chunk_path: str, translate: bool = False) -> str:
        if not os.path.exists(chunk_path):
            raise FileNotFoundError(f"Chunk file not found: {chunk_path}")
        
        try:
            logger.info(f"Transcribing chunk: {chunk_path} with translate={translate}")
            result = self.model.transcribe(
                chunk_path,
                task="translate" if translate else "transcribe",
                fp16=False
            )
            logger.info(f"Transcription completed for chunk: {chunk_path}")
            return result['text']
        
        except Exception as e:
            logger.exception(f"Error transcribing chunk {chunk_path}")
            raise

    def transcribe(self, chunks: List[str], translate: bool = False) -> str:
        if not chunks:
            logger.warning("No audio chunks provided for transcription")
            return ""
        
        full_transcript = ""
        
        for i, chunk in enumerate(chunks):
            logger.info(f"Processing chunk {i+1}/{len(chunks)}: {chunk}")
            text = self.transcribe_chunk(chunk, translate)
            full_transcript += text + "\n"

        logger.info("All chunks transcribed successfully")
        return full_transcript.strip()
    