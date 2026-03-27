#!/usr/bin/env python3
"""
render_proof.py — Generate proof PDF and QA report.
Usage: python3 editorial/render_proof.py
"""
import json, sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))
from v11_editorial_guide import load_stories, build_proof, has_blockers, EDITORIAL_DIR, ASSETS_DIR, OUT_DIR

def main():
    print("═══ La Tortuga Sabia — v11 Proof Generator ═══\n")

    # Load stories
    stories_path = EDITORIAL_DIR / "stories.json"
    if not stories_path.exists():
        print(f"❌ {stories_path} not found")
        return

    stories = load_stories(stories_path)
    print(f"Loaded {len(stories)} stories")

    # Cover
    cover = ASSETS_DIR / "cover" / "cover.jpg"
    if not cover.exists():
        print(f"❌ Cover image not found: {cover}")
        return

    # Build
    print("Building proof...\n")
    result = build_proof(
        cover_img=cover,
        title="La Tortuga Sabia",
        sub="Tomo I - El Bosque Encantado",
        stories=stories,
        out_name="v11-proof-5stories.pdf",
    )

    # QA Report
    qa = {
        "timestamp": datetime.now().isoformat(),
        "generated_file": str(result.pdf_path),
        "page_count": result.page_count,
        "stories": len(stories),
        "blockers": [{"page": i.page_hint, "issue": i.issue} for i in result.qa_issues if i.severity == "blocker"],
        "warnings": [{"page": i.page_hint, "issue": i.issue} for i in result.qa_issues if i.severity == "warning"],
        "status": "fail" if has_blockers(result.qa_issues) else "pass",
    }

    qa_path = EDITORIAL_DIR / "qa_report.json"
    json.dump(qa, open(qa_path, "w"), indent=2, ensure_ascii=False)

    # Print results
    print(f"PDF: {result.pdf_path}")
    print(f"Pages: {result.page_count}")
    print(f"QA Status: {qa['status'].upper()}")

    if qa["blockers"]:
        print(f"\n❌ BLOCKERS ({len(qa['blockers'])}):")
        for b in qa["blockers"]:
            print(f"  - [{b['page']}] {b['issue']}")

    if qa["warnings"]:
        print(f"\n⚠️  WARNINGS ({len(qa['warnings'])}):")
        for w in qa["warnings"]:
            print(f"  - [{w['page']}] {w['issue']}")

    if qa["status"] == "pass":
        print("\n✅ PROOF PASSED QA — ready for review")
    else:
        print("\n❌ PROOF FAILED QA — fix blockers before scaling")

    print(f"\nQA report: {qa_path}")


if __name__ == "__main__":
    main()
