#!/usr/bin/env python3
"""
LA TORTUGA SABIA — FINAL EDITORIAL ENGINE v9
Blueprint v2 approved. Cinematic pacing with editorial precision.
80-120 words/page. Page-turn logic per story. Variable templates.
"""
import json, os, sys, base64, re
from weasyprint import HTML, CSS

def b64(path):
    if not path or not os.path.exists(path): return ""
    with open(path, "rb") as f:
        return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode()}"

def img(t, n, k):
    for p in [f"public/images/stories/tomo-{t}/matched/story-{n}-{k}.jpg",
              f"public/images/stories/tomo-{t}/story-{n}-{k}.jpg"]:
        if os.path.exists(p): return p
    return None

TOMO = {
    1: ("El Bosque Encantado", "50 cuentos terapéuticos · 0–2 años"),
    2: ("El Bosque de los Sentimientos", "50 cuentos · 3–4 años"),
    3: ("El Río de los Sueños", "50 cuentos · 5–6 años"),
    4: ("La Montaña de la Sabiduría", "50 cuentos · 7–9 años"),
}

# ═══════════════════════════════════════
# CSS EDITORIAL SYSTEM
# ═══════════════════════════════════════
STYLE = """
@page { size: 8.5in 11in; margin: 0.85in 0.75in 0.65in 0.75in;
  @bottom-center { content: counter(page); font: 9pt Georgia; color: #C9882A; }
}
@page :blank { @bottom-center { content: none; } }
@page full { margin: 0; @bottom-center { content: none; } }
@page nonum { @bottom-center { content: none; } }

*, *::before, *::after { box-sizing: border-box; }
body { font: 14.5pt/1.85 Georgia, serif; color: #2E1A08; orphans: 3; widows: 3; }

/* ═══ HERO OPENING — SAFE TEXT ZONE ═══ */
.hero { page: full; page-break-after: always; width: 8.5in; height: 11in;
  position: relative; overflow: hidden; }
.hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero .dim { position: absolute; inset: 0;
  background: linear-gradient(0deg,
    rgba(5,13,18,0.88) 0%,
    rgba(5,13,18,0.75) 25%,
    rgba(0,0,0,0.25) 55%,
    transparent 100%); }
.hero .info { position: absolute; bottom: 0; left: 0; right: 0;
  padding: 0.5in 0.8in 0.6in; z-index: 1; }
.hero .n { font: bold 48pt Georgia; color: #C9882A; margin: 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7); }
.hero .s { width: 2.5in; height: 2pt; margin: 4pt 0 10pt;
  background: linear-gradient(90deg, #C9882A, transparent); }
.hero h2 { font: bold 28pt/1.2 Georgia; color: #FEFAE0; margin: 0 0 5pt;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.4); }
.hero .ch { font: italic 15pt Georgia; color: #FEFAE0; margin: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5); }

/* ═══ NARRATIVE LIGHT TEXT ═══ */
.nar { font-size: 14.5pt; line-height: 1.85; text-align: justify; hyphens: none; }
.nar p { margin: 0 0 11pt; text-indent: 20pt; }
.nar p:first-of-type { text-indent: 0; }
.nar-orn { text-align: center; color: #C9882A; font-size: 9pt;
  margin: 0 0 14pt; letter-spacing: 8pt; }

/* ═══ IMAGE-LED NARRATIVE ═══ */
.img-led { page-break-inside: avoid; margin: 10pt 0; }
.img-led-top { text-align: center; margin-bottom: 14pt; }
.img-led-top img { max-width: 100%; max-height: 5in; border-radius: 12px;
  box-shadow: 0 5px 18px rgba(0,0,0,0.1); }
.img-led-side { display: flex; gap: 18pt; align-items: flex-start; }
.img-led-side img { width: 3.2in; height: 3.2in; object-fit: cover;
  border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); flex-shrink: 0; }
.img-led-side .txt { flex: 1; font-size: 14pt; line-height: 1.8; text-align: justify; }
.img-led-side .txt p { margin: 0 0 10pt; }

/* ═══ EMOTIONAL PAUSE ═══ */
.pause { page-break-before: always; text-align: center; padding-top: 1.5in; }
.pause img { max-width: 5in; max-height: 5in; border-radius: 50%;
  box-shadow: 0 0 30px rgba(45,106,79,0.12); margin-bottom: 18pt; }
.pause .line { font: italic 15pt/1.55 Georgia; color: #1B3A2D;
  max-width: 4.8in; margin: 0 auto; }
.pause-quiet { page-break-before: always; padding-top: 3in; text-align: center; }
.pause-quiet .line { font: italic 17pt/1.5 Georgia; color: #C9882A;
  max-width: 4.5in; margin: 0 auto; }

/* ═══ QUELINA SIGNATURE ═══ */
.quel { page-break-before: always; padding-top: 0.3in; }
.quel-portrait { text-align: center; margin-bottom: 16pt; }
.quel-portrait img { width: 2.8in; height: 2.8in; object-fit: cover;
  border-radius: 50%; box-shadow: 0 0 22px rgba(201,136,42,0.2); }
.quel-panel {
  background: #FFFCE8; border: 2.5pt solid #C9882A; border-radius: 14pt;
  padding: 20pt 24pt; margin-top: 8pt;
}
.quel-panel .qt { font: bold italic 17pt Georgia; color: #C9882A;
  text-align: center; margin: 0 0 8pt; }
.quel-panel .qs { width: 60%; height: 1pt; margin: 6pt auto;
  background: linear-gradient(90deg, transparent, #E8B84B, transparent); }
.quel-panel .qm { font: italic 13pt/1.7 Georgia; color: #3D2510;
  text-align: center; margin: 8pt 0; }
.quel-panel .qmor { font: bold italic 16pt/1.3 Georgia; color: #C9882A;
  text-align: center; margin: 8pt 0 0; }

/* ═══ FRONTMATTER ═══ */
.fm { page: nonum; page-break-after: always; }
.cred { padding-top: 55%; text-align: center; font-size: 10pt; line-height: 2.2; color: #888; }
.ded { padding-top: 30%; text-align: center; font: italic 20pt/2.2 Georgia; color: #C9882A; }
.ded .sig { margin-top: 18pt; font-size: 15pt; color: #E8B84B; }
.toc { page: nonum; page-break-after: always; }
.toc h2 { font: bold 28pt Georgia; color: #C9882A; text-align: center;
  margin: 0 0 14pt; padding-bottom: 8pt; border-bottom: 2pt solid #E8B84B; }
.toc-r { display: flex; align-items: baseline; padding: 2pt 0;
  border-bottom: 0.5pt dotted #ddd; font-size: 12pt; line-height: 2; }
.toc-n { color: #C9882A; font-weight: bold; min-width: 24pt; }
.toc-t { flex: 1; }
.toc-c { color: #C9882A; font-style: italic; font-size: 10pt; text-align: right; }
.trans { page: nonum; page-break-after: always; text-align: center; padding-top: 40%; }
.trans p { font: italic 22pt Georgia; color: #C9882A; }
.trans .orn { font-size: 12pt; color: #E8B84B; margin-top: 12pt; letter-spacing: 6pt; }

/* ═══ BACK ═══ */
.back { page-break-before: always; text-align: center; padding-top: 2.2in; }
.back h2 { font: bold 22pt Georgia; color: #C9882A; margin: 0 0 14pt; }
.back p { font-size: 12pt; color: #666; line-height: 1.8; max-width: 4.2in; margin: 0 auto 8pt; }
"""


def split_paragraphs(text):
    """Split story text into clean paragraphs."""
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(paras) < 3:
        # Split by sentences if too few paragraphs
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        if len(sentences) >= 6:
            third = len(sentences) // 3
            paras = [
                " ".join(sentences[:third]),
                " ".join(sentences[third:third*2]),
                " ".join(sentences[third*2:]),
            ]
    return [p for p in paras if p.strip()]


def chunk_text(paras, max_words=110):
    """Split paragraphs into page-sized chunks (80-120 words ideal)."""
    chunks = []
    current = []
    current_words = 0
    for p in paras:
        pw = len(p.split())
        if current_words + pw > max_words and current:
            chunks.append(current)
            current = [p]
            current_words = pw
        else:
            current.append(p)
            current_words += pw
    if current:
        chunks.append(current)
    return chunks


def assess_story(story):
    """Determine story structure based on content and emotion."""
    text = story.get("historia", "")
    words = len(text.split())
    has_quelina = bool(story.get("quelina_momento", "").strip())
    has_moraleja = bool(story.get("moraleja", "").strip())

    # Detect emotional intensity
    intense_words = ["miedo", "llorar", "solo", "triste", "oscur", "perdió", "asust"]
    intensity = sum(1 for w in intense_words if w in text.lower())
    needs_pause = intensity >= 2 or words > 400

    return {
        "words": words,
        "needs_pause": needs_pause,
        "has_quelina": has_quelina or has_moraleja,
        "structure": "long" if words > 420 else "medium" if words > 300 else "short",
    }


def build(tomo_num):
    stories = json.load(open(f"public/stories/tomo-{tomo_num}/all-stories.json"))
    stories.sort(key=lambda s: s.get("numero", 0))
    title, subtitle = TOMO.get(tomo_num, ("", ""))
    cover = b64("public/images/portada-b.jpg")

    h = f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body>

<div class="hero">
  {f'<img src="{cover}"/>' if cover else ''}
  <div class="dim"></div>
  <div class="info">
    <p class="n" style="font-size:42pt;">La Tortuga Sabia</p>
    <div class="s" style="width:3in;"></div>
    <h2 style="font-size:22pt;">Tomo {tomo_num} — {title}</h2>
    <p class="ch" style="font-size:11pt;">{subtitle}</p>
  </div>
</div>

<div class="fm cred">
<strong>© 2025 CUBALIVE</strong><br>PASSKAL LLC · Las Vegas, Nevada<br><br>
latortugasabia.com<br><br>Todos los derechos reservados.<br>
Ilustraciones: DALL-E 3 · Historias: Claude AI<br><br>
<strong>Primera edición digital — 2025</strong></div>

<div class="fm ded">
Para todos los niños que todavía<br>creen que las tortugas pueden hablar<br>
con las estrellas...<br><br>Y para los padres que se detienen<br>
un momento a escuchar.<div class="sig">— Quelina</div></div>

<div class="toc"><h2>Índice</h2>
""" + "".join(f'<div class="toc-r"><span class="toc-n">{str(s.get("numero","")).zfill(2)}.</span><span class="toc-t">{s.get("titulo","")}</span><span class="toc-c">{s.get("personaje","")}</span></div>' for s in stories) + """
</div>

<div class="trans"><p>Que comience la magia...</p><p class="orn">◆ ◆ ◆</p></div>
"""

    prev_img_layout = ""

    for idx, s in enumerate(stories):
        n = s.get("numero", 0)
        assess = assess_story(s)

        # Get images
        i_hero = b64(img(tomo_num, n, "historia") or img(tomo_num, n, "portada"))
        i_prob = b64(img(tomo_num, n, "problema"))
        i_reso = b64(img(tomo_num, n, "resolucion"))
        i_quel = b64(img(tomo_num, n, "quelina"))

        # Split text
        paras = split_paragraphs(s.get("historia", ""))
        chunks = chunk_text(paras, max_words=110)

        # ═══ PAGE 1: HERO OPENING (minimal overlay) ═══
        h += f"""
<div class="hero">
  {f'<img src="{i_hero}"/>' if i_hero else ''}
  <div class="dim"></div>
  <div class="info">
    <p class="n">{n}</p><div class="s"></div>
    <h2>{s.get("titulo","")}</h2>
    <p class="ch">{s.get("personaje","")}</p>
  </div>
</div>
"""

        # ═══ TEXT PAGES with IMAGE-LED at key moment ═══
        image_placed = False
        for ci, chunk in enumerate(chunks):
            chunk_html = "".join(f"<p>{p}</p>" for p in chunk)

            # Decide: place image-led narrative at the conflict point
            if ci == 1 and i_prob and not image_placed:
                # IMAGE-LED: alternate layout to avoid monotony
                if prev_img_layout != "top":
                    h += f"""<div class="img-led">
<div class="img-led-top"><img src="{i_prob}"/></div>
<div class="nar">{chunk_html}</div></div>"""
                    prev_img_layout = "top"
                else:
                    h += f"""<div class="img-led img-led-side">
<img src="{i_prob}"/>
<div class="txt">{chunk_html}</div></div>"""
                    prev_img_layout = "side"
                image_placed = True
            else:
                # NARRATIVE LIGHT
                orn = '<p class="nar-orn">· · ·</p>' if ci == 0 else ''
                h += f'{orn}<div class="nar">{chunk_html}</div>'

        # ═══ EMOTIONAL PAUSE (only for intense stories) ═══
        if assess["needs_pause"] and i_reso:
            # Extract a powerful line for the pause
            key_line = s.get("moraleja", "")
            if not key_line and paras:
                for p in reversed(paras):
                    if 30 < len(p) < 150:
                        key_line = p
                        break
            h += f"""
<div class="pause">
  <img src="{i_reso}"/>
  <p class="line">{key_line}</p>
</div>"""
        elif assess["needs_pause"]:
            key_line = s.get("moraleja", "")
            if key_line:
                h += f'<div class="pause-quiet"><p class="line">"{key_line}"</p></div>'

        # ═══ QUELINA SIGNATURE ═══
        qt = s.get("quelina_momento", "").strip()
        qm = s.get("moraleja", "").strip()
        if qt or qm:
            h += '<div class="quel">'
            if i_quel:
                h += f'<div class="quel-portrait"><img src="{i_quel}"/></div>'
            h += f"""<div class="quel-panel">
<p class="qt">El Momento de Quelina</p><div class="qs"></div>
<p class="qm">{qt}</p><div class="qs"></div>
<p class="qmor">« {qm} »</p></div></div>"""

    # Back matter
    h += """
<div class="back"><h2>Sobre el Autor</h2>
<p>CUBALIVE — creador digital, padre y soñador. Desde Las Vegas, combina IA, arte y narrativa
para crear experiencias que abrazan, enseñan y acompañan.</p>
<p><strong>latortugasabia.com</strong></p></div>
<div class="back"><h2>La Colección</h2>
<p><strong>Tomo I</strong> — El Bosque Encantado (0–2)<br>
<strong>Tomo II</strong> — El Bosque de los Sentimientos (3–4)<br>
<strong>Tomo III</strong> — El Río de los Sueños (5–6)<br>
<strong>Tomo IV</strong> — La Montaña de la Sabiduría (7–9)</p>
<p><em>200 cuentos terapéuticos · 0 a 9 años</em></p></div>
</body></html>"""
    return h


def generate(tomo_num, out, max_stories=None):
    print(f"═══ Editorial Engine v9 — Tomo {tomo_num} ═══")

    if max_stories:
        stories = json.load(open(f"public/stories/tomo-{tomo_num}/all-stories.json"))[:max_stories]
        json.dump(stories, open(f"/tmp/v9_t{tomo_num}.json","w"), ensure_ascii=False)
        orig = f"public/stories/tomo-{tomo_num}/all-stories.json"
        import shutil; shutil.copy(orig, f"/tmp/v9_backup_{tomo_num}.json")
        json.dump(stories, open(orig,"w"), ensure_ascii=False)

    html = build(tomo_num)

    if max_stories:
        import shutil; shutil.copy(f"/tmp/v9_backup_{tomo_num}.json", orig)

    print(f"HTML: {len(html)//1024}KB")
    print("Rendering...")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    doc = HTML(string=html).render(stylesheets=[CSS(string=STYLE)])
    doc.write_pdf(out)
    print(f"✅ {out}\n   Pages: {len(doc.pages)}\n   Size: {os.path.getsize(out)/1024/1024:.1f} MB")


if __name__ == "__main__":
    t = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    n = int(sys.argv[2]) if len(sys.argv) > 2 else None
    generate(t, f"public/downloads/la-tortuga-sabia-tomo-{t}-v9.pdf", n)
