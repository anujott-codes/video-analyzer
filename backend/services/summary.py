from chains.summarise import Summarizer


def run_summary(transcript: str) -> dict:
    summarizer = Summarizer()
    title, summary = summarizer.summarize(transcript)
    return {"title": title, "summary": summary}
