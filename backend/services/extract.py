from chains.extract import Extractor


def run_extraction(transcript: str) -> dict:
    extractor = Extractor()
    return extractor.extract(transcript)
