import json
import os
import re

import google.generativeai as genai

_api_key = os.environ.get("GEMINI_API_KEY")
if not _api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set")
genai.configure(api_key=_api_key)

_GEMINI_MODEL = "gemini-2.0-flash"

_SYSTEM_PROMPT = """\
You are the Rights Explainer for AdalatAI, a legal aid system for Pakistani citizens.
You will be given a classified legal problem. Your job is to explain the citizen's rights
under Pakistani law and return a structured JSON response.

Write at an 8th grade reading level. No legal jargon in plain-language fields.
Cite only real Pakistani laws and sections. Do not invent citations.
Refer to the citizen as "آپ" in Urdu and "you" in English.
Do NOT include any personally identifying information in your response.

Respond with ONLY valid JSON. No explanation outside the JSON block.

JSON schema:
{
  "rights_ur": "<plain-Urdu explanation of the citizen's rights, 3-6 sentences>",
  "rights_en": "<plain-English equivalent, 3-6 sentences>",
  "relevant_laws": ["<Law Name, Section X>", ...],
  "recommended_actions": ["<action>", ...],
  "lawyer_recommended": <true|false>
}\
"""

_LAWYER_ALWAYS_CATEGORIES = {"criminal", "domestic_violence", "child_custody"}
_LAWYER_ALWAYS_URGENCIES = {"high", "critical"}


class RightsExplainerAgent:
    def __init__(self):
        self._model = genai.GenerativeModel(
            model_name=_GEMINI_MODEL,
            system_instruction=_SYSTEM_PROMPT,
            generation_config={"max_output_tokens": 1024, "temperature": 0.2},
        )

    def run(self, case: dict) -> dict:
        result = case.copy()

        if case.get("classifier_status") != "success":
            result["rights_explainer_status"] = "skipped"
            result["skip_reason"] = "classifier did not succeed"
            return result

        user_message = self._build_user_message(case)

        try:
            response = self._model.generate_content(user_message)
            raw = response.text.strip()
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
            explanation = json.loads(raw)

            # Override lawyer_recommended with deterministic rule if rule fires
            if (
                case.get("urgency") in _LAWYER_ALWAYS_URGENCIES
                or case.get("legal_category") in _LAWYER_ALWAYS_CATEGORIES
            ):
                explanation["lawyer_recommended"] = True

            result.update(explanation)
            result["rights_explainer_status"] = "success"
        except Exception as exc:
            result["rights_explainer_status"] = "error"
            result["error_message"] = str(exc)

        return result

    @staticmethod
    def _build_user_message(case: dict) -> str:
        lines = [
            f"Legal category: {case.get('legal_category')}",
            f"Sub-issues: {', '.join(case.get('sub_issues', []))}",
            f"Urgency: {case.get('urgency')}",
            f"Province: {case.get('province') or 'Not specified'}",
            f"Problem summary (English): {case.get('summary_en', '')}",
        ]
        return "\n".join(lines)
