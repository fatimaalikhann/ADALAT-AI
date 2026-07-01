import asyncio
import json
import logging
import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException

logger = logging.getLogger("adalat.cases")

from api.crypto import decrypt_json, decrypt_str, encrypt
from api.db import get_pool
from api.models import CaseResult, CaseSubmit, DeadlineOut
from orchestrator import AdalatPipeline

router = APIRouter()

# One shared pipeline — agents initialise their Anthropic clients once at startup
_pipeline = AdalatPipeline()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _db_status(result: dict) -> str:
    """Map pipeline result to the cases.status enum value."""
    if result.get("pipeline_status") == "complete":
        return "complete"
    for agent_status, db_value in [
        ("deadline_tracker_status", "deadlines_set"),
        ("lawyer_assessment_status", "assessed"),
        ("document_drafter_status", "document_drafted"),
        ("rights_explainer_status", "rights_explained"),
        ("classifier_status",       "classifying"),
    ]:
        if result.get(agent_status) == "success":
            return db_value
    return "error"


def _to_response(result: dict) -> CaseResult:
    doc_url = (
        f"/api/cases/{result['case_id']}/document"
        if result.get("document_path") else None
    )
    raw_deadlines = result.get("deadlines") or []
    deadlines = [DeadlineOut(**dl) for dl in raw_deadlines] or None

    return CaseResult(
        case_id=result["case_id"],
        status=result.get("pipeline_status", "error"),
        legal_category=result.get("legal_category"),
        sub_issues=result.get("sub_issues"),
        urgency=result.get("urgency"),
        detected_language=result.get("detected_language"),
        confidence=result.get("confidence"),
        summary_en=result.get("summary_en"),
        summary_ur=result.get("summary_ur"),
        rights_en=result.get("rights_en"),
        rights_ur=result.get("rights_ur"),
        relevant_laws=result.get("relevant_laws"),
        recommended_actions=result.get("recommended_actions"),
        document_type=result.get("document_type"),
        document_url=doc_url,
        lawyer_needed=result.get("lawyer_needed"),
        lawyer_reason=result.get("lawyer_reason"),
        referral_type=result.get("referral_type"),
        referral_note_en=result.get("referral_note_en"),
        referral_note_ur=result.get("referral_note_ur"),
        deadlines=deadlines,
        pipeline_status=result.get("pipeline_status"),
        error_message=result.get("error_message"),
    )


async def _persist(result: dict, body: CaseSubmit) -> None:
    """Write all results to cases_db in a single transaction."""
    pool = await get_pool()
    case_id = uuid.UUID(result["case_id"])

    # Encrypt PII fields
    problem_enc   = encrypt(body.problem_text)
    name_enc      = encrypt(body.citizen_name) if body.citizen_name else None
    contact_enc   = encrypt(body.contact)      if body.contact      else None

    # Encrypt structured pipeline outputs
    clf_enc = None
    if result.get("classifier_status") == "success":
        clf_enc = encrypt({k: result.get(k) for k in [
            "legal_category", "sub_issues", "urgency", "detected_language",
            "confidence", "summary_en", "summary_ur", "document_type",
        ]})

    rights_enc = None
    if result.get("rights_explainer_status") == "success":
        rights_enc = encrypt({k: result.get(k) for k in [
            "rights_en", "rights_ur", "relevant_laws", "recommended_actions",
            "referral_type", "referral_note_en", "referral_note_ur",
        ]})

    lawyer_reason_enc = encrypt(result["lawyer_reason"]) if result.get("lawyer_reason") else None
    deadlines_enc     = encrypt(result["deadlines"])     if result.get("deadlines")     else None

    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                INSERT INTO cases (
                    id, problem_text_enc, language, province,
                    citizen_name_enc, contact_enc,
                    classification_enc, rights_summary_enc,
                    document_path, lawyer_needed, lawyer_reason_enc,
                    deadlines_enc, status
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
                """,
                case_id,
                problem_enc, body.language, body.province,
                name_enc, contact_enc,
                clf_enc, rights_enc,
                result.get("document_path"),
                result.get("lawyer_needed"),
                lawyer_reason_enc, deadlines_enc,
                _db_status(result),
            )

            await conn.execute(
                """
                INSERT INTO case_audit_log (case_id, event, agent_name, meta)
                VALUES ($1, 'pipeline_complete', 'orchestrator', $2)
                """,
                case_id,
                json.dumps({
                    "pipeline_status":        result.get("pipeline_status"),
                    "classifier_status":      result.get("classifier_status"),
                    "document_drafter_status":result.get("document_drafter_status"),
                    "analytics_status":       result.get("analytics_status"),
                }),
            )

            # Individual deadline rows for calendar/reminder queries
            for dl in result.get("deadlines") or []:
                try:
                    dl_date = date.fromisoformat(dl["deadline_date"])
                except (KeyError, ValueError):
                    continue
                dl_enc = encrypt({
                    "description_en": dl["description_en"],
                    "description_ur": dl["description_ur"],
                    "deadline_type":  dl["deadline_type"],
                    "priority":       dl["priority"],
                })
                await conn.execute(
                    """
                    INSERT INTO deadlines (case_id, deadline_date, description_enc)
                    VALUES ($1, $2, $3)
                    """,
                    case_id, dl_date, dl_enc,
                )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/cases", response_model=CaseResult, status_code=201)
async def submit_case(body: CaseSubmit) -> CaseResult:
    """
    Submit a legal problem. Runs the full 6-agent pipeline and returns the
    complete result: classification, rights, PDF document URL, lawyer assessment,
    and deadline list.
    """
    case = {
        "case_id":      str(uuid.uuid4()),
        "problem_text": body.problem_text,
        "language":     body.language,
        "province":     body.province,
    }
    # Run synchronous pipeline without blocking the event loop
    result = await asyncio.to_thread(_pipeline.run, case)
    try:
        await _persist(result, body)
    except Exception as exc:
        logger.error("_persist failed for case_id=%s: %s", case["case_id"], exc)
    return _to_response(result)


@router.get("/cases/{case_id}", response_model=CaseResult)
async def get_case(case_id: str) -> CaseResult:
    """Retrieve a previously submitted case by ID."""
    try:
        uid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case_id")

    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT * FROM cases WHERE id = $1 AND deleted_at IS NULL", uid
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Case not found")

    clf    = decrypt_json(row["classification_enc"])  if row["classification_enc"]  else {}
    rights = decrypt_json(row["rights_summary_enc"])  if row["rights_summary_enc"]  else {}
    dls    = decrypt_json(row["deadlines_enc"])        if row["deadlines_enc"]        else []
    lawyer_reason = decrypt_str(row["lawyer_reason_enc"]) if row["lawyer_reason_enc"] else None

    deadlines = [DeadlineOut(**dl) for dl in dls] or None
    doc_url   = f"/api/cases/{case_id}/document" if row["document_path"] else None

    return CaseResult(
        case_id=case_id,
        status=row["status"],
        legal_category=clf.get("legal_category"),
        sub_issues=clf.get("sub_issues"),
        urgency=clf.get("urgency"),
        detected_language=clf.get("detected_language"),
        confidence=clf.get("confidence"),
        summary_en=clf.get("summary_en"),
        summary_ur=clf.get("summary_ur"),
        rights_en=rights.get("rights_en"),
        rights_ur=rights.get("rights_ur"),
        relevant_laws=rights.get("relevant_laws"),
        recommended_actions=rights.get("recommended_actions"),
        document_type=clf.get("document_type"),
        document_url=doc_url,
        lawyer_needed=row["lawyer_needed"],
        lawyer_reason=lawyer_reason,
        referral_type=rights.get("referral_type"),
        referral_note_en=rights.get("referral_note_en"),
        referral_note_ur=rights.get("referral_note_ur"),
        deadlines=deadlines,
        pipeline_status=row["status"],
    )
