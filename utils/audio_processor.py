"""
Accepts any audio/video file and converts it to WAV chunks ready for whisper
-> Detects if the input file is Youtube URL or a local file
-> Downloads audio only stream from youtube using yt-dlp
-> converts any format (MP4, MP3, etc.) to WAV using ffmpeg
-> splits large audio files into 10-mintue chunks for whisper
-> returns a list of paths to the processed audio chunks
"""

import yt_dlp
from pydub import AudioSegment
from configs.audio_processor_config import DOWNLOAD_DIR
import os
from typing import List
from logger.logger import get_logger

logger = get_logger(__name__)


class AudioProcessor:
    def __init__(self) -> None:
        os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    def download_youtube_audio(self, url: str) -> str:
        try:
            logger.info("Downloading audio from YouTube")

            output_path = os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s')
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': output_path,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav',
                    'preferredquality': '192',
                }],
                "quiet": True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=True)
                downloaded_file = ydl.prepare_filename(info_dict)
                audio_file = os.path.splitext(downloaded_file)[0] + '.wav'

            return audio_file

        except Exception as e:
            logger.exception("Failed to download YouTube audio")
            raise e

    def convert_to_wav(self, input_path: str) -> str:
        try:
            logger.info("Converting file to WAV")

            filename = os.path.splitext(input_path)[0]
            filename = filename.replace(' ', '_')
            output_path = filename + '_converted.wav'

            audio = AudioSegment.from_file(input_path)
            audio = audio.set_channels(1).set_frame_rate(16000)
            audio.export(output_path, format='wav')

            return output_path

        except Exception as e:
            logger.exception("Failed to convert audio to WAV")
            raise e
    
    def chunk_audio(self, wav_path: str, chunk_minutes: int = 10) -> List[str]:
        try:
            logger.info("Chunking audio file")

            audio = AudioSegment.from_wav(wav_path)
            chunk_length_ms = chunk_minutes * 60 * 1000
            chunks: List[str] = []

            for i, start in enumerate(range(0, len(audio), chunk_length_ms)):
                chunk = audio[start:start + chunk_length_ms]
                chunk_filename = f"{os.path.splitext(wav_path)[0]}_chunk_{i+1}.wav"
                chunk.export(chunk_filename, format='wav')
                chunks.append(chunk_filename)

            logger.info(f"Generated {len(chunks)} chunks")

            return chunks

        except Exception as e:
            logger.exception("Failed to chunk audio")
            raise e
    
    def process(self, source: str) -> List[str]:
        try:
            if source.startswith("http://") or source.startswith("https://"):
                logger.info("Processing YouTube URL")
                audio_path = self.download_youtube_audio(source)
            else:
                logger.info("Processing local file")
                audio_path = self.convert_to_wav(source)

            chunks = self.chunk_audio(audio_path)

            logger.info("Audio processing completed")

            return chunks

        except Exception as e:
            logger.exception("Audio processing failed")
            raise e