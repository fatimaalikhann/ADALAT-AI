import json
import os
import re
from datetime import date

import google.generativeai as genai

_api_key = os.environ.get("GEMINI_API_KEY")
if not _api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set")
genai.configure(api_key=_api_key)

_GEMINI_MODEL = "gemini-1.5-flash-latest"

_SYSTEM_PROMPT = """\
You are the Deadline Tracker for AdalatAI, a legal aid system for Pakistani citizens.
You will be given a classified legal case. Your job is to identify every legally relevant
deadline that applies and return them as a structured JSON list.

Rules:
- Use Pakistani law. Calculate absolute dates from the "Today's date" provided.
- Return 2-5 deadlines. Include both urgent filing windows AND longer limitation periods.
- If a deadline may already be at risk, say so clearly in the description.
- Descriptions must be plain language — no jargon. One sentence each.
- Write description_ur at 8th grade reading level. No PII in any field.

Respond with ONLY valid JSON. No explanation outside the JSON block.

JSON schema:
{
  "deadlines": [
    {
      "deadline_date": "YYYY-MM-DD",
      "description_en": "<one sentence, plain English, no PII>",
      "description_ur": "<one sentence, plain Urdu, 8th grade, no PII>",
      "deadline_type": "<filing|limitation|notice|administrative|hearing>",
      "priority": "<urgent|important|informational>"
    }
  ]
}\
"""

_DEADLINE_CONTEXT = {
    "labor": (
        "Key deadlines: NIRC unfair labour practice complaint within 30 days of the act; "
        "wage recovery complaint within 12 months of last unpaid date; "
        "reinstatement application within 30 days of termination."
    ),
    "family_law": (
        "Key deadlines: NADRA divorce registration within 90 days of talaq pronouncement; "
        "Khula decree service within 30 days."
    ),
    "property": (
        "Key deadlines: civil suit for possession has a 12-year limitation period; "
        "legal notice typically requires a 15–30 day response window."
    ),
    "criminal": (
        "Key deadlines: FIR should be filed immediately — delay weakens the case; "
        "private complaint to magistrate within 6 months for bailable offences."
    ),
    "consumer": (
        "Key deadlines: Consumer Protection Council complaint within 30 days (urgent) "
        "or 60 days (general) of the grievance."
    ),
    "tenant": (
        "Key deadlines: minimum 30-day notice to vacate must be served; "
        "Rent Controller application within 30 days of dispute arising."
    ),
    "inheritance": (
        "Key deadlines: succession certificate application has no hard limit but 6 months "
        "is conventional; estate challenge limitation period is 12 years."
    ),
    "domestic_violence": (
        "Key deadlines: emergency protection order application must be filed immediately; "
        "follow-up Protection Order application within 7 days of emergency order."
    ),
    "child_custody": (
        "Key deadlines: interim custody application immediately if child is at risk; "
        "no hard limitation period but urgency is critical."
    ),
    "debt": (
        "Key deadlines: civil suit for contract debt within 3 years of due date; "
        "cheque dishonour complaint within 30 days of dishonour."
    ),
    "police": (
        "Key deadlines: complaint to SSP/DIG if FIR is refused within 7 days; "
        "Anti-Corruption complaint within 60 days."
    ),
    "other": (
        "Key deadlines: general civil suit limitation period is 3 years; "
        "administrative appeal typically within 30 days."
    ),
}


class DeadlineTrackerAgent:
    def __init__(self):
        self._model = genai.GenerativeModel(
            model_name=_GEMINI_MODEL,
            system_instruction=_SYSTEM_PROMPT,
            generation_config={"max_output_tokens": 1024, "temperature": 0},
        )

    def run(self, case: dict) -> dict:
        result = case.copy()

        if case.get("lawyer_assessment_status") != "success":
            result["deadline_tracker_status"] = "skipped"
            result["skip_reason"] = "lawyer assessment did not succeed"
            return result

        user_message = self._build_user_message(case)

        try:
            response = self._model.generate_content(user_message)
            raw = response.text.strip()
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
            output = json.loads(raw)

            deadlines = output.get("deadlines", [])
            # Enforce priority based on calculated date proximity
            today = date.today()
            for dl in deadlines:
                try:
                    dl_date = date.fromisoformat(dl["deadline_date"])
                    days_away = (dl_date - today).days
                    if days_away <= 14:
                        dl["priority"] = "urgent"
                    elif days_away <= 90:
                        dl["priority"] = "important"
                    else:
                        dl["priority"] = "informational"
                except (KeyError, ValueError):
                    pass

            # Sort: soonest first
            deadlines.sort(key=lambda d: d.get("deadline_date", "9999-12-31"))

            result["deadlines"] = deadlines
            result["deadline_tracker_status"] = "success"
            result["pipeline_status"] = "complete"
        except Exception as exc:
            result["deadline_tracker_status"] = "error"
            result["error_message"] = str(exc)

        return result

    @staticmethod
    def _build_user_message(case: dict) -> str:
        category = case.get("legal_category", "other")
        deadline_context = _DEADLINE_CONTEXT.get(category, _DEADLINE_CONTEXT["other"])
        laws = "\n".join(f"  - {law}" for law in case.get("relevant_laws", []))

        return (
            f"Today's date: {date.today().isoformat()}\n"
            f"Legal category: {category}\n"
            f"Sub-issues: {', '.join(case.get('sub_issues', []))}\n"
            f"Urgency: {case.get('urgency')}\n"
            f"Province: {case.get('province') or 'Not specified'}\n"
            f"Problem summary: {case.get('summary_en', '')}\n"
            f"Relevant laws:\n{laws}\n"
            f"Deadline guidance for this category: {deadline_context}"
        )
