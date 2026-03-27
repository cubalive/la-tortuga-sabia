from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

# Add editorial dir to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

from v11_editorial_guide import (
    Story,
    StoryAssets,
    BuildResult,
    QAIssue,
    build_proof,
    clean_text,
    has_blockers,
    load_stories as guide_load_stories,
)

# ============================================================
# PATHS
# ============================================================

EDITORIAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EDITORIAL_DIR.parent

STORIES_JSON = EDITORIAL_DIR / "stories.json"
QA_REPORT_JSON = EDITORIAL_DIR / "qa_report.json"
OUTPUT_DIR = EDITORIAL_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_PDF = OUTPUT_DIR / "proof_5_stories.pdf"

# Cover lives inside editorial/assets/cover/
COVER_IMAGE = EDITORIAL_DIR / "assets" / "cover" / "cover.jpg"
COVER_TITLE = "La Tortuga Sabia"
COVER_SUBTITLE = "Tomo I - El Bosque Encantado"


# ============================================================
# HELPERS
# ============================================================

def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def write_json(path: Path, data: Any) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def serialize_issue(issue: QAIssue) -> Dict[str, Any]:
    return {
        "severity": issue.severity,
        "page_hint": issue.page_hint,
        "issue": issue.issue,
    }


def classify_issues(issues: List[QAIssue]) -> Dict[str, List[Dict[str, Any]]]:
    blockers: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []
    info: List[Dict[str, Any]] = []

    for issue in issues:
        payload = serialize_issue(issue)
        if issue.severity == "blocker":
            blockers.append(payload)
        elif issue.severity == "warning":
            warnings.append(payload)
        else:
            info.append(payload)

    return {"blockers": blockers, "warnings": warnings, "info": info}


def build_qa_report(build_result: BuildResult, extra_notes: List[str] | None = None) -> Dict[str, Any]:
    classified = classify_issues(build_result.qa_issues)
    status = "fail" if classified["blockers"] else "pass"

    return {
        "timestamp": now_iso(),
        "generated_file": str(build_result.pdf_path),
        "page_count": build_result.page_count,
        "status": status,
        "blockers": classified["blockers"],
        "warnings": classified["warnings"],
        "info": classified["info"],
        "notes": extra_notes or [],
    }


def print_summary(report: Dict[str, Any]) -> None:
    print(f"\n{'='*55}")
    print(f"  QA REPORT — La Tortuga Sabia")
    print(f"{'='*55}")
    print(f"  File:   {report['generated_file']}")
    print(f"  Pages:  {report.get('page_count', '?')}")
    print(f"  Status: {report['status'].upper()}")

    if report["blockers"]:
        print(f"\n  BLOCKERS ({len(report['blockers'])}):")
        for item in report["blockers"]:
            print(f"    X [{item.get('page_hint','')}] {item['issue']}")

    if report["warnings"]:
        print(f"\n  Warnings ({len(report['warnings'])}):")
        for item in report["warnings"]:
            print(f"    ! [{item.get('page_hint','')}] {item['issue']}")

    if report["notes"]:
        print(f"\n  Notes:")
        for note in report["notes"]:
            print(f"    - {note}")

    print(f"{'='*55}\n")


# ============================================================
# MAIN
# ============================================================

def main() -> None:
    print("=" * 55)
    print("  La Tortuga Sabia — v11 Proof Generator")
    print("=" * 55)

    if not STORIES_JSON.exists():
        raise FileNotFoundError(f"No existe stories.json en: {STORIES_JSON}")

    if not COVER_IMAGE.exists():
        raise FileNotFoundError(f"No existe la portada en: {COVER_IMAGE}")

    print("\nLoading stories.json...")
    stories = guide_load_stories(STORIES_JSON)

    print(f"Loaded {len(stories)} stories.")
    if len(stories) != 5:
        print(f"Warning: se esperaban 5 cuentos para el proof, pero se encontraron {len(stories)}.")

    print("\nBuilding proof PDF...")

    # Call build_proof with the actual v11 signature
    build_result = build_proof(
        cover_img=COVER_IMAGE,
        title=COVER_TITLE,
        sub=COVER_SUBTITLE,
        stories=stories,
        out_name=OUTPUT_PDF.name,
    )

    notes: List[str] = []

    if not build_result.pdf_path.exists():
        notes.append("PDF file was not created.")
        report = {
            "timestamp": now_iso(),
            "generated_file": str(build_result.pdf_path),
            "page_count": 0,
            "status": "fail",
            "blockers": [
                {
                    "severity": "blocker",
                    "page_hint": "document",
                    "issue": "PDF was not created after build_proof()",
                }
            ],
            "warnings": [],
            "info": [],
            "notes": notes,
        }
        write_json(QA_REPORT_JSON, report)
        print_summary(report)
        raise RuntimeError("PDF no fue generado.")

    if build_result.qa_issues:
        notes.append("QA issues found during build. Review blockers before scaling.")
    else:
        notes.append("No QA issues returned by build_proof(). Visual validation still required.")

    report = build_qa_report(build_result, extra_notes=notes)
    write_json(QA_REPORT_JSON, report)

    print_summary(report)

    if report["status"] == "fail":
        raise SystemExit("Proof generado, pero QA fallo. No escalar todavia.")

    print(f"Proof ready: {build_result.pdf_path}")
    print(f"QA report:   {QA_REPORT_JSON}")
    print("Reminder: QA visual manual sigue siendo obligatoria antes de escalar.\n")


if __name__ == "__main__":
    main()
