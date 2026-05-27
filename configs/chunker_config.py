from dataclasses import dataclass

@dataclass 
class ChunkerConfig:
    encoder_name: str = "cl100k_base"
    chunk_size: int = 500
    chunk_overlap: int = 50
