from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class CaseSubmit(BaseModel):
    problem_text: str = Field(..., min_length=10)
    language: str = Field(default="ur", pattern="^(ur|en)$")
    province: Optional[str] = None
    citizen_name: Optional[str] = Field(default=None, description="Encrypted at rest")
    contact: Optional[str] = Field(default=None, description="Phone or email — encrypted at rest")


class DeadlineOut(BaseModel):
    deadline_date: str
    description_en: str
    description_ur: str
    deadline_type: str
    priority: str


class CaseResult(BaseModel):
    case_id: str
    status: str

    # Classifier
    legal_category: Optional[str] = None
    sub_issues: Optional[List[str]] = None
    urgency: Optional[str] = None
    detected_language: Optional[str] = None
    confidence: Optional[float] = None
    summary_en: Optional[str] = None
    summary_ur: Optional[str] = None

    # Rights explainer
    rights_en: Optional[str] = None
    rights_ur: Optional[str] = None
    relevant_laws: Optional[List[str]] = None
    recommended_actions: Optional[List[str]] = None

    # Document drafter
    document_type: Optional[str] = None
    document_url: Optional[str] = None  # /api/cases/{id}/document — never a raw path

    # Lawyer assessment
    lawyer_needed: Optional[bool] = None
    lawyer_reason: Optional[str] = None
    referral_type: Optional[str] = None
    referral_note_en: Optional[str] = None
    referral_note_ur: Optional[str] = None

    # Deadlines
    deadlines: Optional[List[DeadlineOut]] = None

    # Pipeline
    pipeline_status: Optional[str] = None
    error_message: Optional[str] = None
