# SKILL: Analytics Agent (Agent 6)

## Identity
- **Agent name:** AnalyticsAgent
- **Role:** Sixth and final agent in the AdalatAI pipeline. Increments anonymized aggregate
  counts in `analytics_db` based on the completed case. This agent does NOT call Claude and
  does NOT touch `cases_db`. It is a pure database write — no personal data ever enters it.

## Privacy Guarantee
This agent is the enforcement boundary between personal case data and public-safe analytics:

| What it reads from the case dict | What it writes to analytics_db |
|----------------------------------|-------------------------------|
| `legal_category` (already anonymized) | `legal_category` column |
| `province` (not PII) | `province` column |
| `language` (not PII) | `language` column |
| `lawyer_needed` (bool) | `lawyer_referrals` increment |
| `document_path` (existence only) | `documents_drafted` increment |

**It reads nothing else. It never reads `problem_text`, `summary_*`, `rights_*`,
`deadlines`, names, CNICs, contacts, or any encrypted field.**

## Database
- Connects to: `analytics_db` only (env var: `ANALYTICS_DATABASE_URL`)
- Never connects to: `cases_db`
- Table written: `daily_case_counts`

## Inputs
Receives the `case` dict produced by DeadlineTrackerAgent. Only these fields are used:
```python
{
    "legal_category": str,
    "province": str | None,
    "language": str,                    # 'ur' or 'en'
    "lawyer_needed": bool,
    "document_path": str | None,
    "deadline_tracker_status": str      # must be 'success' to proceed
}
```

## Outputs
Returns the same `case` dict with one key added:
```python
{
    # All input keys preserved, plus:
    "analytics_status": str    # 'success' | 'skipped' | 'error'
}
```

## SQL Operation
Single upsert on `daily_case_counts`. Creates the row if it doesn't exist,
increments counts if it does:

```sql
INSERT INTO daily_case_counts
    (date, province, language, legal_category,
     cases_received, lawyer_referrals, documents_drafted)
VALUES
    (CURRENT_DATE, %(province)s, %(language)s, %(legal_category)s,
     1, %(lawyer_referrals)s, %(documents_drafted)s)
ON CONFLICT (date, province, language, legal_category)
DO UPDATE SET
    cases_received    = daily_case_counts.cases_received    + 1,
    lawyer_referrals  = daily_case_counts.lawyer_referrals  + EXCLUDED.lawyer_referrals,
    documents_drafted = daily_case_counts.documents_drafted + EXCLUDED.documents_drafted;
```

## Skip Condition
- If `deadline_tracker_status` is not `'success'`, skip the DB write entirely.
- Return `analytics_status: 'skipped'` and `skip_reason: 'pipeline did not complete'`.
- Rationale: only fully completed cases count toward aggregate statistics to avoid
  inflating counts with partial/error runs.

## Environment
- `ANALYTICS_DATABASE_URL` — psycopg2-compatible DSN, e.g.:
  `postgresql://user:pass@localhost:5432/analytics_db`
- If the env var is unset or the connection fails, return `analytics_status: 'error'`
  and `error_message`. Do NOT raise. The pipeline result is still returned to the citizen.

## Error Handling
- Connection failure → `analytics_status: 'error'`, log the error, return case dict.
- SQL failure → same. Never raise. Analytics are non-critical to the citizen's outcome.

## No LLM Call
This agent makes no call to the Anthropic API. It is deterministic and side-effect-only.
