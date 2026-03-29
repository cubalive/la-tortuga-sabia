from __future__ import annotations

import html
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from weasyprint import HTML, CSS


# ============================================================
# CONFIG
# ============================================================

EDITORIAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EDITORIAL_DIR.parent
ASSETS_DIR = EDITORIAL_DIR / "assets"  # assets live inside editorial/
OUTPUT_DIR = EDITORIAL_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PAGE_W = "8.5in"
PAGE_H = "11in"

FONT_STACK_SERIF = '"Liberation Serif", Georgia, serif'
FONT_STACK_DISPLAY = '"Liberation Serif", Georgia, serif'

MAX_WORDS_NARRATIVE_IDEAL = 120
MAX_WORDS_NARRATIVE_HARD = 130


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
    severity: str   # blocker | warning | info
    page_hint: str
    issue: str


@dataclass
class BuildResult:
    pdf_path: Path
    qa_issues: List[QAIssue] = field(default_factory=list)
    total_pages_estimate: int = 0


# ============================================================
# SANITIZATION
# ============================================================

BAD_CONTROL_CHARS = re.compile(r"[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFE\uFFFF]")
MULTISPACE = re.compile(r"[ \t]+")
BAD_VISIBLE_CORRUPT = ["\ufffe", "\ufffd"]


def clean_text(text: str) -> str:
    if not text:
        return ""

    replacements = {
        "\u00ab": '"', "\u00bb": '"',
        "\u201c": '"', "\u201d": '"', "\u201e": '"',
        "\u2018": "'", "\u2019": "'", "\u201a": "'",
        "\u2014": "-", "\u2013": "-",
        "\u2026": "...",
        "\u00a0": " ",
        "\u200b": "", "\u200c": "", "\u200d": "",
        "\u2060": "", "\ufeff": "",
    }

    for src, dst in replacements.items():
        text = text.replace(src, dst)

    text = BAD_CONTROL_CHARS.sub("", text)
    text = MULTISPACE.sub(" ", text)
    text = re.sub(r" ?\n ?", "\n", text)
    # FIX: Replace ALL word-internal hyphens with non-breaking hyphen (U+2011)
    # WeasyPrint inserts ￾ when it breaks lines at regular hyphens
    NB_HYPHEN = '\u2011'
    text = re.sub(r'(\w)-(\w)', lambda m: m.group(1) + NB_HYPHEN + m.group(2), text)
    return text.strip()


def escape(text: str) -> str:
    return html.escape(clean_text(text), quote=True)


def paragraphs(text: str) -> List[str]:
    return [p.strip() for p in clean_text(text).split("\n") if p.strip()]


def word_count(text: str) -> int:
    return len(re.findall(r"\S+", clean_text(text)))


def chunk_paragraphs_for_narrative(text: str, soft_limit: int = MAX_WORDS_NARRATIVE_IDEAL) -> List[str]:
    paras = paragraphs(text)
    if not paras:
        return [""]

    chunks: List[str] = []
    current: List[str] = []
    current_words = 0

    for p in paras:
        wc = word_count(p)
        if current and current_words + wc > soft_limit:
            chunks.append("\n\n".join(current))
            current = [p]
            current_words = wc
        else:
            current.append(p)
            current_words += wc

    if current:
        chunks.append("\n\n".join(current))

    return chunks


# ============================================================
# JSON / STORY LOADING
# ============================================================

def resolve_project_path(relative_path: str) -> Path:
    return (PROJECT_ROOT / relative_path).resolve()


def story_from_payload(item: Dict) -> Story:
    assets_payload = item.get("assets", {})
    assets = StoryAssets(
        hero=resolve_project_path(assets_payload["hero"]) if assets_payload.get("hero") else None,
        conflict=resolve_project_path(assets_payload["conflict"]) if assets_payload.get("conflict") else None,
        resolution=resolve_project_path(assets_payload["resolution"]) if assets_payload.get("resolution") else None,
        quelina=resolve_project_path(assets_payload["quelina"]) if assets_payload.get("quelina") else None,
    )

    return Story(
        numero=int(item["numero"]),
        titulo=clean_text(item.get("titulo", "")),
        personaje=clean_text(item.get("personaje", "")),
        body=clean_text(item.get("body", "")),
        moraleja=clean_text(item.get("moraleja", "")),
        quelina_text=clean_text(item.get("quelina_text", "")),
        assets=assets,
    )


def load_stories_json(path: Path) -> List[Story]:
    with path.open("r", encoding="utf-8") as f:
        raw = json.load(f)
    if not isinstance(raw, list):
        raise ValueError("stories.json debe contener una lista.")
    return [story_from_payload(item) for item in raw]


# ============================================================
# ASSET VALIDATION
# ============================================================

def validate_asset(path: Optional[Path]) -> Optional[str]:
    if path is None:
        return "missing path"
    if not path.exists():
        return f"file not found: {path}"
    if path.stat().st_size == 0:
        return f"empty file: {path}"
    return None


def validate_story_assets(story: Story) -> List[QAIssue]:
    issues: List[QAIssue] = []
    checks = {
        "hero": story.assets.hero,
        "conflict": story.assets.conflict,
        "resolution": story.assets.resolution,
        "quelina": story.assets.quelina,
    }
    for name, path in checks.items():
        err = validate_asset(path)
        if err:
            severity = "blocker" if name in {"hero", "quelina"} else "warning"
            issues.append(QAIssue(severity, f"story {story.numero}", f"{name} asset error: {err}"))
    return issues


def validate_story_text(story: Story) -> List[QAIssue]:
    issues: List[QAIssue] = []
    if not story.body.strip():
        issues.append(QAIssue("blocker", f"story {story.numero}", "empty story body"))
    for bad in BAD_VISIBLE_CORRUPT:
        if bad in story.body or bad in story.quelina_text or bad in story.moraleja:
            issues.append(QAIssue("blocker", f"story {story.numero}", f"corrupt character detected"))
    if word_count(story.quelina_text) > 75:
        issues.append(QAIssue("warning", f"story {story.numero}", "Quelina text may be too long"))
    return issues


def qa_all(stories: List[Story], cover_image: Optional[Path] = None) -> List[QAIssue]:
    issues: List[QAIssue] = []
    if cover_image:
        err = validate_asset(cover_image)
        if err:
            issues.append(QAIssue("blocker", "cover", f"cover asset error: {err}"))
    for story in stories:
        issues.extend(validate_story_assets(story))
        issues.extend(validate_story_text(story))
    return issues


def has_blockers(issues: List[QAIssue]) -> bool:
    return any(i.severity == "blocker" for i in issues)


# ============================================================
# CSS EDITORIAL
# ============================================================

CSS_EDITORIAL = f"""
@page {{ size: {PAGE_W} {PAGE_H}; margin: 0; }}
html, body {{ margin: 0; padding: 0; background: #f8f4eb; color: #2e241c; font-family: {FONT_STACK_SERIF}; }}
* {{ box-sizing: border-box; }}
body {{ -weasy-hyphens: none; }}

.page {{ width: {PAGE_W}; height: {PAGE_H}; position: relative; overflow: hidden; background: #fbf8f1; page-break-after: always; }}
.full-bleed {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
.page-no {{ position: absolute; bottom: 0.28in; left: 50%; transform: translateX(-50%); font-size: 9pt; color: rgba(120,93,58,.55); }}

.cover-page {{ background: #12100f; }}
.cover-overlay {{ position: absolute; inset: auto 0 0 0; height: 54%;
  background: linear-gradient(to top, rgba(12,10,8,0.92) 0%, rgba(12,10,8,0.76) 20%, rgba(12,10,8,0.40) 48%, rgba(12,10,8,0.12) 75%, transparent 100%); }}
.cover-copy {{ position: absolute; left: 7%; right: 7%; bottom: 9%; color: #fff7e6; }}
.cover-title {{ font-family: {FONT_STACK_DISPLAY}; font-size: 31pt; line-height: 1.08; font-weight: 700; margin: 0 0 10px; color: #fff9ea; text-shadow: 0 2px 12px rgba(0,0,0,.55); }}
.cover-subtitle {{ font-size: 16pt; line-height: 1.25; color: #f1e3ba; text-shadow: 0 1px 8px rgba(0,0,0,.48); }}

.hero-page {{ background: #0f0d0b; }}
.hero-overlay {{ position: absolute; inset: auto 0 0 0; height: 48%;
  background: linear-gradient(to top, rgba(14,10,8,0.94) 0%, rgba(14,10,8,0.78) 18%, rgba(14,10,8,0.42) 42%, rgba(14,10,8,0.14) 70%, transparent 100%); }}
.hero-text {{ position: absolute; left: 7%; right: 7%; bottom: 9%; color: #fefae0; }}
.hero-number {{ font-size: 42pt; font-weight: 700; line-height: 1; color: #c99734; text-shadow: 0 2px 8px rgba(0,0,0,.55); margin-bottom: 10px; }}
.hero-rule {{ width: 28%; height: 2px; background: rgba(201,151,52,.9); margin: 0 0 18px; }}
.hero-title {{ font-family: {FONT_STACK_DISPLAY}; font-size: 28pt; font-weight: 700; line-height: 1.12; margin: 0 0 8px; color: #fff9ea; text-shadow: 0 2px 12px rgba(0,0,0,.55); }}
.hero-subtitle {{ font-size: 16pt; line-height: 1.2; color: #efe5c9; text-shadow: 0 1px 8px rgba(0,0,0,.48); }}

.panel-page {{ padding: 0.95in 1in 0.85in; background: #fbf8f1; }}
.kicker {{ font-size: 9pt; letter-spacing: .12em; text-transform: uppercase; color: #bfaa88; margin-bottom: 24px; }}
.narrative-text {{ font-size: 15pt; line-height: 2.15; color: #2f261f; hyphens: none; text-align: left; }}
.narrative-text p {{ margin: 0 0 22pt; }}

.image-led-grid {{ display: grid; grid-template-columns: 1.1fr .9fr; gap: 0.45in; align-items: center; height: 100%; }}
.image-led-art {{ width: 100%; max-height: 8.2in; object-fit: cover; border-radius: 18px; }}
.image-led-copy {{ font-size: 14pt; line-height: 1.95; color: #2f261f; hyphens: none; }}
.image-led-copy p {{ margin: 0 0 16pt; }}

.resolution-stack {{ display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; gap: 22px; padding: 0.7in 0.8in; }}
.resolution-art {{ width: 63%; aspect-ratio: 1/1; object-fit: cover; border-radius: 999px; }}
.resolution-text {{ width: 80%; text-align: center; font-size: 15pt; line-height: 1.8; color: #2f261f; }}

.quelina-page {{ padding: 0.65in 0.8in 0.7in; background: linear-gradient(180deg, #f3ecdb, #f9f6ee); }}
.quelina-shell {{ height: 100%; border: 2.5px solid rgba(122,88,40,.4); border-radius: 28px; padding: 0.45in 0.5in; background: linear-gradient(145deg, rgba(255,252,238,.8), rgba(255,255,252,.6)); display: grid; grid-template-rows: auto 1fr auto; gap: 18px; box-shadow: 0 6px 32px rgba(122,88,40,.1), inset 0 1px 0 rgba(255,255,255,.5); }}
.quelina-head {{ text-align: center; padding-top: 8px; }}
.quelina-title {{ font-size: 26pt; font-weight: 700; color: #6b4c1e; margin-bottom: 14px; letter-spacing: 0.03em; }}
.quelina-divider {{ width: 120px; height: 2.5px; margin: 0 auto; background: linear-gradient(90deg, transparent, rgba(122,88,40,.65), transparent); }}
.quelina-body {{ display: grid; grid-template-columns: 3.2in 1fr; gap: 0.5in; align-items: center; }}
.quelina-portrait {{ width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 999px; box-shadow: 0 0 28px rgba(122,88,40,.15), 0 0 0 3px rgba(122,88,40,.08); }}
.quelina-copy {{ font-size: 16pt; line-height: 1.85; color: #2e2318; font-style: italic; }}
.quelina-copy p {{ margin: 0 0 16pt; }}
.quelina-moraleja {{ text-align: center; font-size: 22pt; line-height: 1.35; font-weight: 700; color: #6b4c1e; padding-top: 14px; border-top: 2px solid rgba(122,88,40,.3); letter-spacing: 0.01em; }}

.final-page {{ background: #f8f4eb; display: flex; align-items: center; justify-content: center; padding: 1.2in; text-align: center; }}
.final-shell {{ max-width: 6.4in; }}
.final-title {{ font-size: 28pt; line-height: 1.1; color: #8b6634; margin: 0 0 18px; font-weight: 700; }}
.final-copy {{ font-size: 16pt; line-height: 1.8; color: #3a2d23; }}
.final-copy p {{ margin: 0 0 12pt; }}
"""


# ============================================================
# HELPERS
# ============================================================

def img_src(path: Path) -> str:
    return path.resolve().as_uri()


def page_number(n: int) -> str:
    return f'<div class="page-no">{n}</div>'


def render_paragraphs_html(text: str) -> str:
    return "".join(f"<p>{escape(p)}</p>" for p in paragraphs(text))


# ============================================================
# TEMPLATES
# ============================================================

def tmpl_cover(cover_image: Path, title: str, subtitle: str, pn: int) -> str:
    return f'<section class="page cover-page"><img class="full-bleed" src="{img_src(cover_image)}" alt=""><div class="cover-overlay"></div><div class="cover-copy"><h1 class="cover-title">{escape(title)}</h1><div class="cover-subtitle">{escape(subtitle)}</div></div>{page_number(pn)}</section>'


def tmpl_hero_opening(story: Story, pn: int) -> str:
    return f'<section class="page hero-page"><img class="full-bleed" src="{img_src(story.assets.hero)}" alt=""><div class="hero-overlay"></div><div class="hero-text"><div class="hero-number">{story.numero}</div><div class="hero-rule"></div><h2 class="hero-title">{escape(story.titulo)}</h2><div class="hero-subtitle">{escape(story.personaje)}</div></div>{page_number(pn)}</section>'


def tmpl_narrative(story: Story, chunk: str, pn: int) -> str:
    return f'<section class="page panel-page"><div class="kicker">Cuento {story.numero:02d}</div><div class="narrative-text">{render_paragraphs_html(chunk)}</div>{page_number(pn)}</section>'


def tmpl_image_led(story: Story, chunk: str, img_path: Path, pn: int) -> str:
    return f'<section class="page panel-page"><div class="image-led-grid"><div><img class="image-led-art" src="{img_src(img_path)}" alt=""></div><div class="image-led-copy">{render_paragraphs_html(chunk)}</div></div>{page_number(pn)}</section>'


def tmpl_resolution_page(story: Story, chunk: str, pn: int) -> str:
    return f'<section class="page panel-page"><div class="resolution-stack"><img class="resolution-art" src="{img_src(story.assets.resolution)}" alt=""><div class="resolution-text">{render_paragraphs_html(chunk)}</div></div>{page_number(pn)}</section>'


def tmpl_quelina(story: Story, pn: int) -> str:
    return f'<section class="page quelina-page"><div class="quelina-shell"><div class="quelina-head"><div class="quelina-title">El Momento de Quelina</div><div class="quelina-divider"></div></div><div class="quelina-body"><div><img class="quelina-portrait" src="{img_src(story.assets.quelina)}" alt=""></div><div class="quelina-copy">{render_paragraphs_html(story.quelina_text)}</div></div><div class="quelina-moraleja">"{escape(story.moraleja)}"</div></div>{page_number(pn)}</section>'


def tmpl_final_closing(title: str, copy: str, pn: int) -> str:
    return f'<section class="page final-page"><div class="final-shell"><h2 class="final-title">{escape(title)}</h2><div class="final-copy">{render_paragraphs_html(copy)}</div></div>{page_number(pn)}</section>'


# ============================================================
# STORY FLOW
# ============================================================

def split_story_for_templates(story: Story) -> Dict[str, List[str]]:
    chunks = chunk_paragraphs_for_narrative(story.body, MAX_WORDS_NARRATIVE_IDEAL)
    result = {"lead": [], "mid": [], "tail": []}
    if len(chunks) == 1:
        result["lead"] = [chunks[0]]
    elif len(chunks) == 2:
        result["lead"] = [chunks[0]]
        result["tail"] = [chunks[1]]
    else:
        result["lead"] = [chunks[0]]
        result["mid"] = chunks[1:-1]
        result["tail"] = [chunks[-1]]
    return result


def build_story_pages(story: Story, pn: int) -> Tuple[List[str], int]:
    pages = []
    split = split_story_for_templates(story)

    pages.append(tmpl_hero_opening(story, pn)); pn += 1

    for chunk in split["lead"]:
        pages.append(tmpl_narrative(story, chunk, pn)); pn += 1

    if story.assets.conflict and split["mid"]:
        pages.append(tmpl_image_led(story, split["mid"][0], story.assets.conflict, pn)); pn += 1
        for chunk in split["mid"][1:]:
            pages.append(tmpl_narrative(story, chunk, pn)); pn += 1
    else:
        for chunk in split["mid"]:
            pages.append(tmpl_narrative(story, chunk, pn)); pn += 1

    tail_text = "\n\n".join(split["tail"]) if split["tail"] else story.moraleja
    if story.assets.resolution:
        pages.append(tmpl_resolution_page(story, tail_text, pn)); pn += 1
    else:
        pages.append(tmpl_narrative(story, tail_text, pn)); pn += 1

    pages.append(tmpl_quelina(story, pn)); pn += 1
    return pages, pn


# ============================================================
# DOCUMENT BUILD
# ============================================================

def wrap_document(pages: List[str]) -> str:
    return f"<!doctype html><html lang='es'><head><meta charset='utf-8'><style>{CSS_EDITORIAL}</style></head><body>{''.join(pages)}</body></html>"


def build_proof(
    cover_image: Path,
    cover_title: str,
    cover_subtitle: str,
    stories: List[Story],
    output_name: str = "proof_5_stories.pdf",
    include_final_closing: bool = False,
    final_title: str = "Hasta aqui por hoy",
    final_copy: str = "Cada cuento deja una luz pequena. Y esa luz sigue creciendo en el corazon.",
) -> BuildResult:
    issues = qa_all(stories, cover_image=cover_image)
    pdf_path = OUTPUT_DIR / output_name

    if has_blockers(issues):
        return BuildResult(pdf_path=pdf_path, qa_issues=issues)

    pages = []
    pn = 1
    pages.append(tmpl_cover(cover_image, cover_title, cover_subtitle, pn)); pn += 1

    for story in stories:
        sp, pn = build_story_pages(story, pn)
        pages.extend(sp)

    if include_final_closing:
        pages.append(tmpl_final_closing(final_title, final_copy, pn)); pn += 1

    html_doc = wrap_document(pages)
    HTML(string=html_doc, base_url=str(PROJECT_ROOT)).write_pdf(str(pdf_path), stylesheets=[CSS(string=CSS_EDITORIAL)])

    return BuildResult(pdf_path=pdf_path, qa_issues=issues, total_pages_estimate=pn - 1)
