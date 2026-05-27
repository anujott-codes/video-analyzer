from fastapi import APIRouter, HTTPException

from backend.schemas.extract import ExtractRequest, ExtractResponse
from backend.services.extract import run_extraction

router = APIRouter(tags=["extract"])


@router.post("/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest):
    """Extract action items, decisions, and open questions from a transcript."""
    try:
        result = run_extraction(req.transcript)
        return ExtractResponse(**result)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Extraction failed: {exc}",
        )
