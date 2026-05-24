import torch

WHISPER_MODEL_SIZE = "small"
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"