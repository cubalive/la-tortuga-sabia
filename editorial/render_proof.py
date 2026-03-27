from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

sys.path.insert(0, str(Path(__file__).resolve().parent))

from v11_editorial_guide import (
    Story,
    StoryAssets,
    BuildResult,
    QAIssue,
    build_proof,
    clean_text,
    has_blockers,
    load_stories_json,
    EDITORIAL_DIR,
    ASSETS_DIR,
    OUTPUT_DIR,
)

# ============================================================
# PATHS
# ============================================================

STORIES_JSON = EDITORIAL_DIR / "stories.json"
QA_REPORT_JSON = EDITORIAL_DIR / "qa_report.json"
OUTPUT_PDF = OUTPUT_DIR / "proof_5_stories.pdf"

COVER_IMAGE = ASSETS_DIR / "cover" / "cover.jpg"
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
    return {"severity": issue.severity, "page_hint": issue.page_hint, "issue": issue.issue}


def classify_issues(issues: List[QAIssue]) -> Dict[str, List[Dict[str, Any]]]:
    blockers, warnings, info = [], [], []
    for issue in issues:
        payload = serialize_issue(issue)
        if issue.severity == "blocker":
            blockers.append(payload)
        elif issue.severity == "warning":
            warnings.append(payload)
        else:
            info.append(payload)
    return {"blockers": blockers, "warnings": warnings, "info": info}


def build_qa_report(result: BuildResult, notes: List[str] | None = None) -> Dict[str, Any]:
    classified = classify_issues(result.qa_issues)
    return {
        "timestamp": now_iso(),
        "generated_file": str(result.pdf_path),
        "page_count": result.total_pages_estimate,
        "status": "fail" if classified["blockers"] else "pass",
        "blockers": classified["blockers"],
        "warnings": classified["warnings"],
        "info": classified["info"],
        "notes": notes or [],
    }


def print_summary(report: Dict[str, Any]) -> None:
    print(f"\n{'='*55}")
    print(f"  QA REPORT")
    print(f"{'='*55}")
    print(f"  File:   {report['generated_file']}")
    print(f"  Pages:  {report.get('page_count', '?')}")
    print(f"  Status: {report['status'].upper()}")
    if report["blockers"]:
        print(f"\n  BLOCKERS ({len(report['blockers'])}):")
        for b in report["blockers"]:
            print(f"    X [{b.get('page_hint','')}] {b['issue']}")
    if report["warnings"]:
        print(f"\n  Warnings ({len(report['warnings'])}):")
        for w in report["warnings"]:
            print(f"    ! [{w.get('page_hint','')}] {w['issue']}")
    if report["notes"]:
        print(f"\n  Notes:")
        for n in report["notes"]:
            print(f"    - {n}")
    print(f"{'='*55}\n")


# ============================================================
# MAIN
# ============================================================

def main() -> None:
    print("=" * 55)
    print("  La Tortuga Sabia - v11 Proof Generator")
    print("=" * 55)

    if not STORIES_JSON.exists():
        raise FileNotFoundError(f"stories.json not found: {STORIES_JSON}")
    if not COVER_IMAGE.exists():
        raise FileNotFoundError(f"Cover image not found: {COVER_IMAGE}")

    print("\nLoading stories.json...")
    stories = load_stories_json(STORIES_JSON)
    print(f"Loaded {len(stories)} stories.")

    if len(stories) != 5:
        print(f"Warning: expected 5 stories, found {len(stories)}.")

    print("\nBuilding proof PDF...")
    result = build_proof(
        cover_image=COVER_IMAGE,
        cover_title=COVER_TITLE,
        cover_subtitle=COVER_SUBTITLE,
        stories=stories,
        output_name=OUTPUT_PDF.name,
        include_final_closing=True,
    )

    notes: List[str] = []

    if not result.pdf_path.exists():
        notes.append("PDF file was not created.")
        report = {
            "timestamp": now_iso(),
            "generated_file": str(result.pdf_path),
            "page_count": 0,
            "status": "fail",
            "blockers": [{"severity": "blocker", "page_hint": "document", "issue": "PDF not created"}],
            "warnings": [], "info": [], "notes": notes,
        }
        write_json(QA_REPORT_JSON, report)
        print_summary(report)
        raise RuntimeError("PDF was not generated.")

    if result.qa_issues:
        notes.append("QA issues found. Review blockers before scaling.")
    else:
        notes.append("No QA issues. Visual validation still required.")

    report = build_qa_report(result, notes=notes)
    write_json(QA_REPORT_JSON, report)
    print_summary(report)

    if report["status"] == "fail":
        raise SystemExit("Proof generated but QA FAILED. Do not scale.")

    print(f"Proof: {result.pdf_path}")
    print(f"QA:    {QA_REPORT_JSON}")
    print("Visual validation mandatory before scaling.\n")


if __name__ == "__main__":
    main()
