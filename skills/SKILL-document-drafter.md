# SKILL: Document Drafter Agent (Agent 3)

## Identity
- **Agent name:** DocumentDrafterAgent
- **Role:** Third agent in the AdalatAI pipeline. Uses the classifier and rights explainer
  outputs to draft a jurisdiction-appropriate formal legal document (complaint, notice,
  or application) in both English and Urdu, then renders it as a PDF.

## Inputs
Receives the `case` dict produced by RightsExplainerAgent. These keys are guaranteed present:
```python
{
    "case_id": str,
    "problem_text": str,
    "language": str,
    "province": str | None,
    "legal_category": str,
    "sub_issues": list[str],
    "urgency": str,
    "summary_en": str,
    "summary_ur": str,
    "rights_en": str,
    "rights_ur": str,
    "relevant_laws": list[str],
    "recommended_actions": list[str],
    "rights_explainer_status": str       # must be 'success' to proceed
}
```

## Outputs
Returns the same `case` dict with these keys added:
```python
{
    # All input keys preserved, plus:
    "document_type": str,       # human-readable document type (e.g. "Labour Court Complaint")
    "document_path": str,       # absolute path to the generated PDF file
    "document_drafter_status": str  # 'success' | 'skipped' | 'error'
}
```

## Document Type Mapping
Each `legal_category` maps to a specific document type:

| legal_category      | Document Type                           |
|---------------------|-----------------------------------------|
| labor               | Labour Court Complaint                  |
| family_law          | Family Court Application                |
| property            | Legal Notice — Property Dispute         |
| criminal            | FIR Draft                               |
| consumer            | Consumer Court Complaint                |
| tenant              | Tenancy Dispute Notice                  |
| inheritance         | Succession Certificate Application      |
| domestic_violence   | Protection Order Application            |
| child_custody       | Child Custody Application               |
| debt                | Debt Recovery Notice                    |
| police              | Complaint to Senior Police Officer      |
| other               | General Legal Complaint Letter          |

## Behavior Rules

### Document Generation
1. Ask Claude to produce a formal document appropriate for the `document_type`.
2. The document must reference the `relevant_laws` cited by Agent 2.
3. The English body must be formal legal prose (3–6 paragraphs).
4. The Urdu body must be accessible prose — same meaning, 8th grade reading level.
5. Both bodies use placeholder tokens where citizen personal details would go:
   - `[YOUR FULL NAME]` / `[آپ کا پورا نام]`
   - `[YOUR ADDRESS]` / `[آپ کا پتہ]`
   - `[YOUR CONTACT NUMBER]` / `[آپ کا رابطہ نمبر]`
   - `[DATE OF INCIDENT]` / `[واقعے کی تاریخ]`
   - `[RESPONDENT NAME]` / `[فریق مخالف کا نام]`

   These placeholders are intentional — the citizen fills them in.
   The agent must NOT invent or assume any personal details.

### Privacy
- Do NOT use any names, CNICs, addresses, or phone numbers from `problem_text`.
- Base the document only on the structured fields: `legal_category`, `sub_issues`,
  `summary_en`, `relevant_laws`, `province`.

### PDF Rendering
- Save to `documents/{case_id}.pdf` relative to the project root.
- Page size: A4.
- PDF structure (top to bottom):
  1. Header: "AdalatAI — Legal Aid System" + document type + date + case reference
  2. Horizontal rule
  3. English body
  4. Horizontal rule
  5. Urdu body (requires an Urdu-capable font; gracefully omitted if unavailable)
  6. Footer disclaimer (see below)
- Footer disclaimer text:
  ```
  This document was drafted by AdalatAI, an automated legal aid system.
  It is a template only and does not constitute legal advice.
  Fill in the bracketed placeholders before submitting.
  For urgent matters, consult a qualified lawyer.
  ```

### Urdu Font Handling
- Look for a `.ttf` font file in `fonts/` directory (project root).
- Preferred fonts (in order): `NotoNastaliqUrdu-Regular.ttf`, `Amiri-Regular.ttf`, any `*.ttf`.
- If no suitable font is found, render the PDF in English only and add a note:
  `"[Urdu version available — add an Urdu font to the fonts/ directory]"`

### Skip Condition
- If `rights_explainer_status` is not `'success'`, skip the API call.
- Return `rights_explainer_status: 'skipped'` and `skip_reason: 'rights explainer did not succeed'`.

### Error Handling
- If the Anthropic API call or PDF generation fails, return `document_drafter_status: 'error'`
  and `error_message`. Do NOT raise.

## System Prompt Template
```
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
}
```

## Model Settings
- Model: `claude-sonnet-4-6`
- Max tokens: `2048`
- Temperature: `0.1`

## Example

**Input (partial case dict):**
```json
{
  "legal_category": "labor",
  "sub_issues": ["unpaid wages", "wrongful termination"],
  "province": "Punjab",
  "summary_en": "Employee has not received wages for three months and was abruptly terminated.",
  "relevant_laws": [
    "Payment of Wages Act 1936, Section 3",
    "Industrial Relations Act 2012, Section 33"
  ]
}
```

**Expected output (partial):**
```json
{
  "document_type": "Labour Court Complaint",
  "subject_en": "Complaint Regarding Non-Payment of Wages and Unlawful Termination",
  "subject_ur": "تنخواہ نہ ملنے اور غیر قانونی برخاستگی کی شکایت",
  "body_en": "To the Presiding Officer, Labour Court...\n\nI, [YOUR FULL NAME], resident of [YOUR ADDRESS]...",
  "body_ur": "جناب صاحب، لیبر کورٹ...\n\nمیں، [آپ کا پورا نام]، ساکن [آپ کا پتہ]..."
}
```
