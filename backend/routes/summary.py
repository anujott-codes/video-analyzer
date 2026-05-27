from fastapi import APIRouter, HTTPException

from backend.schemas.summary import SummaryRequest, SummaryResponse
from backend.services.summary import run_summary

router = APIRouter(tags=["summary"])


@router.post("/summary", response_model=SummaryResponse)
def summarize(req: SummaryRequest):
    try:
        result = run_summary(req.transcript)
        return SummaryResponse(**result)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {exc}",
        )
