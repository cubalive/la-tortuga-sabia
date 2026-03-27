#!/usr/bin/env python3
"""
LA TORTUGA SABIA — EDITORIAL ENGINE v10
Complete rebuild. Modular templates. Premium CSS. WeasyPrint renderer.
No patches on v9. Clean architecture.
"""
import json, os, sys, base64, re, unicodedata
from weasyprint import HTML, CSS

# ═══════════════════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════════════════

def b64(path, max_size=800):
    """Encode local image as data URI, resized and center-seam-fixed for PDF embedding."""
    if not path or not os.path.exists(path):
        return ""
    from PIL import Image as PILImage, ImageFilter
    from io import BytesIO
    import numpy as np
    try:
        img = PILImage.open(path).convert("RGB")
        # Resize
        if img.width > max_size or img.height > max_size:
            img.thumbnail((max_size, max_size), PILImage.LANCZOS)
        # Fix center seam artifact (common in DALL-E images)
        arr = np.array(img, dtype=np.float32)
        w = arr.shape[1]
        mid = w // 2
        # Blend 6px strip around center to smooth any seam
        for offset in range(-3, 4):
            col = mid + offset
            if 1 < col < w - 2:
                weight = 0.3 + 0.7 * (abs(offset) / 3)
                arr[:, col, :] = arr[:, col, :] * weight + (arr[:, col-1, :] + arr[:, col+1, :]) / 2 * (1 - weight)
        img = PILImage.fromarray(arr.astype(np.uint8))
        buf = BytesIO()
        img.save(buf, format="JPEG", quality=82, optimize=True)
        return f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"
    except:
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode()}"


def find(tomo, num, kind):
    """Find best available image for a story."""
    for p in [
        f"public/images/stories/tomo-{tomo}/matched/story-{num}-{kind}.jpg",
        f"public/images/stories/tomo-{tomo}/story-{num}-{kind}.jpg",
    ]:
        if os.path.exists(p):
            return p
    return None


def clean(text):
    """Normalize ALL typography for clean PDF export. Zero tolerance for rendering artifacts."""
    if not text:
        return ""
    # Remove known bad Unicode
    bad = set('\ufffe\uffff\ufeff\u00ad\u200b\u200c\u200d\u2028\u2029\u2010\u2011\ufffd')
    text = ''.join(c for c in text if c not in bad)
    text = text.replace('￾', '').replace('�', '')
    # Normalize ALL fancy typography to basic ASCII
    replacements = {
        '\u2014': ' -- ', '\u2013': ' - ', '\u2012': '-', '\u2010': '-', '\u2011': '-',
        '\u2018': "'", '\u2019': "'", '\u201a': "'",
        '\u201c': '"', '\u201d': '"', '\u201e': '"',
        '\u2026': '...', '\u2022': '-',
        '\u00ab': '"', '\u00bb': '"',  # « »
        '\u2039': "'", '\u203a': "'",  # ‹ ›
        '—': ' -- ', '–': ' - ', '‐': '-',
        '«': '"', '»': '"',  # raw guillemets
        '\u00a0': ' ',  # non-breaking space
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Remove any remaining control chars
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    text = re.sub(r'  +', ' ', text)
    # Fix WeasyPrint hyphen rendering bug:
    # WeasyPrint inserts ￾ when breaking lines at hyphen-minus.
    # Wrap hyphenated compounds in nowrap spans in HTML output.
    text = re.sub(r'(\w)-(\w)', r'\1&#8209;\2', text)  # &#8209; = non-breaking hyphen HTML entity
    return text.strip()


def paragraphs(text):
    """Split text into clean paragraphs."""
    text = clean(text)
    ps = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(ps) < 3:
        sents = re.split(r'(?<=[.!?])\s+', text.strip())
        if len(sents) >= 6:
            t = len(sents) // 3
            ps = [" ".join(sents[:t]), " ".join(sents[t:t*2]), " ".join(sents[t*2:])]
    return [p for p in ps if p.strip()]


def chunks(paras, limit=80):
    """Group paragraphs into page-sized chunks (80 words ideal)."""
    result, cur, words = [], [], 0
    for p in paras:
        pw = len(p.split())
        if words + pw > limit and cur:
            result.append(cur)
            cur, words = [p], pw
        else:
            cur.append(p)
            words += pw
    if cur:
        result.append(cur)
    return result


# ═══════════════════════════════════════════════════════════════
# TEMPLATES — Each returns an HTML string
# ═══════════════════════════════════════════════════════════════

def tmpl_cover(tomo_num, title, subtitle, img_uri):
    return f"""<div class="hero">
  {f'<img src="{img_uri}"/>' if img_uri else ''}
  <div class="hero-grad"></div>
  <div class="hero-text">
    <p class="hero-pre">La Tortuga Sabia</p>
    <div class="hero-line"></div>
    <h1 class="hero-title">Tomo {tomo_num}</h1>
    <p class="hero-sub">{clean(title)}</p>
    <p class="hero-detail">{clean(subtitle)}</p>
  </div>
  <p class="hero-footer">CUBALIVE · PASSKAL LLC · Las Vegas</p>
</div>"""


def tmpl_credits():
    return """<div class="front credits">
  <p><strong>© 2025 CUBALIVE</strong></p>
  <p>Publicado por PASSKAL LLC</p>
  <p>Las Vegas, Nevada, USA</p>
  <p class="gap">latortugasabia.com</p>
  <p>Todos los derechos reservados.</p>
  <p>Ilustraciones: DALL-E 3</p>
  <p>Historias: Claude AI</p>
  <p class="gap"><strong>Primera edición digital — 2025</strong></p>
</div>"""


def tmpl_dedication():
    return """<div class="front dedic">
  <p>Para todos los niños que todavía</p>
  <p>creen que las tortugas pueden hablar</p>
  <p>con las estrellas...</p>
  <p class="gap">Y para los padres que se detienen</p>
  <p>un momento a escuchar.</p>
  <p class="sig">— Quelina</p>
</div>"""


def tmpl_toc(stories):
    rows = ""
    for s in stories:
        n = str(s.get("numero", "")).zfill(2)
        rows += f'<div class="toc-row"><span class="toc-n">{n}</span><span class="toc-t">{clean(s.get("titulo",""))}</span><span class="toc-c">{clean(s.get("personaje",""))}</span></div>\n'
    return f'<div class="front toc"><h2>Índice</h2>\n{rows}</div>'


def tmpl_transition():
    return '<div class="front trans"><p>Que comience la magia...</p><p class="orn">◆</p></div>'


def tmpl_hero_opening(num, title, character, img_uri):
    return f"""<div class="hero">
  {f'<img src="{img_uri}"/>' if img_uri else ''}
  <div class="hero-grad"></div>
  <div class="hero-text">
    <p class="hero-num">{num}</p>
    <div class="hero-line"></div>
    <h2 class="hero-title">{clean(title)}</h2>
    <p class="hero-char">{clean(character)}</p>
  </div>
</div>"""


def tmpl_narrative(chunk_paras):
    ps = "".join(f"<p>{clean(p)}</p>" for p in chunk_paras)
    return f'<div class="narrative">{ps}</div>'


def tmpl_image_led(chunk_paras, img_uri):
    ps = "".join(f"<p>{clean(p)}</p>" for p in chunk_paras)
    img_html = f'<div class="img-center"><img src="{img_uri}"/></div>' if img_uri else ""
    return f'{img_html}<div class="narrative">{ps}</div>'


def tmpl_emotional_pause(img_uri, quote=""):
    q = f'<p class="pause-quote">{clean(quote)}</p>' if quote else ""
    img = f'<img class="pause-img" src="{img_uri}"/>' if img_uri else ""
    return f'<div class="pause">{img}{q}</div>'


def tmpl_quelina(img_uri, message, moraleja):
    """Quelina Signature — premium, iconic, warm. Not a box of text."""
    img = f'<div class="quel-portrait"><img src="{img_uri}"/></div>' if img_uri else ""
    # Keep message SHORT — max 2 sentences for concentrated wisdom
    msg = clean(message)
    if len(msg) > 200:
        # Truncate to last sentence within 200 chars
        cut = msg[:200].rfind('.')
        if cut > 50:
            msg = msg[:cut+1]
    moral = clean(moraleja)
    return f"""<div class="quelina">
  {img}
  <div class="quel-panel">
    <p class="quel-title">El Momento de Quelina</p>
    <div class="quel-sep"></div>
    <p class="quel-msg">{msg}</p>
    <div class="quel-sep"></div>
    <p class="quel-moral">« {moral} »</p>
  </div>
</div>"""


def tmpl_back_author():
    return """<div class="back">
  <h2>Sobre el Autor</h2>
  <p>CUBALIVE es un creador digital, padre y soñador. Desde Las Vegas,
  combina IA, arte y narrativa para crear experiencias que abrazan,
  enseñan y acompañan.</p>
  <p><strong>latortugasabia.com</strong></p>
</div>"""


def tmpl_back_collection():
    return """<div class="back">
  <h2>La Colección</h2>
  <p><strong>Tomo I</strong> — El Bosque Encantado (0–2 años)</p>
  <p><strong>Tomo II</strong> — El Bosque de los Sentimientos (3–4 años)</p>
  <p><strong>Tomo III</strong> — El Río de los Sueños (5–6 años)</p>
  <p><strong>Tomo IV</strong> — La Montaña de la Sabiduría (7–9 años)</p>
  <p><em>200 cuentos terapéuticos para niños de 0 a 9 años</em></p>
</div>"""


# ═══════════════════════════════════════════════════════════════
# CSS — COMPLETE EDITORIAL SYSTEM
# ═══════════════════════════════════════════════════════════════

CSS_EDITORIAL = """
/* ═══ PAGE ═══ */
@page { size: 8.5in 11in; margin: 0.9in 0.8in 0.7in 0.8in;
  @bottom-center { content: counter(page); font: 9pt Georgia; color: #b8a080; } }
@page :blank { @bottom-center { content: none; } }
@page hero { margin: 0; @bottom-center { content: none; } }
@page front { @bottom-center { content: none; } }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font: 13.5pt/2 Georgia, 'Times New Roman', serif; color: #2a1a08; }

/* ═══ HERO OPENING — CINEMATIC, NO ARTIFACTS ═══ */
.hero { page: hero; page-break-after: always;
  width: 8.5in; height: 11in; position: relative; overflow: hidden; }
.hero > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  image-rendering: auto; }
.hero-grad { position: absolute; inset: 0;
  background: linear-gradient(0deg,
    rgba(5,8,14, 0.95) 0%,
    rgba(5,8,14, 0.80) 15%,
    rgba(5,8,14, 0.55) 30%,
    rgba(5,8,14, 0.30) 45%,
    rgba(0,0,0, 0.10) 65%,
    transparent 100%); }
.hero-text { position: absolute; bottom: 0; left: 0; right: 0;
  padding: 0.5in 0.85in 0.7in; z-index: 1; }
.hero-pre { font: bold 14pt Georgia; color: #c9882a; letter-spacing: 3pt;
  text-transform: uppercase; margin-bottom: 4pt; }
.hero-num { font: bold 42pt Georgia; color: rgba(201,136,42,0.6);
  margin-bottom: 0; line-height: 1; }
.hero-line { width: 2in; height: 1.5pt; background: rgba(201,136,42,0.5);
  margin: 6pt 0 12pt; }
.hero-title, .hero h1, .hero h2 {
  font: bold 30pt/1.15 Georgia; color: #fefae0; margin: 0 0 8pt;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
.hero-sub { font: italic 16pt Georgia; color: #e8b84b; margin: 0 0 4pt;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
.hero-char { font: italic 16pt Georgia; color: #e8b84b; margin: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
.hero-detail { font: 11pt Georgia; color: rgba(254,250,224,0.5); margin-top: 2pt; }
.hero-footer { position: absolute; bottom: 12pt; left: 0; right: 0;
  text-align: center; font: 9pt Georgia; color: rgba(254,250,224,0.35); }

/* ═══ FRONTMATTER ═══ */
.front { page: front; page-break-after: always; }
.credits { padding-top: 52%; text-align: center; font-size: 10.5pt; line-height: 2; color: #888; }
.credits .gap { margin-top: 10pt; }
.dedic { padding-top: 30%; text-align: center; font: italic 20pt/2 Georgia; color: #c9882a; }
.dedic .gap { margin-top: 14pt; }
.dedic .sig { margin-top: 18pt; font-size: 16pt; color: #e8b84b; font-style: normal; }
.toc { padding-top: 0; }
.toc h2 { font: bold 28pt Georgia; color: #c9882a; text-align: center;
  margin-bottom: 14pt; padding-bottom: 8pt; border-bottom: 2pt solid #e8b84b; }
.toc-row { display: flex; align-items: baseline; padding: 2.5pt 0;
  border-bottom: 0.5pt dotted #ddd; font-size: 12pt; line-height: 1.9; }
.toc-n { color: #c9882a; font-weight: bold; min-width: 26pt; }
.toc-t { flex: 1; color: #2a1a08; }
.toc-c { color: #c9882a; font-style: italic; font-size: 10pt; text-align: right; }
.trans { padding-top: 38%; text-align: center; }
.trans p { font: italic 24pt Georgia; color: #c9882a; }
.trans .orn { font-size: 14pt; color: #e8b84b; margin-top: 10pt; }

/* ═══ NARRATIVE — WARM & BREATHABLE ═══ */
.narrative { font-size: 14pt; line-height: 2.05; text-align: left;
  hyphens: none; word-break: normal; overflow-wrap: break-word;
  orphans: 3; widows: 3; color: #2a1a08; }
.narrative p { margin-bottom: 16pt; text-indent: 20pt; }
.narrative p:first-of-type { text-indent: 0; }

/* ═══ IMAGE CENTER ═══ */
.img-center { text-align: center; margin: 16pt 0 20pt; page-break-inside: avoid; }
.img-center img { max-width: 5in; max-height: 4in; border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

/* ═══ EMOTIONAL PAUSE ═══ */
.pause { page-break-before: always; text-align: center; padding-top: 1.8in; }
.pause-img { max-width: 4.5in; max-height: 4.5in; border-radius: 50%;
  box-shadow: 0 0 24px rgba(45,106,79,0.1); margin-bottom: 20pt; }
.pause-quote { font: italic 15pt/1.5 Georgia; color: #1b3a2d;
  max-width: 4.5in; margin: 0 auto; }

/* ═══ QUELINA SIGNATURE — MEMORABLE & WARM ═══ */
.quelina { page-break-before: always; padding-top: 0.5in; }
.quel-portrait { text-align: center; margin-bottom: 20pt; }
.quel-portrait img { width: 3.2in; height: 3.2in; object-fit: cover;
  border-radius: 50%; box-shadow: 0 0 40px rgba(201,136,42,0.25),
  0 0 80px rgba(201,136,42,0.08); }
.quel-panel { background: linear-gradient(180deg, #fffdf0 0%, #fff6d0 100%);
  border: 3pt solid #c9882a; border-radius: 16pt;
  padding: 28pt 32pt; position: relative;
  box-shadow: 0 4pt 20pt rgba(201,136,42,0.08); }
.quel-title { font: bold italic 20pt Georgia; color: #b07820;
  text-align: center; margin-bottom: 10pt; letter-spacing: 1pt; }
.quel-sep { width: 45%; height: 2pt; margin: 10pt auto;
  background: linear-gradient(90deg, transparent, #c9882a, transparent); }
.quel-msg { font: italic 14pt/1.8 Georgia; color: #3d2510;
  text-align: center; margin: 14pt 0; }
.quel-moral { font: bold italic 20pt/1.25 Georgia; color: #a06a18;
  text-align: center; margin-top: 16pt; letter-spacing: 0.5pt; }

/* ═══ BACK MATTER ═══ */
.back { page-break-before: always; text-align: center; padding-top: 2.2in; }
.back h2 { font: bold 22pt Georgia; color: #c9882a; margin-bottom: 14pt; }
.back p { font-size: 12pt; color: #666; line-height: 1.8;
  max-width: 4.2in; margin: 0 auto 6pt; }
"""


# ═══════════════════════════════════════════════════════════════
# BOOK BUILDER
# ═══════════════════════════════════════════════════════════════

TOMO = {
    1: ("El Bosque Encantado", "50 cuentos terapéuticos · 0–2 años"),
    2: ("El Bosque de los Sentimientos", "50 cuentos · 3–4 años"),
    3: ("El Río de los Sueños", "50 cuentos · 5–6 años"),
    4: ("La Montaña de la Sabiduría", "50 cuentos · 7–9 años"),
}


def build_book(tomo_num, stories):
    title, subtitle = TOMO.get(tomo_num, ("", ""))
    cover_uri = b64("public/images/portada-b.jpg")

    sections = []

    # Front matter
    sections.append(tmpl_cover(tomo_num, title, subtitle, cover_uri))
    sections.append(tmpl_credits())
    sections.append(tmpl_dedication())
    sections.append(tmpl_toc(stories))
    sections.append(tmpl_transition())

    # Stories
    prev_layout = ""
    for idx, s in enumerate(stories):
        n = s.get("numero", 0)

        # Images — use ALL available types
        i_hero = b64(find(tomo_num, n, "historia") or find(tomo_num, n, "portada"))
        i_mid = b64(find(tomo_num, n, "problema"))
        i_reso = b64(find(tomo_num, n, "resolucion"))
        i_quel = b64(find(tomo_num, n, "quelina"))

        # Text — 80 words per page for breathing
        paras = paragraphs(s.get("historia", ""))
        text_chunks = chunks(paras, limit=80)

        # ── HERO OPENING ──
        sections.append(tmpl_hero_opening(
            n, s.get("titulo", ""), s.get("personaje", ""), i_hero))

        # ── TEXT PAGES with image-led at conflict point ──
        for ci, chunk in enumerate(text_chunks):
            if ci == 1 and i_mid and prev_layout != "image_led":
                sections.append(tmpl_image_led(chunk, i_mid))
                prev_layout = "image_led"
            elif ci == len(text_chunks) - 1 and i_reso and len(text_chunks) > 2:
                # Last text chunk: pair with resolution image for flow
                sections.append(tmpl_image_led(chunk, i_reso))
                prev_layout = "image_led"
            else:
                sections.append(tmpl_narrative(chunk))
                prev_layout = "narrative"

        # ── QUELINA SIGNATURE (directly after text, no dead page between) ──
        qt = s.get("quelina_momento", "").strip()
        qm = s.get("moraleja", "").strip()
        if qt or qm:
            sections.append(tmpl_quelina(i_quel, qt, qm))

    # Back matter
    sections.append(tmpl_back_author())
    sections.append(tmpl_back_collection())

    html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body>\n'
    html += '\n'.join(sections)
    html += '\n</body></html>'
    return html


def generate(tomo_num, output, max_stories=None):
    print(f"═══ Editorial Engine v10 — Tomo {tomo_num} ═══")
    stories = json.load(open(f"public/stories/tomo-{tomo_num}/all-stories.json"))
    stories.sort(key=lambda s: s.get("numero", 0))
    if max_stories:
        stories = stories[:max_stories]
    print(f"Stories: {len(stories)}")

    print("Building HTML...")
    html = build_book(tomo_num, stories)
    print(f"HTML: {len(html)//1024}KB")

    print("Rendering PDF...")
    os.makedirs(os.path.dirname(output), exist_ok=True)
    doc = HTML(string=html).render(stylesheets=[CSS(string=CSS_EDITORIAL)])
    doc.write_pdf(output)

    mb = os.path.getsize(output) / 1024 / 1024
    print(f"\n✅ {output}")
    print(f"   Pages: {len(doc.pages)}")
    print(f"   Size: {mb:.1f} MB")


if __name__ == "__main__":
    t = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    n = int(sys.argv[2]) if len(sys.argv) > 2 else None
    generate(t, f"public/downloads/la-tortuga-sabia-tomo-{t}-v10.pdf", n)
