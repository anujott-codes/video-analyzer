from dataclasses import dataclass

@dataclass
class SummariserConfig:
    model_name: str = "mistral-small-latest"
    temperature: float = 0.3
    chunk_size: int = 2000
    chunk_overlap: int = 200