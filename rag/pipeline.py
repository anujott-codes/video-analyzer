from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
import os

from rag.chunker import TranscriptChunker
from rag.embedder import Embedder
from rag.vector_store import VectorStoreManager

from configs.pipeline_config import PipelineConfig
from logger.logger import get_logger

from dotenv import load_dotenv

load_dotenv()
logger = get_logger(__name__)

class RAGPipeline:

    def __init__(self, config: PipelineConfig = PipelineConfig()):
        self.config = config
        self.chunker = TranscriptChunker()
        self.embedder = Embedder()
        self.embeddings = self.embedder.load_embeddings()
        self.vector_store = VectorStoreManager(embedding_function=self.embeddings)
        self.model = self._load_model(config)
        self.chain = self._build_rag_chain()

    def _load_model(self, model_config: PipelineConfig):
        try:
            logger.info(f"Loading Mistral model: {model_config.model_name}")

            api_key = os.getenv("MISTRAL_API_KEY")

            if not api_key:
                raise ValueError("MISTRAL_API_KEY environment variable is not set")

            model = ChatMistralAI(
                model=model_config.model_name,
                temperature=model_config.temperature,
                api_key=api_key
            )

            logger.info("Mistral model loaded successfully")
            return model
        
        except Exception as e:
            logger.exception("Failed to initialize Mistral model")
            raise RuntimeError(
                f"Failed to initialize Mistral model '{model_config.model_name}': {e}"
            )

    def reset_vectorstore(self):
        """Delete the existing collection and re-create a fresh vectorstore + chain."""
        try:
            logger.info("Resetting vectorstore — deleting existing collection")
            self.vector_store.delete_collection()

            # Re-create the VectorStoreManager so the collection exists again
            self.vector_store = VectorStoreManager(embedding_function=self.embeddings)

            # Rebuild the RAG chain with the new retriever reference
            self.chain = self._build_rag_chain()

            logger.info("Vectorstore reset complete")

        except Exception as e:
            logger.exception("Failed to reset vectorstore")
            raise RuntimeError(f"Vectorstore reset failed: {e}")

    def process_transcript(self, transcript: str):
        try:
            chunks = self.chunker.split_transcript(transcript)

            if not chunks:
                logger.warning("No transcript chunks generated")
                return

            self.vector_store.add_documents(chunks)

            logger.info(f"Stored {len(chunks)} transcript chunks")

        except Exception as e:
            logger.exception("Failed to process transcript")
            raise RuntimeError(f"Transcript processing failed: {e}")

    def _format_docs(self, docs):
        try:
            return "\n\n".join(doc.page_content for doc in docs)

        except Exception as e:
            logger.exception("Failed to format documents")
            raise RuntimeError(f"Document formatting failed: {e}")

    def _build_rag_chain(self):
        prompt = ChatPromptTemplate.from_messages([
    (
        "system",
"""
You are an expert AI meeting assistant.

Answer the user's question only from the provided transcript context.

Rules:
- Do not use external knowledge.
- If the answer is not in the context, say:
"I could not find this information in the transcript."
- If unsure, do not guess.
- Keep answers concise and accurate.
- Clearly mention speakers when quoting them.

Context:
{context}
"""),
    ("human", "{question}"),
])

        rag_chain = (
            {
                "context": self.vector_store.get_retriever() | RunnableLambda(self._format_docs),
                "question": RunnablePassthrough()
            } | prompt | self.model | StrOutputParser()
        )

        return rag_chain
    
    def answer_question(self, question: str) -> str:
        try:
            logger.info(f"Answering question: {question}")

            response = self.chain.invoke(question)

            return response

        except Exception as e:
            logger.exception("Failed to answer question")
            raise RuntimeError(f"Question answering failed: {e}")