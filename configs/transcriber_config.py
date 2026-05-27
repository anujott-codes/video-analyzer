import torch

WHISPER_MODEL_SIZE = "small"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"