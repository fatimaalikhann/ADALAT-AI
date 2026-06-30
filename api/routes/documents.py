import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from api.db import get_pool

router = APIRouter()


@router.get("/cases/{case_id}/document")
async def download_document(case_id: str) -> FileResponse:
    """Download the generated PDF for a completed case."""
    try:
        uid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case_id")

    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT document_path FROM cases WHERE id = $1 AND deleted_at IS NULL", uid
    )

    if row is None:
        raise HTTPException(status_code=404, detail="Case not found")
    if not row["document_path"]:
        raise HTTPException(status_code=404, detail="Document not yet generated for this case")

    return FileResponse(
        path=row["document_path"],
        media_type="application/pdf",
        filename=f"adalat-{case_id[:8]}.pdf",
    )
