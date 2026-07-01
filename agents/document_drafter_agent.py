import json
import os
import re
from datetime import date
from glob import glob

from google import genai
from google.genai import types
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

_api_key = os.environ.get("GEMINI_API_KEY")
if not _api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set")
_client = genai.Client(api_key=_api_key)

_GEMINI_MODEL = "gemini-1.5-flash"

_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_DOCUMENTS_DIR = os.path.join(_PROJECT_ROOT, "documents")
_FONTS_DIR = os.path.join(_PROJECT_ROOT, "fonts")

_DOCUMENT_TYPE_MAP = {
    "labor": "Labour Court Complaint",
    "family_law": "Family Court Application",
    "property": "Legal Notice — Property Dispute",
    "criminal": "FIR Draft",
    "consumer": "Consumer Court Complaint",
    "tenant": "Tenancy Dispute Notice",
    "inheritance": "Succession Certificate Application",
    "domestic_violence": "Protection Order Application",
    "child_custody": "Child Custody Application",
    "debt": "Debt Recovery Notice",
    "police": "Complaint to Senior Police Officer",
    "other": "General Legal Complaint Letter",
}

_SYSTEM_PROMPT = """\
You are the Document Drafter for AdalatAI, a legal aid system for Pakistani citizens.
You will be given a classified and explained legal problem. Draft a formal legal document
that the citizen can submit to the relevant authority.

Rules:
- Use formal legal language in the English body.
- Use clear, accessible Urdu in the Urdu body (8th grade level).
- Reference the provided laws by name and section.
- Use ONLY these placeholders for personal details — do not invent any:
    [YOUR FULL NAME], [YOUR ADDRESS], [YOUR CONTACT NUMBER],
    [DATE OF INCIDENT], [RESPONDENT NAME]
- Do NOT include any real personal information.

Respond with ONLY valid JSON. No explanation outside the JSON block.

JSON schema:
{
  "document_type": "<human-readable type>",
  "subject_en": "<one-line English subject>",
  "subject_ur": "<one-line Urdu subject>",
  "body_en": "<full formal English document, 3-6 paragraphs>",
  "body_ur": "<full accessible Urdu document, 3-6 paragraphs>"
}\
"""

_FOOTER = (
    "This document was drafted by AdalatAI, an automated legal aid system. "
    "It is a template only and does not constitute legal advice. "
    "Fill in the bracketed placeholders before submitting. "
    "For urgent matters, consult a qualified lawyer."
)


def _try_register_urdu_font() -> str | None:
    """Return the registered font name if an Urdu TTF is found, else None."""
    preferred = ["NotoNastaliqUrdu-Regular.ttf", "Amiri-Regular.ttf"]
    candidates = preferred + [
        os.path.basename(p) for p in glob(os.path.join(_FONTS_DIR, "*.ttf"))
        if os.path.basename(p) not in preferred
    ]
    for filename in candidates:
        path = os.path.join(_FONTS_DIR, filename)
        if os.path.exists(path):
            font_name = os.path.splitext(filename)[0]
            try:
                pdfmetrics.registerFont(TTFont(font_name, path))
                return font_name
            except Exception:
                continue
    return None


def _reshape_urdu(text: str) -> str:
    """Reshape and apply bidi algorithm for correct Urdu display in PDFs."""
    try:
        import arabic_reshaper
        from bidi.algorithm import get_display
        return get_display(arabic_reshaper.reshape(text))
    except Exception:
        return text


def _build_pdf(case_id: str, doc_content: dict, urdu_font: str | None) -> str:
    os.makedirs(_DOCUMENTS_DIR, exist_ok=True)
    output_path = os.path.join(_DOCUMENTS_DIR, f"{case_id}.pdf")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=inch,
        rightMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )

    styles = getSampleStyleSheet()

    style_title = ParagraphStyle(
        "AdalatTitle",
        parent=styles["Heading1"],
        fontSize=16,
        textColor=colors.HexColor("#1a237e"),
        spaceAfter=4,
    )
    style_sub = ParagraphStyle(
        "AdalatSub",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#555555"),
        spaceAfter=2,
    )
    style_body = ParagraphStyle(
        "AdalatBody",
        parent=styles["Normal"],
        fontSize=11,
        leading=16,
        spaceAfter=8,
    )
    style_footer = ParagraphStyle(
        "AdalatFooter",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.HexColor("#777777"),
        leading=12,
    )
    style_urdu = ParagraphStyle(
        "AdalatUrdu",
        parent=styles["Normal"],
        fontName=urdu_font or "Helvetica",
        fontSize=12,
        leading=20,
        alignment=2,  # right-align for RTL
        spaceAfter=8,
    )

    story = []

    # Header
    story.append(Paragraph("AdalatAI — Legal Aid System", style_title))
    story.append(Paragraph(doc_content.get("document_type", "Legal Document"), style_sub))
    story.append(Paragraph(f"Date: {date.today().strftime('%d %B %Y')}", style_sub))
    story.append(Paragraph(f"Case Reference: {case_id}", style_sub))
    story.append(Spacer(1, 0.15 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1a237e")))
    story.append(Spacer(1, 0.15 * inch))

    # Subject
    story.append(Paragraph(f"<b>Subject:</b> {doc_content.get('subject_en', '')}", style_body))
    story.append(Spacer(1, 0.1 * inch))

    # English body — split on double newlines to preserve paragraphs
    for para in doc_content.get("body_en", "").split("\n\n"):
        para = para.strip()
        if para:
            story.append(Paragraph(para.replace("\n", "<br/>"), style_body))

    story.append(Spacer(1, 0.2 * inch))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc")))
    story.append(Spacer(1, 0.2 * inch))

    # Urdu body
    if urdu_font:
        urdu_subject = _reshape_urdu(doc_content.get("subject_ur", ""))
        story.append(Paragraph(urdu_subject, style_urdu))
        story.append(Spacer(1, 0.1 * inch))
        for para in doc_content.get("body_ur", "").split("\n\n"):
            para = para.strip()
            if para:
                story.append(Paragraph(_reshape_urdu(para), style_urdu))
    else:
        story.append(
            Paragraph(
                "[Urdu version available — add an Urdu font to the fonts/ directory]",
                style_footer,
            )
        )

    story.append(Spacer(1, 0.3 * inch))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc")))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(_FOOTER, style_footer))

    doc.build(story)
    return output_path


class DocumentDrafterAgent:
    def __init__(self):
        self._config = types.GenerateContentConfig(
            system_instruction=_SYSTEM_PROMPT,
            max_output_tokens=2048,
            temperature=0.1,
        )
        self._urdu_font = _try_register_urdu_font()

    def run(self, case: dict) -> dict:
        result = case.copy()

        if case.get("rights_explainer_status") != "success":
            result["document_drafter_status"] = "skipped"
            result["skip_reason"] = "rights explainer did not succeed"
            return result

        user_message = self._build_user_message(case)

        try:
            response = _client.models.generate_content(
                model=_GEMINI_MODEL, contents=user_message, config=self._config
            )
            raw = response.text.strip()
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
            doc_content = json.loads(raw)

            output_path = _build_pdf(case["case_id"], doc_content, self._urdu_font)

            result["document_type"] = doc_content.get(
                "document_type",
                _DOCUMENT_TYPE_MAP.get(case.get("legal_category", ""), "Legal Document"),
            )
            result["document_path"] = output_path
            result["document_drafter_status"] = "success"
        except Exception as exc:
            result["document_drafter_status"] = "error"
            result["error_message"] = str(exc)

        return result

    @staticmethod
    def _build_user_message(case: dict) -> str:
        doc_type = _DOCUMENT_TYPE_MAP.get(case.get("legal_category", "other"), "General Legal Complaint Letter")
        laws = "\n".join(f"  - {law}" for law in case.get("relevant_laws", []))
        actions = "\n".join(f"  - {a}" for a in case.get("recommended_actions", []))
        return (
            f"Document type to draft: {doc_type}\n"
            f"Legal category: {case.get('legal_category')}\n"
            f"Sub-issues: {', '.join(case.get('sub_issues', []))}\n"
            f"Province: {case.get('province') or 'Not specified'}\n"
            f"Problem summary (English): {case.get('summary_en', '')}\n"
            f"Relevant laws:\n{laws}\n"
            f"Recommended actions:\n{actions}"
        )
