import json
import os
import re

import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

_GEMINI_MODEL = "gemini-1.5-flash"

_SYSTEM_PROMPT = """\
You are the Lawyer Assessment Agent for AdalatAI, a legal aid system for Pakistani citizens.
You will be given a fully classified and documented legal case. Your job is to make a holistic
decision on whether this citizen needs a lawyer, what kind of referral is appropriate, and
give them plain-language guidance on where to get legal help.

Be realistic: not every problem needs a lawyer. Administrative complaints, consumer disputes,
and simple tenancy matters can often be self-served with the document already drafted.
Reserve lawyer_needed: true for situations where self-service is genuinely insufficient.

Do NOT include any personally identifying information in your response.
Refer to the citizen as "آپ" in Urdu and "you" in English.

Respond with ONLY valid JSON. No explanation outside the JSON block.

JSON schema:
{
  "lawyer_needed": <true|false>,
  "lawyer_reason": "<1-3 sentence plain-English justification>",
  "referral_type": "<none|legal_aid|pro_bono|private>",
  "referral_note_en": "<practical English guidance on where to get legal help, 2-3 sentences>",
  "referral_note_ur": "<same guidance in plain Urdu, 8th grade level>"
}\
"""

_PROVINCE_RESOURCES = {
    "Punjab": "Punjab Legal Aid Authority (PLAA), District Legal Empowerment Committee, AGHS Legal Aid Cell",
    "Sindh": "Sindh Legal Aid Authority, Edhi Foundation Legal Help, Karachi Bar Association Pro Bono",
    "KPK": "KPK Legal Aid Authority, Peshawar High Court Legal Aid Committee",
    "Balochistan": "Balochistan Legal Aid Authority, Quetta Bar Association",
}
_DEFAULT_RESOURCES = "National Legal Aid Authority helpline 0800-02000, law college legal aid clinics"


class LawyerAssessmentAgent:
    def __init__(self):
        self._model = genai.GenerativeModel(
            model_name=_GEMINI_MODEL,
            system_instruction=_SYSTEM_PROMPT,
            generation_config={"max_output_tokens": 768, "temperature": 0},
        )

    def run(self, case: dict) -> dict:
        result = case.copy()

        if case.get("document_drafter_status") != "success":
            result["lawyer_assessment_status"] = "skipped"
            result["skip_reason"] = "document drafter did not succeed"
            return result

        user_message = self._build_user_message(case)

        try:
            response = self._model.generate_content(user_message)
            raw = response.text.strip()
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
            assessment = json.loads(raw)

            result.update(assessment)
            result["lawyer_assessment_status"] = "success"
        except Exception as exc:
            result["lawyer_assessment_status"] = "error"
            result["error_message"] = str(exc)

        return result

    @staticmethod
    def _build_user_message(case: dict) -> str:
        province = case.get("province") or "Unknown"
        resources = _PROVINCE_RESOURCES.get(province, _DEFAULT_RESOURCES)
        laws = "\n".join(f"  - {law}" for law in case.get("relevant_laws", []))
        actions = "\n".join(f"  - {a}" for a in case.get("recommended_actions", []))

        return (
            f"Legal category: {case.get('legal_category')}\n"
            f"Sub-issues: {', '.join(case.get('sub_issues', []))}\n"
            f"Urgency: {case.get('urgency')}\n"
            f"Province: {province}\n"
            f"Problem summary: {case.get('summary_en', '')}\n"
            f"Rights explanation: {case.get('rights_en', '')}\n"
            f"Relevant laws:\n{laws}\n"
            f"Recommended actions:\n{actions}\n"
            f"Document drafted: {'yes' if case.get('document_path') else 'no'}\n"
            f"Agent 2 initial lawyer flag: {case.get('lawyer_recommended', False)}\n"
            f"Available legal aid resources for {province}: {resources}"
        )
