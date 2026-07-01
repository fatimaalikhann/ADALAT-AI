import json
import os
import re

import google.generativeai as genai

_api_key = os.environ.get("GEMINI_API_KEY")
if not _api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set")
genai.configure(api_key=_api_key)

_GEMINI_MODEL = "gemini-1.5-flash"

_SYSTEM_PROMPT = """\
You are the Problem Classifier for AdalatAI, a legal aid system for Pakistani citizens.
Your job is to read a citizen's legal problem and return a JSON classification.

Legal categories available:
family_law, labor, property, criminal, consumer, tenant,
inheritance, domestic_violence, child_custody, debt, police, other

Respond with ONLY valid JSON. No explanation outside the JSON block.

JSON schema:
{
  "legal_category": "<code>",
  "sub_issues": ["<issue1>", ...],
  "urgency": "<low|medium|high|critical>",
  "detected_language": "<ur|en|mixed>",
  "confidence": <0.0-1.0>,
  "summary_ur": "<Urdu summary at 8th grade level, no PII>",
  "summary_en": "<English summary, no PII>"
}\
"""


class ClassifierAgent:
    def __init__(self):
        self._model = genai.GenerativeModel(
            model_name=_GEMINI_MODEL,
            system_instruction=_SYSTEM_PROMPT,
            generation_config={"max_output_tokens": 512, "temperature": 0},
        )

    def run(self, case: dict) -> dict:
        result = case.copy()

        problem_text = case.get("problem_text", "")
        if not problem_text or len(problem_text.strip()) < 10:
            result["classifier_status"] = "error"
            result["error_message"] = "problem_text is empty or too short"
            return result

        user_message = (
            f"Province: {case.get('province') or 'Not specified'}\n\n"
            f"Problem:\n{problem_text}"
        )

        try:
            response = self._model.generate_content(user_message)
            raw = response.text.strip()
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
            classification = json.loads(raw)
            result.update(classification)
            result["classifier_status"] = "success"
        except Exception as exc:
            result["classifier_status"] = "error"
            result["error_message"] = str(exc)

        return result
