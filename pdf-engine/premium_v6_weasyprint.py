#!/usr/bin/env python3
"""
LA TORTUGA SABIA — PREMIUM PDF ENGINE v6
WeasyPrint: CSS Paged Media → Print-quality PDF
Real text flow, automatic pagination, editorial typography
"""
import json, os, sys, base64
from pathlib import Path
from weasyprint import HTML, CSS

def load_stories(tomo_num):
    f = f"public/stories/tomo-{tomo_num}/all-stories.json"
    stories = json.load(open(f))
    stories.sort(key=lambda s: s.get("numero", 0))
    return stories

def img_to_data_uri(path):
    """Convert local image to data URI for embedding in HTML."""
    if not os.path.exists(path):
        return ""
    ext = path.split(".")[-1].lower()
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}.get(ext, "image/jpeg")
    with open(path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode()
    return f"data:{mime};base64,{encoded}"

def find_image(tomo_num, story_num, img_type):
    """Find best available image for a story."""
    paths = [
        f"public/images/stories/tomo-{tomo_num}/matched/story-{story_num}-{img_type}.jpg",
        f"public/images/stories/tomo-{tomo_num}/story-{story_num}-{img_type}.jpg",
        f"public/images/stories/tomo-{tomo_num}/story-{story_num}-portada.jpg",
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    return None

def detect_scene(story):
    text = (story.get("titulo", "") + " " + story.get("historia", "")).lower()
    if any(w in text for w in ["noche", "luna", "estrella", "dormir"]): return "night"
    if any(w in text for w in ["agua", "río", "mar", "nadar"]): return "water"
    if any(w in text for w in ["flor", "jardín", "mariposa"]): return "garden"
    if any(w in text for w in ["cielo", "volar", "pájaro"]): return "sky"
    return "forest"

SCENE_COLORS = {
    "night":  ("#f0f2fc", "#1a2040"),
    "forest": ("#f0f8f2", "#1a3a2a"),
    "water":  ("#eaf4fc", "#1a2a40"),
    "garden": ("#fcf0f0", "#3a1a2a"),
    "sky":    ("#f0f6ff", "#1a2a3a"),
}

TOMO_INFO = {
    1: ("El Bosque Encantado", "50 cuentos terapéuticos para niños de 0-2 años", "#2D6A4F"),
    2: ("El Bosque de los Sentimientos", "50 cuentos sobre emociones para niños de 3-4 años", "#C9882A"),
    3: ("El Río de los Sueños", "50 cuentos de aventura para niños de 5-6 años", "#4682B4"),
    4: ("La Montaña de la Sabiduría", "50 cuentos de valores para niños de 7-9 años", "#7B5EA7"),
}

CSS_STYLES = """
@page {
    size: 8.5in 11in;
    margin: 1in 0.9in 0.8in 0.9in;
    @bottom-center {
        content: counter(page);
        font-family: 'Liberation Serif', Georgia, serif;
        font-size: 10pt;
        color: #C9882A;
    }
}
@page :first { margin: 0; @bottom-center { content: none; } }
@page cover { margin: 0; @bottom-center { content: none; } }
@page frontmatter { @bottom-center { content: none; } }

* { box-sizing: border-box; }

body {
    font-family: 'Liberation Serif', Georgia, 'Times New Roman', serif;
    color: #3D2510;
    line-height: 1.75;
    font-size: 13pt;
}

/* ═══ COVER ═══ */
.cover-page {
    page: cover;
    page-break-after: always;
    width: 8.5in;
    height: 11in;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    overflow: hidden;
}
.cover-bg {
    position: absolute;
    inset: 0;
    object-fit: cover;
    width: 100%;
    height: 100%;
    opacity: 0.85;
}
.cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
}
.cover-content {
    position: relative;
    z-index: 1;
    padding: 2in 1in;
}
.cover-title {
    font-size: 42pt;
    font-weight: bold;
    color: #C9882A;
    letter-spacing: 0.05em;
    margin-bottom: 0.3in;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
}
.cover-tomo {
    font-size: 20pt;
    color: #FEFAE0;
    font-style: italic;
    margin-bottom: 0.15in;
}
.cover-subtitle {
    font-size: 12pt;
    color: rgba(254,250,224,0.7);
    margin-bottom: 0.5in;
}
.cover-author {
    font-size: 11pt;
    color: rgba(254,250,224,0.5);
    position: absolute;
    bottom: 0.4in;
    left: 0;
    right: 0;
    text-align: center;
}

/* ═══ FRONTMATTER ═══ */
.frontmatter {
    page: frontmatter;
    page-break-after: always;
    text-align: center;
}
.credits-page {
    padding-top: 5in;
    font-size: 10pt;
    color: #666;
    line-height: 2;
}
.dedication-page {
    padding-top: 3.5in;
    font-size: 16pt;
    font-style: italic;
    color: #C9882A;
    line-height: 2;
}
.dedication-sig {
    margin-top: 0.5in;
    font-size: 14pt;
    color: #E8B84B;
}

/* ═══ INDEX ═══ */
.toc {
    page: frontmatter;
    page-break-after: always;
}
.toc h2 {
    font-size: 28pt;
    color: #C9882A;
    text-align: center;
    margin-bottom: 0.4in;
    border-bottom: 2px solid #E8B84B;
    padding-bottom: 0.15in;
}
.toc-entry {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 4pt 0;
    border-bottom: 1px dotted #e0d8c8;
    font-size: 11.5pt;
    line-height: 1.8;
}
.toc-num {
    color: #C9882A;
    font-weight: bold;
    min-width: 30pt;
}
.toc-title {
    flex: 1;
    color: #3D2510;
}
.toc-char {
    color: #C9882A;
    font-style: italic;
    font-size: 10pt;
    text-align: right;
    min-width: 120pt;
}

/* ═══ STORY OPENING ═══ */
.story-opening {
    page-break-before: always;
    text-align: center;
    padding-top: 0.3in;
}
.story-hero-img {
    width: 5in;
    height: 5in;
    object-fit: cover;
    border-radius: 50%;
    margin: 0 auto 0.3in;
    display: block;
    box-shadow: 0 8px 32px rgba(45,106,79,0.2);
}
.story-number {
    font-size: 36pt;
    font-weight: bold;
    color: #1B3A2D;
    margin-bottom: 0.1in;
}
.story-separator {
    width: 3in;
    height: 2px;
    background: linear-gradient(90deg, transparent, #C9882A, transparent);
    margin: 0.1in auto;
}
.story-diamond {
    color: #C9882A;
    font-size: 10pt;
    margin: 0.05in 0;
}
.story-title {
    font-size: 24pt;
    font-weight: bold;
    color: #1B3A2D;
    margin: 0.15in 0 0.1in;
    line-height: 1.3;
}
.story-character {
    font-size: 15pt;
    font-style: italic;
    color: #C9882A;
    margin-bottom: 0.05in;
}
.story-situation {
    font-size: 11pt;
    font-style: italic;
    color: #888;
}

/* ═══ STORY TEXT ═══ */
.story-text {
    font-size: 13pt;
    line-height: 1.85;
    color: #3D2510;
    text-align: justify;
    hyphens: auto;
    -webkit-hyphens: auto;
    orphans: 3;
    widows: 3;
}
.story-text p {
    margin-bottom: 0.15in;
    text-indent: 0.3in;
}
.story-text p:first-of-type {
    text-indent: 0;
}

/* ═══ QUELINA PANEL ═══ */
.quelina-section {
    page-break-before: auto;
    margin-top: 0.3in;
}
.quelina-panel {
    background: linear-gradient(135deg, #FFFCE8, #FFF8D0);
    border: 3px solid #C9882A;
    border-radius: 16px;
    padding: 0.35in 0.4in;
    position: relative;
    page-break-inside: avoid;
}
.quelina-panel::before {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1.5px solid #E8B84B;
    border-radius: 12px;
    pointer-events: none;
}
.quelina-panel-title {
    font-size: 16pt;
    font-weight: bold;
    font-style: italic;
    color: #C9882A;
    text-align: center;
    margin-bottom: 0.15in;
}
.quelina-panel-sep {
    width: 80%;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, #E8B84B, transparent);
    margin: 0.1in auto;
}
.quelina-panel-message {
    font-size: 12.5pt;
    font-style: italic;
    color: #3D2510;
    line-height: 1.7;
    text-align: center;
    margin: 0.15in 0;
}
.quelina-panel-moraleja {
    font-size: 15pt;
    font-weight: bold;
    font-style: italic;
    color: #C9882A;
    text-align: center;
    margin-top: 0.15in;
    line-height: 1.4;
}
.quelina-sparkle {
    position: absolute;
    color: #E8B84B;
    font-size: 14pt;
}
.quelina-sparkle.tl { top: 10px; left: 14px; }
.quelina-sparkle.tr { top: 10px; right: 14px; }
.quelina-sparkle.bl { bottom: 10px; left: 14px; }
.quelina-sparkle.br { bottom: 10px; right: 14px; }

/* ═══ QUELINA IMAGE ═══ */
.quelina-img-wrap {
    text-align: center;
    margin-bottom: 0.2in;
}
.quelina-img {
    width: 3in;
    height: 3in;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: 0 0 30px rgba(201,136,42,0.3);
}

/* ═══ BACK MATTER ═══ */
.back-page {
    page-break-before: always;
    text-align: center;
    padding-top: 3in;
}
.back-title {
    font-size: 22pt;
    color: #C9882A;
    margin-bottom: 0.3in;
}
.back-text {
    font-size: 12pt;
    color: #666;
    line-height: 1.8;
    max-width: 5in;
    margin: 0 auto;
}
"""

def build_html(tomo_num, stories):
    title, subtitle, color = TOMO_INFO.get(tomo_num, ("", "", "#2D6A4F"))

    # Cover image
    cover_img = img_to_data_uri("public/images/portada-b.jpg")

    html = f"""<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>La Tortuga Sabia — Tomo {tomo_num}</title></head>
<body>

<!-- COVER -->
<div class="cover-page">
    {"<img class='cover-bg' src='" + cover_img + "'/>" if cover_img else ""}
    <div class="cover-overlay"></div>
    <div class="cover-content">
        <div class="cover-title">La Tortuga Sabia</div>
        <div class="cover-tomo">Tomo {tomo_num} — {title}</div>
        <div class="cover-subtitle">{subtitle}</div>
    </div>
    <div class="cover-author">Por CUBALIVE · PASSKAL LLC · Las Vegas, NV</div>
</div>

<!-- CREDITS -->
<div class="frontmatter credits-page">
    <strong>© 2025 CUBALIVE</strong><br>
    Publicado por PASSKAL LLC<br>
    Las Vegas, Nevada, USA<br><br>
    latortugasabia.com<br><br>
    Todos los derechos reservados.<br>
    Ilustraciones generadas con DALL-E 3<br>
    Historias creadas con asistencia de Claude AI<br><br>
    Primera edición digital — 2025
</div>

<!-- DEDICATION -->
<div class="frontmatter dedication-page">
    Para todos los niños que todavía<br>
    creen que las tortugas pueden hablar<br>
    con las estrellas...<br><br>
    Y para los padres que se detienen<br>
    un momento a escuchar.<br>
    <div class="dedication-sig">— Quelina</div>
</div>

<!-- INDEX -->
<div class="toc">
    <h2>Índice</h2>
    {"".join(f'''
    <div class="toc-entry">
        <span class="toc-num">{str(s.get("numero","")).zfill(2)}.</span>
        <span class="toc-title">{s.get("titulo","")}</span>
        <span class="toc-char">{s.get("personaje","")}</span>
    </div>''' for s in stories)}
</div>
"""

    # Stories
    for s in stories:
        n = s.get("numero", 0)
        scene = detect_scene(s)
        bg_color, _ = SCENE_COLORS.get(scene, ("#f0f8f2", "#1a3a2a"))

        # Find images
        hist_img = find_image(tomo_num, n, "historia")
        quel_img = find_image(tomo_num, n, "quelina")

        hist_uri = img_to_data_uri(hist_img) if hist_img else ""
        quel_uri = img_to_data_uri(quel_img) if quel_img else ""

        # Story text as paragraphs
        text = s.get("historia", "")
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [text]

        # Build paragraphs HTML
        paras_html = ""
        for i, p in enumerate(paragraphs):
            paras_html += f"<p>{p}</p>\n"

        # Inline image for text flow (use portada as secondary)
        portada_img = find_image(tomo_num, n, "portada")
        portada_uri = img_to_data_uri(portada_img) if portada_img else ""

        html += f"""
<!-- STORY {n} -->
<div class="story-opening" style="background-color: {bg_color};">
    {"<img class='story-hero-img' src='" + hist_uri + "'/>" if hist_uri else ""}
    <div class="story-number">{n}</div>
    <div class="story-separator"></div>
    <div class="story-diamond">◆</div>
    <h2 class="story-title">{s.get("titulo", "")}</h2>
    <div class="story-character">{s.get("personaje", "")}</div>
    <div class="story-situation">{s.get("situacion", "")}</div>
</div>

{"<div style='text-align:center;margin:0.15in 0 0.2in;'><img style='width:3.2in;height:3.2in;object-fit:cover;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.1);' src='" + portada_uri + "'/></div>" if portada_uri and portada_uri != hist_uri else ""}
<div class="story-text">
    {paras_html}
</div>

<div class="quelina-section">
    {"<div class='quelina-img-wrap'><img class='quelina-img' src='" + quel_uri + "'/></div>" if quel_uri else ""}
    <div class="quelina-panel">
        <span class="quelina-sparkle tl">✦</span>
        <span class="quelina-sparkle tr">✦</span>
        <span class="quelina-sparkle bl">✦</span>
        <span class="quelina-sparkle br">✦</span>
        <div class="quelina-panel-title">El Momento de Quelina</div>
        <div class="quelina-panel-sep"></div>
        <div class="quelina-panel-message">{s.get("quelina_momento", "")}</div>
        <div class="quelina-panel-sep"></div>
        <div class="quelina-panel-moraleja">« {s.get("moraleja", "")} »</div>
    </div>
</div>
"""

    # Back matter
    html += """
<div class="back-page">
    <div class="back-title">Sobre el Autor</div>
    <div class="back-text">
        CUBALIVE es un creador digital, padre y soñador que cree que la tecnología
        puede hacer del mundo un lugar más mágico para los niños. Desde Las Vegas, Nevada,
        combina inteligencia artificial, arte y narrativa para crear experiencias
        que abrazan, enseñan y acompañan.
        <br><br><strong>latortugasabia.com</strong>
    </div>
</div>

<div class="back-page">
    <div class="back-title">La Colección Completa</div>
    <div class="back-text">
        <strong>Tomo I</strong> — El Bosque Encantado (0-2 años)<br>
        <strong>Tomo II</strong> — El Bosque de los Sentimientos (3-4 años)<br>
        <strong>Tomo III</strong> — El Río de los Sueños (5-6 años)<br>
        <strong>Tomo IV</strong> — La Montaña de la Sabiduría (7-9 años)<br>
        <br><em>200 cuentos terapéuticos para niños de 0 a 9 años</em>
    </div>
</div>

</body></html>"""

    return html


def generate_book(tomo_num, output_path):
    """Generate premium PDF using WeasyPrint with CSS Paged Media."""
    print(f"═══ Generating Premium PDF v6: Tomo {tomo_num} ═══")

    stories = load_stories(tomo_num)
    print(f"Stories: {len(stories)}")

    print("Building HTML...")
    html_content = build_html(tomo_num, stories)

    print("Rendering PDF with WeasyPrint (this takes a few minutes)...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    doc = HTML(string=html_content).render(stylesheets=[CSS(string=CSS_STYLES)])
    doc.write_pdf(output_path)

    size_mb = os.path.getsize(output_path) / 1024 / 1024
    pages = len(doc.pages)
    print(f"\n✅ PDF generated: {output_path}")
    print(f"   Pages: {pages}")
    print(f"   Size: {size_mb:.1f} MB")
    return output_path


if __name__ == "__main__":
    tomo = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    out = f"public/downloads/la-tortuga-sabia-tomo-{tomo}-v6.pdf"
    generate_book(tomo, out)
