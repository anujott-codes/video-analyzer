from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from configs.chunker_config import ChunkerConfig


class TranscriptChunker:

    def __init__(self, config: ChunkerConfig = ChunkerConfig()):
        self.config = config

        self.text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
            chunk_size=self.config.chunk_size,
            chunk_overlap=self.config.chunk_overlap
        )

    def split_transcript(self, transcript: str) -> list[Document]:

        chunks = self.text_splitter.split_text(transcript)

        documents = [
            Document(
                page_content=chunk,
                metadata = {"chunk_index": i+1}
            )
            for i,chunk in enumerate(chunks)
        ]

        return documents