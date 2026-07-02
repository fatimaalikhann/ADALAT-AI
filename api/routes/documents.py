import os
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

# Matches the path used by document_drafter_agent.py
_DOCUMENTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "documents")
)


@router.get("/cases/{case_id}/document")
async def download_document(case_id: str) -> FileResponse:
    """Download the generated PDF for a completed case."""
    try:
        uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case_id")

    doc_path = os.path.join(_DOCUMENTS_DIR, f"{case_id}.pdf")
    if not os.path.isfile(doc_path):
        raise HTTPException(
            status_code=404,
            detail="Document not found. It may not have been generated yet, or the server restarted.",
        )

    return FileResponse(
        path=doc_path,
        media_type="application/pdf",
        filename=f"adalat-{case_id[:8]}.pdf",
    )
