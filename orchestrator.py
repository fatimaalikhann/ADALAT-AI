"""
AdalatAI pipeline orchestrator.

Passes a case dict through all six agents in sequence:
  ClassifierAgent → RightsExplainerAgent → DocumentDrafterAgent
  → LawyerAssessmentAgent → DeadlineTrackerAgent → AnalyticsAgent

Each agent follows the same contract:
  - Input:  case dict (read-only except for the keys it adds)
  - Output: case dict with its own keys added and a *_status field set
  - Never raises — errors are captured in *_status: 'error' + error_message

Usage:
  pipeline = AdalatPipeline()
  result = pipeline.run({
      "case_id":      "...",
      "problem_text": "...",
      "language":     "ur",
      "province":     "Punjab",
  })
"""

import logging
import sys

from agents.analytics_agent import AnalyticsAgent
from agents.classifier_agent import ClassifierAgent
from agents.deadline_tracker_agent import DeadlineTrackerAgent
from agents.document_drafter_agent import DocumentDrafterAgent
from agents.lawyer_assessment_agent import LawyerAssessmentAgent
from agents.rights_explainer_agent import RightsExplainerAgent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("adalat.orchestrator")

_REQUIRED_KEYS = {"case_id", "problem_text", "language"}


class AdalatPipeline:
    def __init__(self):
        self._stages = [
            ("classifier",        ClassifierAgent()),
            ("rights_explainer",  RightsExplainerAgent()),
            ("document_drafter",  DocumentDrafterAgent()),
            ("lawyer_assessment", LawyerAssessmentAgent()),
            ("deadline_tracker",  DeadlineTrackerAgent()),
            ("analytics",         AnalyticsAgent()),
        ]

    def run(self, case: dict) -> dict:
        missing = _REQUIRED_KEYS - case.keys()
        if missing:
            logger.error("case_id=%s missing required keys: %s", case.get("case_id"), missing)
            return {
                **case,
                "pipeline_status": "error",
                "error_message": f"Missing required keys: {missing}",
            }

        logger.info("pipeline start case_id=%s language=%s province=%s",
                    case.get("case_id"), case.get("language"), case.get("province"))

        for name, agent in self._stages:
            case = agent.run(case)
            status = case.get(f"{name}_status", "unknown")
            logger.info("stage=%-20s status=%s case_id=%s", name, status, case.get("case_id"))

        logger.info("pipeline end case_id=%s pipeline_status=%s",
                    case.get("case_id"), case.get("pipeline_status", "incomplete"))
        return case


# ---------------------------------------------------------------------------
# CLI smoke-test:  python orchestrator.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import json
    import uuid

    sample_case = {
        "case_id":      str(uuid.uuid4()),
        "problem_text": (
            "میرے مالک نے مجھے تین مہینے سے تنخواہ نہیں دی "
            "اور کل مجھے نوکری سے نکال دیا۔"
        ),
        "language":     "ur",
        "province":     "Punjab",
    }

    pipeline = AdalatPipeline()
    result = pipeline.run(sample_case)

    print("\n" + "=" * 60)
    print("PIPELINE RESULT")
    print("=" * 60)

    summary_keys = [
        "case_id", "legal_category", "urgency", "confidence",
        "lawyer_needed", "referral_type", "document_path",
        "pipeline_status",
        "classifier_status", "rights_explainer_status",
        "document_drafter_status", "lawyer_assessment_status",
        "deadline_tracker_status", "analytics_status",
    ]
    for key in summary_keys:
        if key in result:
            print(f"  {key}: {result[key]}")

    if result.get("deadlines"):
        print(f"\n  deadlines ({len(result['deadlines'])} found):")
        for dl in result["deadlines"]:
            print(f"    [{dl['priority']:>12}]  {dl['deadline_date']}  {dl['description_en']}")

    if result.get("error_message"):
        print(f"\n  error_message: {result['error_message']}", file=sys.stderr)

    print("=" * 60)
