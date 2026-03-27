# La Tortuga Sabia — Editorial System v11

## Structure
```
editorial/
├── v11_editorial_guide.py   # Architecture: models, templates, CSS, QA, build
├── render_proof.py          # Entry point: load stories → validate → render → QA
├── stories.json             # Story data (5 stories for proof)
├── qa_report.json           # Auto-generated QA results
├── assets/
│   ├── cover/cover.jpg
│   └── story_NN/            # hero.jpg, conflict.jpg, resolution.jpg, quelina.jpg
└── output/
    └── v11-proof-5stories.pdf
```

## How to run
```bash
python3 editorial/render_proof.py
```

## QA validation
The system validates before rendering:
- All required images exist and are > 1KB
- No corrupt characters in text
- No empty story bodies
- Quelina text not excessively long

If any **blocker** is found, the PDF is NOT generated.

## When NOT to scale to full tomo
- Any blocker in qa_report.json
- Images missing for any story
- Corrupt characters detected
- Visual review not passed by director
