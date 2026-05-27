from dataclasses import dataclass

@dataclass
class PipelineConfig:
    model_name: str = "mistral-small-latest"
    temperature: float = 0.3
