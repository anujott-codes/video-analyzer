from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnableSequence
from dotenv import load_dotenv
import os

from logger.logger import get_logger
from configs.extractor_config import ExtractorConfig

load_dotenv()
logger = get_logger(__name__)

class Extractor:
    def __init__(self, model_config: ExtractorConfig = ExtractorConfig()):
        logger.info("Initializing Extractor")
        self.config = model_config
        self.model = self._load_model(model_config)

    def _load_model(self, model_config: ExtractorConfig):
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
        
    def _build_chain(self, system_prompt: str) -> RunnableSequence:
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{input}")
            ]
        )

        return prompt | self.model | StrOutputParser()
    
    def _extract(self, transcript: str, map_prompt: str, reduce_prompt: str) -> str:
        try:
            logger.info("Starting extraction pipeline")

            map_chain = self._build_chain(map_prompt)

            chunks = self.split_transcript(transcript)

            logger.info("Running map extraction on transcript chunks")

            chunks_results = [
                map_chain.invoke({"input": chunk})
                for chunk in chunks
            ]

            combined = "\n".join(chunks_results)

            logger.info("Running reduce extraction")

            reduce_chain = self._build_chain(reduce_prompt)

            final_result = reduce_chain.invoke({"input": combined})

            logger.info("Extraction completed successfully")

            return final_result

        except Exception as e:
            logger.exception("Error during extraction pipeline")
            raise RuntimeError(f"Failed to extract information: {e}")

    
    def extract_action_items(self, transcript: str) -> str:
        map_system_prompt = """
        You are an expert analyst. From the transcript, extract all action items.

        For each action item provide:
        - Task description
        - Owner (who is responsible)
        - Deadline (if mentioned, else write 'Not specified')

        Format as a numbered list.
        If no action items are found, return 'No action items found.'
        """
        
        reduce_system_prompt = """
        You are an expert meeting analyst.

        You will receive multiple extracted action item lists from different transcript chunks.

        Your tasks:
        - Combine all action items into one final list
        - Remove duplicates
        - Merge similar action items
        - Keep the wording clear and professional
        - Preserve owner and deadline information when available

        Format as a numbered list.

        If no valid action items are found, return 'No action items found.'
        """

        return self._extract(transcript, map_system_prompt, reduce_system_prompt)
    
    def extract_decisions(self, transcript: str) -> str:
        map_system_prompt = """
        You are an expert analyst. From the transcript, extract all decisions made during the meeting.

        Format as a numbered list.
        If no decisions are found, return 'No decisions found.'
        """
        
        reduce_system_prompt = """
        You are an expert meeting analyst. You will receive multiple extracted decision lists from different transcript chunks.

        Your tasks:
        - Combine all decisions into one final list
        - Remove duplicates
        - Merge similar decisions
        - Keep the wording clear and professional
        - Preserve participant and rationale information when available

        Format as a numbered list.
        If no valid decisions are found, return 'No decisions found.'
        """

        return self._extract(transcript, map_system_prompt, reduce_system_prompt)
    
    def extract_questions(self, transcript: str) -> str:
        map_system_prompt = """
        You are an expert analyst. From the transcript, extract all unsolved questions or topics needing follow up.

        Format as a numbered list.
        If no questions are found, return 'No questions found.'
        """

        reduce_system_prompt = """
        You are an expert meeting analyst. You will receive multiple extracted question lists from different transcript chunks.

        Your tasks:
        - Combine all questions into one final list
        - Remove duplicates
        - Merge similar questions
        - Keep the wording clear and professional
        - Preserve asker and context information when available

        Format as a numbered list.
        If no valid questions are found, return 'No questions found.'
        """

        return self._extract(transcript, map_system_prompt, reduce_system_prompt)
    
    def extract(self, transcript: str) -> dict[str, str]:
        return {
            "action_items": self.extract_action_items(transcript),
            "decisions": self.extract_decisions(transcript),
            "questions": self.extract_questions(transcript)
        }