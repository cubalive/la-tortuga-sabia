#!/usr/bin/env python3
"""
LA TORTUGA SABIA — EDITORIAL ENGINE v7
Complete rebuild: HTML/CSS Paged Media → WeasyPrint PDF
Every story gets multiple images. Real text flow. Premium typography.
"""
import json, os, sys, base64, textwrap
from pathlib import Path
from weasyprint import HTML, CSS

# ═══════════════════════════════════════
# ASSET HELPERS
# ═══════════════════════════════════════
def b64(path):
    if not path or not os.path.exists(path):
        return ""
    ext = path.rsplit(".", 1)[-1].lower()
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}.get(ext, "image/jpeg")
    with open(path, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"

def find_img(tomo, num, kind):
    for p in [
        f"public/images/stories/tomo-{tomo}/matched/story-{num}-{kind}.jpg",
        f"public/images/stories/tomo-{tomo}/story-{num}-{kind}.jpg",
    ]:
        if os.path.exists(p):
            return p
    return None

TOMO = {
    1: ("El Bosque Encantado", "50 cuentos terapéuticos · 0–2 años", "#2D6A4F"),
    2: ("El Bosque de los Sentimientos", "50 cuentos sobre emociones · 3–4 años", "#C9882A"),
    3: ("El Río de los Sueños", "50 cuentos de aventura · 5–6 años", "#4682B4"),
    4: ("La Montaña de la Sabiduría", "50 cuentos de valores · 7–9 años", "#7B5EA7"),
}

# ═══════════════════════════════════════
# CSS — THE ENTIRE EDITORIAL SYSTEM
# ═══════════════════════════════════════
STYLE = """
/* ══════════════ PAGE SETUP ══════════════ */
@page {
  size: 8.5in 11in;
  margin: 0.85in 0.75in 0.7in 0.75in;
  @bottom-center {
    content: counter(page);
    font-family: Georgia, serif;
    font-size: 9pt;
    color: #C9882A;
    padding-top: 8pt;
  }
}
@page :blank { @bottom-center { content: none; } }
@page cover { margin: 0; @bottom-center { content: none; } }
@page front { @bottom-center { content: none; } }

*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: Georgia, 'Liberation Serif', 'Times New Roman', serif;
  color: #2E1A08;
  font-size: 14pt;
  line-height: 1.9;
  orphans: 3;
  widows: 3;
}

/* ══════════════ COVER ══════════════ */
.cover {
  page: cover;
  page-break-after: always;
  width: 8.5in; height: 11in;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.cover-bg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.cover-dim {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%);
}
.cover-inner {
  position: relative; z-index: 1;
  padding: 0 1in;
}
.cover h1 {
  font-size: 48pt; font-weight: bold;
  color: #C9882A; letter-spacing: 0.04em;
  margin: 0 0 12pt; text-shadow: 2px 3px 10px rgba(0,0,0,0.5);
}
.cover .tomo-line {
  font-size: 18pt; font-style: italic;
  color: #FEFAE0; margin: 0 0 6pt;
}
.cover .sub-line {
  font-size: 11pt; color: rgba(254,250,224,0.6);
}
.cover .bottom-bar {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 10pt 0; text-align: center;
  background: rgba(0,0,0,0.5);
  font-size: 9pt; color: rgba(254,250,224,0.5);
}

/* ══════════════ FRONTMATTER ══════════════ */
.frontmatter {
  page: front;
  page-break-after: always;
}
.credits {
  padding-top: 55%;
  text-align: center;
  font-size: 10pt;
  line-height: 2.2;
  color: #777;
}
.credits strong { color: #444; }
.dedication {
  padding-top: 35%;
  text-align: center;
  font-size: 18pt;
  font-style: italic;
  color: #C9882A;
  line-height: 2.2;
}
.dedication .sig {
  margin-top: 24pt;
  font-size: 15pt;
  color: #E8B84B;
}

/* ══════════════ TABLE OF CONTENTS ══════════════ */
.toc {
  page: front;
  page-break-after: always;
}
.toc h2 {
  font-size: 30pt;
  color: #C9882A;
  text-align: center;
  margin: 0 0 18pt;
  padding-bottom: 10pt;
  border-bottom: 2.5pt solid #E8B84B;
}
.toc-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 3pt 0;
  border-bottom: 0.5pt dotted #ddd;
  font-size: 12pt;
  line-height: 2;
}
.toc-num { color: #C9882A; font-weight: bold; min-width: 28pt; }
.toc-title { flex: 1; color: #2E1A08; padding: 0 6pt; }
.toc-char { color: #C9882A; font-style: italic; font-size: 10pt; text-align: right; }

/* ══════════════ STORY OPENING ══════════════ */
.story-open {
  page-break-before: always;
  text-align: center;
  padding-top: 0;
}
.story-open .hero-wrap {
  margin: 0 auto 16pt;
  width: 4.8in; height: 4.8in;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 6px 28px rgba(45,106,79,0.2);
}
.story-open .hero-wrap img {
  width: 100%; height: 100%; object-fit: cover;
}
.story-open .num {
  font-size: 42pt; font-weight: bold;
  color: #1B3A2D; margin: 0;
}
.story-open .sep {
  width: 2.8in; height: 2pt; margin: 6pt auto;
  background: linear-gradient(90deg, transparent, #C9882A, transparent);
}
.story-open .diamond {
  color: #C9882A; font-size: 9pt; margin: 2pt 0 10pt;
}
.story-open h2 {
  font-size: 26pt; font-weight: bold;
  color: #1B3A2D; margin: 0 0 6pt;
  line-height: 1.25;
}
.story-open .char {
  font-size: 16pt; font-style: italic;
  color: #C9882A; margin: 0 0 4pt;
}
.story-open .sit {
  font-size: 11pt; font-style: italic;
  color: #888; margin: 0;
}

/* ══════════════ STORY BODY ══════════════ */
.story-body {
  font-size: 14pt;
  line-height: 1.9;
  text-align: justify;
  hyphens: auto;
  -webkit-hyphens: auto;
}
.story-body p {
  margin: 0 0 10pt;
  text-indent: 24pt;
}
.story-body p:first-of-type {
  text-indent: 0;
}

/* ══════════════ MID-STORY IMAGE ══════════════ */
.mid-img-wrap {
  text-align: center;
  margin: 14pt 0 18pt;
  page-break-inside: avoid;
}
.mid-img {
  width: 4in; height: auto;
  max-height: 3.5in;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}

/* ══════════════ QUELINA SECTION ══════════════ */
.quelina-wrap {
  margin-top: 20pt;
  page-break-inside: avoid;
}
.quelina-portrait {
  text-align: center;
  margin-bottom: 14pt;
}
.quelina-portrait img {
  width: 2.6in; height: 2.6in;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 0 24px rgba(201,136,42,0.25);
}
.quelina-box {
  background: linear-gradient(135deg, #FFFCE8, #FFF7CC);
  border: 3pt solid #C9882A;
  border-radius: 14pt;
  padding: 22pt 26pt;
  position: relative;
}
.quelina-box::after {
  content: '';
  position: absolute;
  inset: 5pt;
  border: 1pt solid #E8B84B;
  border-radius: 10pt;
  pointer-events: none;
}
.quelina-box .q-title {
  font-size: 17pt; font-weight: bold; font-style: italic;
  color: #C9882A; text-align: center;
  margin: 0 0 8pt;
}
.quelina-box .q-sep {
  width: 70%; height: 1.5pt; margin: 6pt auto;
  background: linear-gradient(90deg, transparent, #E8B84B, transparent);
}
.quelina-box .q-msg {
  font-size: 13pt; font-style: italic;
  color: #3D2510; text-align: center;
  line-height: 1.75; margin: 8pt 0;
}
.quelina-box .q-moral {
  font-size: 16pt; font-weight: bold; font-style: italic;
  color: #C9882A; text-align: center;
  margin: 10pt 0 0; line-height: 1.35;
}
.sparkle {
  position: absolute; color: #E8B84B; font-size: 13pt;
}
.sparkle.tl { top: 8pt; left: 12pt; }
.sparkle.tr { top: 8pt; right: 12pt; }
.sparkle.bl { bottom: 8pt; left: 12pt; }
.sparkle.br { bottom: 8pt; right: 12pt; }

/* ══════════════ BACK MATTER ══════════════ */
.back {
  page-break-before: always;
  text-align: center;
  padding-top: 2.5in;
}
.back h2 { font-size: 24pt; color: #C9882A; margin: 0 0 18pt; }
.back p {
  font-size: 12pt; color: #666; line-height: 1.85;
  max-width: 4.5in; margin: 0 auto 12pt;
}
"""


def build_book(tomo_num):
    stories = json.load(open(f"public/stories/tomo-{tomo_num}/all-stories.json"))
    stories.sort(key=lambda s: s.get("numero", 0))
    title, subtitle, color = TOMO.get(tomo_num, ("","",""))

    cover_uri = b64("public/images/portada-b.jpg")

    # ═══ BUILD HTML ═══
    h = f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>La Tortuga Sabia — Tomo {tomo_num}</title></head><body>

<!-- COVER -->
<div class="cover">
  {f'<img class="cover-bg" src="{cover_uri}"/>' if cover_uri else ''}
  <div class="cover-dim"></div>
  <div class="cover-inner">
    <h1>La Tortuga Sabia</h1>
    <p class="tomo-line">Tomo {tomo_num} — {title}</p>
    <p class="sub-line">{subtitle}</p>
  </div>
  <div class="bottom-bar">Por CUBALIVE · PASSKAL LLC · Las Vegas, NV</div>
</div>

<!-- CREDITS -->
<div class="frontmatter credits">
  <strong>© 2025 CUBALIVE</strong><br>
  Publicado por PASSKAL LLC · Las Vegas, Nevada, USA<br><br>
  latortugasabia.com<br><br>
  Todos los derechos reservados.<br>
  Ilustraciones: DALL-E 3 · Historias: Claude AI<br><br>
  <strong>Primera edición digital — 2025</strong>
</div>

<!-- DEDICATION -->
<div class="frontmatter dedication">
  Para todos los niños que todavía<br>
  creen que las tortugas pueden hablar<br>
  con las estrellas...<br><br>
  Y para los padres que se detienen<br>
  un momento a escuchar.
  <div class="sig">— Quelina</div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="toc">
  <h2>Índice</h2>
  {''.join(f'<div class="toc-row"><span class="toc-num">{str(s.get("numero","")).zfill(2)}.</span><span class="toc-title">{s.get("titulo","")}</span><span class="toc-char">{s.get("personaje","")}</span></div>' for s in stories)}
</div>
"""

    # ═══ STORIES ═══
    for s in stories:
        n = s.get("numero", 0)

        # Find ALL images for this story
        img_historia = find_img(tomo_num, n, "historia")
        img_quelina = find_img(tomo_num, n, "quelina")
        img_portada = find_img(tomo_num, n, "portada")
        img_problema = find_img(tomo_num, n, "problema")
        img_resolucion = find_img(tomo_num, n, "resolucion")

        # Choose hero (best available)
        hero = img_historia or img_portada
        hero_uri = b64(hero) if hero else ""

        # Mid-story image (different from hero)
        mid = img_problema or img_portada
        if mid == hero:
            mid = img_resolucion
        mid_uri = b64(mid) if mid else ""

        # Quelina image
        quel_uri = b64(img_quelina) if img_quelina else ""

        # Split text into paragraphs
        text = s.get("historia", "")
        paras = [p.strip() for p in text.split("\n\n") if p.strip()]
        if not paras:
            paras = [text] if text else [""]

        # Split paragraphs: first half, mid-image, second half
        mid_point = len(paras) // 2
        first_paras = paras[:mid_point] if mid_point > 0 else paras
        second_paras = paras[mid_point:] if mid_point > 0 else []

        first_html = "".join(f"<p>{p}</p>" for p in first_paras)
        second_html = "".join(f"<p>{p}</p>" for p in second_paras)

        # ── STORY OPENING ──
        h += f"""
<div class="story-open">
  {f'<div class="hero-wrap"><img src="{hero_uri}"/></div>' if hero_uri else ''}
  <p class="num">{n}</p>
  <div class="sep"></div>
  <p class="diamond">◆</p>
  <h2>{s.get("titulo", "")}</h2>
  <p class="char">{s.get("personaje", "")}</p>
  <p class="sit">{s.get("situacion", "")}</p>
</div>
"""

        # ── STORY BODY — first half ──
        h += f'<div class="story-body">{first_html}</div>'

        # ── MID-STORY IMAGE ──
        if mid_uri:
            h += f'<div class="mid-img-wrap"><img class="mid-img" src="{mid_uri}"/></div>'

        # ── STORY BODY — second half ──
        if second_html:
            h += f'<div class="story-body">{second_html}</div>'

        # ── QUELINA SECTION ──
        quelina_text = s.get("quelina_momento", "")
        moraleja = s.get("moraleja", "")
        if quelina_text or moraleja:
            h += '<div class="quelina-wrap">'
            if quel_uri:
                h += f'<div class="quelina-portrait"><img src="{quel_uri}"/></div>'
            h += f"""<div class="quelina-box">
  <span class="sparkle tl">✦</span><span class="sparkle tr">✦</span>
  <span class="sparkle bl">✦</span><span class="sparkle br">✦</span>
  <p class="q-title">El Momento de Quelina</p>
  <div class="q-sep"></div>
  <p class="q-msg">{quelina_text}</p>
  <div class="q-sep"></div>
  <p class="q-moral">« {moraleja} »</p>
</div></div>"""

    # ═══ BACK MATTER ═══
    h += """
<div class="back">
  <h2>Sobre el Autor</h2>
  <p>CUBALIVE es un creador digital, padre y soñador que cree que la tecnología
  puede hacer del mundo un lugar más mágico para los niños.</p>
  <p><strong>latortugasabia.com</strong></p>
</div>
<div class="back">
  <h2>La Colección</h2>
  <p><strong>Tomo I</strong> — El Bosque Encantado (0–2 años)<br>
  <strong>Tomo II</strong> — El Bosque de los Sentimientos (3–4 años)<br>
  <strong>Tomo III</strong> — El Río de los Sueños (5–6 años)<br>
  <strong>Tomo IV</strong> — La Montaña de la Sabiduría (7–9 años)</p>
  <p><em>200 cuentos terapéuticos para niños de 0 a 9 años</em></p>
</div>
</body></html>"""

    return h


def generate(tomo_num, output_path):
    print(f"═══ La Tortuga Sabia — Tomo {tomo_num} — Editorial Engine v7 ═══")

    stories = json.load(open(f"public/stories/tomo-{tomo_num}/all-stories.json"))
    print(f"Stories: {len(stories)}")

    print("Building HTML (embedding images)...")
    html = build_book(tomo_num)

    print(f"HTML size: {len(html) // 1024}KB")
    print("Rendering PDF with WeasyPrint...")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = HTML(string=html).render(stylesheets=[CSS(string=STYLE)])
    doc.write_pdf(output_path)

    size = os.path.getsize(output_path) / 1024 / 1024
    pages = len(doc.pages)
    print(f"\n✅ {output_path}")
    print(f"   Pages: {pages}")
    print(f"   Size: {size:.1f} MB")


if __name__ == "__main__":
    t = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    generate(t, f"public/downloads/la-tortuga-sabia-tomo-{t}-v7.pdf")
