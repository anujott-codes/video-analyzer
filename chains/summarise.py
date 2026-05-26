from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

from logger.logger import get_logger
from configs.summariser_config import SummariserConfig

import os

logger = get_logger(__name__)
load_dotenv()

class Summarizer:
    def __init__(self, model_config: SummariserConfig = SummariserConfig()):
        logger.info("Initializing SummarisationChain")
        self.config = model_config
        self.model = self._load_model(model_config)

    def _load_model(self, model_config: SummariserConfig):
        try:
            logger.info(f"Loading Mistral model: {model_config.model_name}")

            api_key = os.getenv("MISTRAL_API_KEY")

            if not api_key:
                logger.error("MISTRAL_API_KEY environment variable is not set")
                raise ValueError("MISTRAL_API_KEY environment variable is not set")

            model = ChatMistralAI(
                model=model_config.model_name,
                temperature=model_config.temperature,
                api_key=api_key
            )

            logger.info("Mistral model loaded successfully")
            return model

        except ValueError as ve:
            logger.exception("Configuration error while loading Mistral model")
            raise ValueError(f"Configuration error while loading Mistral model: {ve}")

        except Exception as e:
            logger.exception("Unexpected error while initializing Mistral model")
            raise RuntimeError(
                f"Failed to initialize Mistral model: '{model_config.model_name}': {e}"
            )

    def split_transcript(self,transcript: str,chunk_size: int | None = None, chunk_overlap: int | None = None) -> list[str]:
        if chunk_size is None:
            chunk_size = self.config.chunk_size

        if chunk_overlap is None:
            chunk_overlap = self.config.chunk_overlap

        logger.info(f"Splitting transcript with chunk_size={chunk_size}, chunk_overlap={chunk_overlap}")

        try:
            splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
                encoding_name="cl100k_base",
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )

            chunks = splitter.split_text(transcript)

            logger.info(f"Transcript split into {len(chunks)} chunks")

            return chunks

        except Exception as e:
            logger.exception("Error while splitting transcript")
            raise RuntimeError(f"Failed to split transcript: {e}")
    
    def generate_summary(self, transcript: str) -> str:
        try:
            logger.info("Starting transcript summarization")

            map_prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a helpful assistant that summarizes video transcripts."),
                ("human", "Summarize the following transcript:\n{chunk}")
            ])

            map_chain = map_prompt | self.model | StrOutputParser()
       
            chunks = self.split_transcript(
                transcript,
                self.config.chunk_size,
                self.config.chunk_overlap
            )

            logger.info("Generating chunk summaries")

            chunk_summaries = [
                map_chain.invoke({"chunk": chunk})
                for chunk in chunks
            ]

            combined = "\n".join(chunk_summaries)

            logger.info("Combining chunk summaries")

            combined_prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert summarizer. Combine these partial summaries into one final professional summary in bullet points."),
                ("human", "Here are the partial summaries:\n{combined}")
            ])

            combined_chain = combined_prompt | self.model | StrOutputParser()

            final_summary = combined_chain.invoke({"combined": combined})

            logger.info("Summarization completed successfully")

            return final_summary

        except Exception as e:
            logger.exception("Error during summarization")
            raise RuntimeError(f"Failed to summarize transcript: {e}")
        
    def generate_title(self, summary: str) -> str:
        try:
            logger.info("Starting title generation")

            title_prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a creative assistant that generates concise and catchy titles for video summaries."),
                ("human", "Generate a title for the following summary:\n{summary}")
            ])

            title_chain = title_prompt | self.model | StrOutputParser()
            title = title_chain.invoke({"summary": summary})
            logger.info("Title generation completed successfully")
            return title
        
        except Exception as e:
            logger.exception("Error during title generation")
            raise RuntimeError(f"Failed to generate title: {e}")
        
    def summarize(self, transcript: str) -> tuple[str, str]:
        try:
            summary = self.generate_summary(transcript)
            title = self.generate_title(summary)
            return title, summary
        except Exception as e:
            logger.exception("Error during summarization process")
            raise RuntimeError(f"Failed to summarize transcript: {e}")