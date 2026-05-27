from dataclasses import dataclass

@dataclass 
class ChunkerConfig:
    chunk_size: int = 500
    chunk_overlap: int = 50
