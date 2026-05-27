from dataclasses import dataclass

@dataclass
class VectorStoreConfig:
    persist_directory: str = "vectorstore/db"
    collection_name: str = "transcript_embeddings"
    search_type: str = "mmr"
    k: int = 4
    fetch_k: int = 20
