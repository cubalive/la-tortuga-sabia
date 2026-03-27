from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

sys.path.insert(0, str(Path(__file__).resolve().parent))

from v11_editorial_guide import (
    Story,
    BuildResult,
    QAIssue,
    build_proof,
    clean_text,
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
OUTPUT_PDF_NAME = "proof_5_stories.pdf"

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
        item = serialize_issue(issue)
        if issue.severity == "blocker": blockers.append(item)
        elif issue.severity == "warning": warnings.append(item)
        else: info.append(item)
    return {"blockers": blockers, "warnings": warnings, "info": info}


def build_qa_report(result: BuildResult) -> Dict[str, Any]:
    classified = classify_issues(result.qa_issues)
    status = "fail" if classified["blockers"] else "pass"
    notes = []
    if classified["blockers"]:
        notes.append("QA failed. Do not scale.")
    else:
        notes.append("No blockers. Visual validation still required.")
    return {
        "timestamp": now_iso(),
        "generated_file": str(result.pdf_path),
        "page_count": result.total_pages_estimate,
        "status": status,
        "blockers": classified["blockers"],
        "warnings": classified["warnings"],
        "info": classified["info"],
        "notes": notes,
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
        raise FileNotFoundError(f"Cover not found: {COVER_IMAGE}")

    print("\nLoading stories...")
    stories: List[Story] = load_stories_json(STORIES_JSON)
    print(f"Stories loaded: {len(stories)}")

    if len(stories) != 5:
        print(f"Warning: expected 5, found {len(stories)}")

    # Confirm full texts
    for s in stories:
        wc = len(s.body.split())
        print(f"  #{s.numero}: {s.titulo} — {wc} words")
        if wc < 100:
            print(f"    ⚠️ POSSIBLE TRUNCATION — only {wc} words")

    print("\nBuilding PDF proof...")
    result = build_proof(
        cover_image=COVER_IMAGE,
        cover_title=clean_text(COVER_TITLE),
        cover_subtitle=clean_text(COVER_SUBTITLE),
        stories=stories,
        output_name=OUTPUT_PDF_NAME,
        include_final_closing=False,
    )

    report = build_qa_report(result)
    write_json(QA_REPORT_JSON, report)
    print_summary(report)

    if not result.pdf_path.exists():
        raise RuntimeError(f"PDF not created: {result.pdf_path}")

    if report["status"] == "fail":
        raise SystemExit("QA FAILED. Do not scale.")

    print(f"Proof: {result.pdf_path}")
    print(f"QA:    {QA_REPORT_JSON}")
    print("Visual review mandatory before scaling.\n")


if __name__ == "__main__":
    main()
