from langchain_huggingface import HuggingFaceEmbeddings
from configs.embedder_config import EmbedderConfig


class Embedder:
    def __init__(self, config: EmbedderConfig = EmbedderConfig()):
        self.config = config

    def load_embeddings(self):

        embeddings = HuggingFaceEmbeddings(
            model_name=self.config.model_name
        )

        return embeddings