import json
import os
import re

import anthropic

_api_key = os.environ.get("ANTHROPIC_API_KEY")
if not _api_key:
    raise RuntimeError("ANTHROPIC_API_KEY environment variable is not set")
_client = anthropic.Anthropic(api_key=_api_key)

_MODEL = "claude-haiku-4-5-20251001"

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
            response = _client.messages.create(
                model=_MODEL,
                max_tokens=1024,
                system=_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )
            raw = response.content[0].text.strip()
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
            classification = json.loads(raw)
            result.update(classification)
            result["classifier_status"] = "success"
        except Exception as exc:
            result["classifier_status"] = "error"
            result["error_message"] = str(exc)

        return result
