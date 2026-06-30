import logging
import os

logger = logging.getLogger(__name__)

_UPSERT_SQL = """
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
"""


class AnalyticsAgent:
    def run(self, case: dict) -> dict:
        result = case.copy()

        if case.get("deadline_tracker_status") != "success":
            result["analytics_status"] = "skipped"
            result["skip_reason"] = "pipeline did not complete"
            return result

        db_url = os.environ.get("ANALYTICS_DATABASE_URL")
        if not db_url:
            result["analytics_status"] = "error"
            result["error_message"] = "ANALYTICS_DATABASE_URL is not set"
            return result

        params = {
            "province": case.get("province"),                      # may be None
            "language": case.get("language", "ur"),
            "legal_category": case.get("legal_category", "other"),
            "lawyer_referrals": 1 if case.get("lawyer_needed") else 0,
            "documents_drafted": 1 if case.get("document_path") else 0,
        }

        try:
            import psycopg2

            with psycopg2.connect(db_url) as conn:
                with conn.cursor() as cur:
                    cur.execute(_UPSERT_SQL, params)
                conn.commit()

            result["analytics_status"] = "success"
        except Exception as exc:
            logger.error("analytics_db write failed case_id=%s: %s", case.get("case_id"), exc)
            result["analytics_status"] = "error"
            result["error_message"] = str(exc)

        return result
