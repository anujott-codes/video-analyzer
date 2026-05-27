from langchain_chroma import Chroma

from configs.vector_store_config import VectorStoreConfig
from logger.logger import get_logger

logger = get_logger(__name__)


class VectorStoreManager:

    def __init__(self, embedding_function, config: VectorStoreConfig = VectorStoreConfig()):
        self.config = config
        self.embedding_function = embedding_function

        self.vectordb = Chroma(
            collection_name=self.config.collection_name,
            persist_directory=self.config.persist_directory,
            embedding_function=self.embedding_function
        )

    def add_documents(self, documents):
        self.vectordb.add_documents(documents)
        logger.info(f"Stored {len(documents)} documents in vector DB")

    def get_retriever(self, search_type: str | None = None, k: int | None = None, fetch_k: int | None = None):
        if search_type is None:
            search_type = self.config.search_type
        if k is None:
            k = self.config.k
        if fetch_k is None:
            fetch_k = self.config.fetch_k

        return self.vectordb.as_retriever(
            search_type=search_type,
            search_kwargs={
                "k": k,
                "fetch_k": fetch_k
            }
        )

    def delete_collection(self):
        self.vectordb.delete_collection()