"""
LA TORTUGA SABIA — v11 Editorial Guide
Architecture base for premium children's book PDF generation.
WeasyPrint renderer. File-based assets (no base64). Strict QA.
"""
from __future__ import annotations
import os, re, html, json
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Dict, Tuple
from datetime import datetime
from weasyprint import HTML, CSS
from PIL import Image as PILImage

# ============================================================
# CONFIG
# ============================================================
BASE_DIR = Path("/home/user/la-tortuga-sabia")
EDITORIAL_DIR = BASE_DIR / "editorial"
ASSETS_DIR = EDITORIAL_DIR / "assets"
OUT_DIR = EDITORIAL_DIR / "output"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PAGE_W = "8.5in"
PAGE_H = "11in"
FONT_SERIF = '"Liberation Serif", Georgia, serif'
MAX_WORDS_IDEAL = 110
MAX_WORDS_HARD = 130
IMAGE_MAX_PX = 900  # resize images to this before render


# ============================================================
# DATA MODELS
# ============================================================
@dataclass
class StoryAssets:
    hero: Optional[Path] = None
    conflict: Optional[Path] = None
    resolution: Optional[Path] = None
    quelina: Optional[Path] = None

@dataclass
class Story:
    numero: int
    titulo: str
    personaje: str
    body: str
    moraleja: str
    quelina_text: str
    assets: StoryAssets

@dataclass
class QAIssue:
    severity: str  # "blocker", "warning", "info"
    page_hint: str
    issue: str

@dataclass
class BuildResult:
    pdf_path: Path
    page_count: int = 0
    qa_issues: List[QAIssue] = field(default_factory=list)


# ============================================================
# TEXT SANITIZATION
# ============================================================
BAD_CHARS = re.compile(r"[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFE\uFFFF\uFFFD]")

def clean_text(text: str) -> str:
    if not text:
        return ""
    reps = {
        "\u00ab": '"', "\u00bb": '"', "\u201c": '"', "\u201d": '"',
        "\u201e": '"', "\u2018": "'", "\u2019": "'", "\u201a": "'",
        "\u2014": " - ", "\u2013": " - ", "\u2012": "-",
        "\u2026": "...", "\u2022": "-",
        "\u00a0": " ", "\u200b": "", "\u200c": "", "\u200d": "",
        "\u2060": "", "\ufeff": "", "\ufffe": "", "\uffff": "",
        "---": " - ", "--": " - ",
        "«": '"', "»": '"', "—": " - ", "–": " - ",
    }
    for src, dst in reps.items():
        text = text.replace(src, dst)
    text = BAD_CHARS.sub("", text)
    text = re.sub(r"  +", " ", text)
    text = re.sub(r" ?\n ?", "\n", text)
    return text.strip()

def esc(text: str) -> str:
    return html.escape(clean_text(text), quote=True)

def paragraphs(text: str) -> List[str]:
    text = clean_text(text)
    blocks = [b.strip() for b in text.split("\n") if b.strip()]
    if len(blocks) < 3:
        blocks = [b.strip() for b in re.split(r"(?<=[.!?])\s+", text) if b.strip()]
        # Regroup into ~3 chunks
        if len(blocks) >= 6:
            t = len(blocks) // 3
            blocks = [" ".join(blocks[:t]), " ".join(blocks[t:t*2]), " ".join(blocks[t*2:])]
    return blocks

def wc(text: str) -> int:
    return len(re.findall(r"\S+", clean_text(text)))

def chunk_text(text: str, limit: int = MAX_WORDS_IDEAL) -> List[str]:
    paras = paragraphs(text)
    chunks, cur, cur_wc = [], [], 0
    for p in paras:
        pw = wc(p)
        if cur and cur_wc + pw > limit:
            chunks.append("\n\n".join(cur))
            cur, cur_wc = [p], pw
        else:
            cur.append(p)
            cur_wc += pw
    if cur:
        chunks.append("\n\n".join(cur))
    return chunks


# ============================================================
# ASSET PROCESSING
# ============================================================
def optimize_image(src: Path, dst: Path, max_px: int = IMAGE_MAX_PX):
    """Resize and optimize image for PDF embedding."""
    img = PILImage.open(src).convert("RGB")
    if img.width > max_px or img.height > max_px:
        img.thumbnail((max_px, max_px), PILImage.LANCZOS)
    # Smooth center seam (DALL-E artifact)
    import numpy as np
    arr = np.array(img, dtype=np.float32)
    w = arr.shape[1]
    mid = w // 2
    for off in range(-3, 4):
        col = mid + off
        if 1 < col < w - 2:
            wt = 0.3 + 0.7 * (abs(off) / 3)
            arr[:, col, :] = arr[:, col, :] * wt + (arr[:, col-1, :] + arr[:, col+1, :]) / 2 * (1 - wt)
    PILImage.fromarray(arr.astype(np.uint8)).save(dst, "JPEG", quality=82, optimize=True)

def prepare_assets(stories: List[Story]) -> Path:
    """Optimize all images into a temp directory for rendering."""
    opt_dir = OUT_DIR / "_optimized"
    opt_dir.mkdir(exist_ok=True)
    for s in stories:
        for key in ["hero", "conflict", "resolution", "quelina"]:
            src = getattr(s.assets, key)
            if src and src.exists():
                dst = opt_dir / f"s{s.numero:02d}_{key}.jpg"
                if not dst.exists():
                    optimize_image(src, dst)
                setattr(s.assets, key, dst)
    return opt_dir


# ============================================================
# ASSET VALIDATION
# ============================================================
def validate_asset(path: Optional[Path]) -> Optional[str]:
    if path is None: return "missing path"
    if not path.exists(): return f"not found: {path}"
    if path.stat().st_size < 1000: return f"too small: {path}"
    return None

def validate_story(story: Story) -> List[QAIssue]:
    issues = []
    for key in ["hero", "conflict", "resolution", "quelina"]:
        err = validate_asset(getattr(story.assets, key))
        if err:
            sev = "blocker" if key in ("hero", "quelina") else "warning"
            issues.append(QAIssue(sev, f"story {story.numero}", f"{key}: {err}"))
    if wc(story.body) == 0:
        issues.append(QAIssue("blocker", f"story {story.numero}", "empty body"))
    if wc(story.quelina_text) > 80:
        issues.append(QAIssue("warning", f"story {story.numero}", "quelina text may be too long"))
    return issues


# ============================================================
# CSS EDITORIAL
# ============================================================
CSS_EDITORIAL = f"""
@page {{ size: {PAGE_W} {PAGE_H}; margin: 0; }}
html, body {{ margin: 0; padding: 0; font-family: {FONT_SERIF}; color: #2e241c; background: #f8f4eb; }}
* {{ box-sizing: border-box; }}

.page {{ width: {PAGE_W}; height: {PAGE_H}; position: relative; page-break-after: always; overflow: hidden; background: #f8f4eb; }}
.full-bleed {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}

/* HERO */
.hero-overlay {{ position: absolute; inset: auto 0 0 0; height: 48%;
  background: linear-gradient(to top, rgba(10,8,6,0.94) 0%, rgba(10,8,6,0.78) 18%, rgba(10,8,6,0.42) 42%, rgba(10,8,6,0.14) 70%, transparent 100%); }}
.hero-text {{ position: absolute; left: 7%; right: 7%; bottom: 9%; color: #fefae0; }}
.hero-number {{ font-size: 40pt; font-weight: 700; color: #c99734; text-shadow: 0 2px 8px rgba(0,0,0,.55); margin-bottom: 8px; }}
.hero-rule {{ width: 28%; height: 2px; background: rgba(201,151,52,.9); margin: 0 0 16px; }}
.hero-title {{ font-size: 28pt; font-weight: 700; line-height: 1.12; color: #fff9ea; text-shadow: 0 2px 10px rgba(0,0,0,.55); margin: 0 0 8px; }}
.hero-subtitle {{ font-size: 15pt; color: #efe5c9; text-shadow: 0 1px 6px rgba(0,0,0,.48); }}

/* NARRATIVE */
.panel {{ padding: 0.85in 0.9in 0.7in; background: #fbf8f1; }}
.kicker {{ font-size: 10pt; letter-spacing: .08em; text-transform: uppercase; color: #9a7c52; margin-bottom: 14px; }}
.narrative {{ font-size: 14pt; line-height: 2.02; color: #2f261f; hyphens: none; text-align: left; }}
.narrative p {{ margin: 0 0 15pt; }}

/* IMAGE-LED */
.img-led-grid {{ display: grid; grid-template-columns: 1.1fr .9fr; gap: 0.4in; align-items: center; height: 100%; }}
.img-led-art {{ width: 100%; max-height: 8in; object-fit: cover; border-radius: 16px; }}
.img-led-text {{ font-size: 14pt; line-height: 1.95; color: #2f261f; }}
.img-led-text p {{ margin: 0 0 14pt; }}

/* RESOLUTION */
.reso-stack {{ display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; gap: 20px; padding: 0.7in; }}
.reso-art {{ width: 58%; aspect-ratio: 1/1; object-fit: cover; border-radius: 999px; }}
.reso-text {{ width: 80%; text-align: center; font-size: 14.5pt; line-height: 1.8; color: #2f261f; }}

/* QUELINA */
.quelina-bg {{ padding: 0.8in; background: linear-gradient(180deg, #f7f1e4, #fbf8f1); }}
.quelina-shell {{ height: 100%; border: 1.5px solid rgba(165,127,67,.30); border-radius: 20px; padding: 0.5in; background: rgba(255,255,255,.55); display: grid; grid-template-rows: auto 1fr auto; gap: 16px; }}
.quelina-head {{ text-align: center; }}
.quelina-head-title {{ font-size: 20pt; font-weight: 700; color: #8b6634; margin-bottom: 8px; }}
.quelina-divider {{ width: 80px; height: 2px; margin: 0 auto; background: rgba(165,127,67,.5); }}
.quelina-body {{ display: grid; grid-template-columns: 2.8in 1fr; gap: 0.4in; align-items: center; }}
.quelina-portrait {{ width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 999px; }}
.quelina-copy {{ font-size: 14pt; line-height: 1.75; color: #34291f; }}
.quelina-copy p {{ margin: 0 0 12pt; }}
.quelina-moraleja {{ text-align: center; font-size: 17pt; font-weight: 700; color: #8b6634; line-height: 1.4; }}

/* COVER */
.cover-overlay {{ position: absolute; inset: auto 0 0 0; height: 54%;
  background: linear-gradient(to top, rgba(12,10,8,0.92) 0%, rgba(12,10,8,0.76) 20%, rgba(12,10,8,0.40) 48%, transparent 100%); }}
.cover-copy {{ position: absolute; left: 7%; right: 7%; bottom: 9%; color: #fff7e6; }}
.cover-title {{ font-size: 30pt; font-weight: 700; line-height: 1.08; margin: 0 0 10px; }}
.cover-sub {{ font-size: 15pt; color: #f1e3ba; }}

.page-no {{ position: absolute; bottom: 0.3in; left: 50%; transform: translateX(-50%); font-size: 9pt; color: rgba(120,93,58,.5); }}
"""


# ============================================================
# TEMPLATES
# ============================================================
def _pnum(n: int) -> str:
    return f'<div class="page-no">{n}</div>'

def _paras(text: str) -> str:
    return "".join(f"<p>{esc(p)}</p>" for p in paragraphs(text))

def tmpl_cover(img: Path, title: str, sub: str, pn: int) -> str:
    return f"""<section class="page">
  <img class="full-bleed" src="{img.resolve().as_uri()}" alt="">
  <div class="cover-overlay"></div>
  <div class="cover-copy">
    <h1 class="cover-title">{esc(title)}</h1>
    <div class="cover-sub">{esc(sub)}</div>
  </div>{_pnum(pn)}
</section>"""

def tmpl_hero(s: Story, pn: int) -> str:
    return f"""<section class="page">
  <img class="full-bleed" src="{s.assets.hero.resolve().as_uri()}" alt="">
  <div class="hero-overlay"></div>
  <div class="hero-text">
    <div class="hero-number">{s.numero}</div>
    <div class="hero-rule"></div>
    <h2 class="hero-title">{esc(s.titulo)}</h2>
    <div class="hero-subtitle">{esc(s.personaje)}</div>
  </div>{_pnum(pn)}
</section>"""

def tmpl_narrative(s: Story, chunk: str, pn: int) -> str:
    return f"""<section class="page panel">
  <div class="kicker">Cuento {s.numero:02d}</div>
  <div class="narrative">{_paras(chunk)}</div>
  {_pnum(pn)}
</section>"""

def tmpl_image_led(s: Story, chunk: str, img: Path, pn: int) -> str:
    return f"""<section class="page panel">
  <div class="img-led-grid">
    <div><img class="img-led-art" src="{img.resolve().as_uri()}" alt=""></div>
    <div class="img-led-text">{_paras(chunk)}</div>
  </div>{_pnum(pn)}
</section>"""

def tmpl_resolution(s: Story, chunk: str, pn: int) -> str:
    return f"""<section class="page panel">
  <div class="reso-stack">
    <img class="reso-art" src="{s.assets.resolution.resolve().as_uri()}" alt="">
    <div class="reso-text">{_paras(chunk)}</div>
  </div>{_pnum(pn)}
</section>"""

def tmpl_quelina(s: Story, pn: int) -> str:
    qt = clean_text(s.quelina_text)
    if len(qt) > 200:
        cut = qt[:200].rfind('.')
        if cut > 50: qt = qt[:cut+1]
    return f"""<section class="page quelina-bg">
  <div class="quelina-shell">
    <div class="quelina-head">
      <div class="quelina-head-title">El Momento de Quelina</div>
      <div class="quelina-divider"></div>
    </div>
    <div class="quelina-body">
      <div><img class="quelina-portrait" src="{s.assets.quelina.resolve().as_uri()}" alt=""></div>
      <div class="quelina-copy"><p>{esc(qt)}</p></div>
    </div>
    <div class="quelina-moraleja">"{esc(s.moraleja)}"</div>
  </div>{_pnum(pn)}
</section>"""


# ============================================================
# STORY FLOW
# ============================================================
def build_story_pages(s: Story, pn: int) -> Tuple[List[str], int]:
    pages = []
    chunks = chunk_text(s.body, MAX_WORDS_IDEAL)
    if not chunks: chunks = [""]

    # HERO
    pages.append(tmpl_hero(s, pn)); pn += 1

    # LEAD narrative
    if chunks:
        pages.append(tmpl_narrative(s, chunks[0], pn)); pn += 1

    # IMAGE-LED at conflict point
    if len(chunks) > 1 and s.assets.conflict and s.assets.conflict.exists():
        pages.append(tmpl_image_led(s, chunks[1], s.assets.conflict, pn)); pn += 1

    # MID narratives
    for chunk in chunks[2:-1] if len(chunks) > 3 else []:
        pages.append(tmpl_narrative(s, chunk, pn)); pn += 1

    # RESOLUTION with closing text
    tail = chunks[-1] if len(chunks) > 2 else (chunks[-1] if len(chunks) > 1 else s.moraleja)
    if s.assets.resolution and s.assets.resolution.exists():
        pages.append(tmpl_resolution(s, tail, pn)); pn += 1
    else:
        pages.append(tmpl_narrative(s, tail, pn)); pn += 1

    # QUELINA
    pages.append(tmpl_quelina(s, pn)); pn += 1

    return pages, pn


# ============================================================
# QA
# ============================================================
def qa_all(stories: List[Story]) -> List[QAIssue]:
    issues = []
    for s in stories:
        issues.extend(validate_story(s))
        for field_name in ["body", "quelina_text", "moraleja"]:
            val = getattr(s, field_name, "")
            if any(c in val for c in ["￾", "\ufffe", "\ufffd"]):
                issues.append(QAIssue("blocker", f"story {s.numero}", f"corrupt char in {field_name}"))
    return issues

def has_blockers(issues: List[QAIssue]) -> bool:
    return any(i.severity == "blocker" for i in issues)


# ============================================================
# BUILD
# ============================================================
def build_proof(cover_img: Path, title: str, sub: str, stories: List[Story], out_name: str = "proof.pdf") -> BuildResult:
    issues = qa_all(stories)
    pdf_path = OUT_DIR / out_name

    if has_blockers(issues):
        return BuildResult(pdf_path=pdf_path, qa_issues=issues)

    # Optimize images
    prepare_assets(stories)

    pages = []
    pn = 1
    pages.append(tmpl_cover(cover_img, title, sub, pn)); pn += 1

    for s in stories:
        sp, pn = build_story_pages(s, pn)
        pages.extend(sp)

    html_doc = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body>
{"".join(pages)}
</body></html>"""

    doc = HTML(string=html_doc, base_url=str(BASE_DIR)).render(stylesheets=[CSS(string=CSS_EDITORIAL)])
    doc.write_pdf(str(pdf_path))

    return BuildResult(pdf_path=pdf_path, page_count=len(doc.pages), qa_issues=issues)


# ============================================================
# LOAD STORIES FROM JSON
# ============================================================
def load_stories(json_path: Path) -> List[Story]:
    data = json.loads(json_path.read_text(encoding="utf-8"))
    stories = []
    for d in data:
        assets = StoryAssets(
            hero=BASE_DIR / d["assets"]["hero"] if d["assets"].get("hero") else None,
            conflict=BASE_DIR / d["assets"]["conflict"] if d["assets"].get("conflict") else None,
            resolution=BASE_DIR / d["assets"]["resolution"] if d["assets"].get("resolution") else None,
            quelina=BASE_DIR / d["assets"]["quelina"] if d["assets"].get("quelina") else None,
        )
        stories.append(Story(
            numero=d["numero"], titulo=d["titulo"], personaje=d["personaje"],
            body=d["body"], moraleja=d["moraleja"], quelina_text=d["quelina_text"],
            assets=assets,
        ))
    return stories
