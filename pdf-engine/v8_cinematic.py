#!/usr/bin/env python3
"""
LA TORTUGA SABIA — CINEMATIC EDITORIAL ENGINE v8
Each story = 8-10 pages. 5 images per story. Cinematic pacing.
Text split across pages with breathing room. Visual transitions.
WeasyPrint CSS Paged Media.
"""
import json, os, sys, base64
from weasyprint import HTML, CSS

def b64(path):
    if not path or not os.path.exists(path): return ""
    with open(path, "rb") as f:
        return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode()}"

def img(tomo, num, kind):
    for p in [
        f"public/images/stories/tomo-{tomo}/matched/story-{num}-{kind}.jpg",
        f"public/images/stories/tomo-{tomo}/story-{num}-{kind}.jpg",
    ]:
        if os.path.exists(p): return p
    return None

TOMO = {
    1: ("El Bosque Encantado", "50 cuentos terapéuticos · 0–2 años"),
    2: ("El Bosque de los Sentimientos", "50 cuentos · 3–4 años"),
    3: ("El Río de los Sueños", "50 cuentos · 5–6 años"),
    4: ("La Montaña de la Sabiduría", "50 cuentos · 7–9 años"),
}

STYLE = """
@page { size: 8.5in 11in; margin: 0.8in 0.7in 0.6in 0.7in;
  @bottom-center { content: counter(page); font: 9pt Georgia; color: #C9882A; padding-top: 6pt; }
}
@page :blank { @bottom-center { content: none; } }
@page full { margin: 0; @bottom-center { content: none; } }
@page nonum { @bottom-center { content: none; } }

* { box-sizing: border-box; }
body { font: 14pt/1.85 Georgia, serif; color: #2E1A08; orphans: 3; widows: 3; }

/* ══ FULL-BLEED IMAGE PAGE ══ */
.full-img { page: full; page-break-after: always; width: 8.5in; height: 11in; position: relative; overflow: hidden; }
.full-img img { width: 100%; height: 100%; object-fit: cover; }
.full-img .overlay { position: absolute; inset: 0; }
.full-img .caption {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 0.6in 0.8in 0.5in; text-align: center;
}
.full-img .caption h1 { font-size: 38pt; color: #C9882A; margin: 0 0 6pt;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.6); font-weight: bold; }
.full-img .caption p { font-size: 14pt; color: #FEFAE0; margin: 0; font-style: italic; }
.full-img .caption .sm { font-size: 10pt; color: rgba(254,250,224,0.5); }

/* ══ FRONTMATTER ══ */
.fm { page: nonum; page-break-after: always; }
.credits { padding-top: 55%; text-align: center; font-size: 10pt; line-height: 2.2; color: #888; }
.dedication { padding-top: 32%; text-align: center; font: italic 20pt/2.2 Georgia; color: #C9882A; }
.dedication .sig { margin-top: 20pt; font-size: 16pt; color: #E8B84B; }

/* ══ TOC ══ */
.toc { page: nonum; page-break-after: always; }
.toc h2 { font-size: 30pt; color: #C9882A; text-align: center; margin: 0 0 16pt;
  padding-bottom: 8pt; border-bottom: 2.5pt solid #E8B84B; }
.toc-row { display: flex; align-items: baseline; padding: 2pt 0;
  border-bottom: 0.5pt dotted #ddd; font-size: 12pt; line-height: 2; }
.toc-num { color: #C9882A; font-weight: bold; min-width: 26pt; }
.toc-t { flex: 1; color: #2E1A08; }
.toc-c { color: #C9882A; font-style: italic; font-size: 10pt; text-align: right; }

/* ══ STORY OPENING — HERO FULL PAGE ══ */
.story-hero { page: full; page-break-after: always; width: 8.5in; height: 11in;
  position: relative; overflow: hidden; display: flex; align-items: flex-end; }
.story-hero img.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.story-hero .grad { position: absolute; inset: 0;
  background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%); }
.story-hero .info { position: relative; z-index: 1; padding: 0.5in 0.7in 0.6in; width: 100%; }
.story-hero .num { font-size: 60pt; font-weight: bold; color: rgba(201,136,42,0.6); margin: 0; }
.story-hero .sep { width: 3in; height: 2pt; margin: 4pt 0 8pt;
  background: linear-gradient(90deg, #C9882A, transparent); }
.story-hero h2 { font-size: 30pt; color: #FEFAE0; margin: 0 0 4pt; line-height: 1.2;
  text-shadow: 1px 2px 6px rgba(0,0,0,0.5); }
.story-hero .char { font-size: 16pt; font-style: italic; color: #C9882A; margin: 0; }
.story-hero .sit { font-size: 11pt; color: rgba(254,250,224,0.6); margin: 4pt 0 0; font-style: italic; }

/* ══ TEXT PAGES ══ */
.text-page { font-size: 14pt; line-height: 1.85; text-align: justify; hyphens: auto; }
.text-page p { margin: 0 0 12pt; text-indent: 22pt; }
.text-page p:first-of-type { text-indent: 0; }

/* ══ IMAGE BREAK — centered illustration between text ══ */
.img-break { text-align: center; margin: 16pt 0 20pt; page-break-inside: avoid; }
.img-break img { max-width: 5.5in; max-height: 4in; border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12); }

/* ══ ATMOSPHERE PAGE — full-width image with quote ══ */
.atmo { page-break-before: always; text-align: center; padding-top: 0.4in; }
.atmo img { width: 5.8in; height: 5.8in; object-fit: cover; border-radius: 50%;
  box-shadow: 0 0 40px rgba(45,106,79,0.15); margin-bottom: 20pt; }
.atmo .quote { font: italic 16pt/1.6 Georgia; color: #1B3A2D; max-width: 5in; margin: 0 auto; }

/* ══ QUELINA PAGE ══ */
.quel { page-break-before: always; }
.quel-img { text-align: center; margin-bottom: 14pt; }
.quel-img img { width: 3in; height: 3in; object-fit: cover; border-radius: 50%;
  box-shadow: 0 0 28px rgba(201,136,42,0.25); }
.quel-box {
  background: linear-gradient(135deg, #FFFCE8, #FFF7CC);
  border: 3pt solid #C9882A; border-radius: 16pt;
  padding: 24pt 28pt; position: relative;
}
.quel-box::after { content: ''; position: absolute; inset: 5pt;
  border: 1.5pt solid #E8B84B; border-radius: 12pt; pointer-events: none; }
.quel-box .qt { font: bold italic 18pt Georgia; color: #C9882A; text-align: center; margin: 0 0 10pt; }
.quel-box .qs { width: 70%; height: 1.5pt; margin: 6pt auto;
  background: linear-gradient(90deg, transparent, #E8B84B, transparent); }
.quel-box .qm { font: italic 13.5pt/1.7 Georgia; color: #3D2510; text-align: center; margin: 10pt 0; }
.quel-box .qmoral { font: bold italic 17pt/1.35 Georgia; color: #C9882A; text-align: center; margin: 12pt 0 0; }
.sp { position: absolute; color: #E8B84B; font-size: 14pt; }
.sp.tl{top:8pt;left:12pt;} .sp.tr{top:8pt;right:12pt;}
.sp.bl{bottom:8pt;left:12pt;} .sp.br{bottom:8pt;right:12pt;}

/* ══ BACK ══ */
.back { page-break-before: always; text-align: center; padding-top: 2.5in; }
.back h2 { font-size: 24pt; color: #C9882A; margin: 0 0 16pt; }
.back p { font-size: 12pt; color: #666; line-height: 1.8; max-width: 4.5in; margin: 0 auto 10pt; }
"""


def build(tomo_num):
    stories = json.load(open(f"public/stories/tomo-{tomo_num}/all-stories.json"))
    stories.sort(key=lambda s: s.get("numero", 0))
    title, subtitle = TOMO.get(tomo_num, ("", ""))
    cover = b64("public/images/portada-b.jpg")

    h = f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>La Tortuga Sabia — Tomo {tomo_num}</title></head><body>

<!-- COVER -->
<div class="full-img">
  {f'<img src="{cover}"/>' if cover else ''}
  <div class="overlay" style="background:linear-gradient(0deg,rgba(0,0,0,0.6),rgba(0,0,0,0.2));"></div>
  <div class="caption">
    <h1>La Tortuga Sabia</h1>
    <p>Tomo {tomo_num} — {title}</p>
    <p class="sm" style="margin-top:8pt;">{subtitle}</p>
    <p class="sm" style="margin-top:20pt;">Por CUBALIVE · PASSKAL LLC</p>
  </div>
</div>

<!-- CREDITS -->
<div class="fm credits">
<strong>© 2025 CUBALIVE</strong><br>
Publicado por PASSKAL LLC · Las Vegas, Nevada, USA<br><br>
latortugasabia.com<br><br>
Todos los derechos reservados.<br>
Ilustraciones: DALL-E 3 · Historias: Claude AI<br><br>
<strong>Primera edición digital — 2025</strong>
</div>

<!-- DEDICATION -->
<div class="fm dedication">
Para todos los niños que todavía<br>
creen que las tortugas pueden hablar<br>
con las estrellas...<br><br>
Y para los padres que se detienen<br>
un momento a escuchar.
<div class="sig">— Quelina</div>
</div>

<!-- TOC -->
<div class="toc"><h2>Índice</h2>
{''.join(f'<div class="toc-row"><span class="toc-num">{str(s.get("numero","")).zfill(2)}.</span><span class="toc-t">{s.get("titulo","")}</span><span class="toc-c">{s.get("personaje","")}</span></div>' for s in stories)}
</div>
"""

    for s in stories:
        n = s.get("numero", 0)

        # Get ALL 6 images
        i_hist = b64(img(tomo_num, n, "historia"))
        i_quel = b64(img(tomo_num, n, "quelina"))
        i_port = b64(img(tomo_num, n, "portada"))
        i_prob = b64(img(tomo_num, n, "problema"))
        i_reso = b64(img(tomo_num, n, "resolucion"))
        i_vine = b64(img(tomo_num, n, "vineta"))

        hero_img = i_hist or i_port
        mid_img = i_prob or i_port
        atmo_img = i_reso or i_port
        close_img = i_vine or i_port

        # Split text into paragraphs
        text = s.get("historia", "")
        paras = [p.strip() for p in text.split("\n\n") if p.strip()]
        if len(paras) < 2:
            # Split single block into sentences
            sentences = text.replace(". ", ".\n").split("\n")
            mid = len(sentences) // 3
            paras = [
                " ".join(sentences[:mid]),
                " ".join(sentences[mid:mid*2]),
                " ".join(sentences[mid*2:]),
            ]

        # Divide into 3 text sections
        third = max(1, len(paras) // 3)
        part1 = paras[:third]
        part2 = paras[third:third*2]
        part3 = paras[third*2:]

        p1html = "".join(f"<p>{p}</p>" for p in part1 if p.strip())
        p2html = "".join(f"<p>{p}</p>" for p in part2 if p.strip())
        p3html = "".join(f"<p>{p}</p>" for p in part3 if p.strip())

        quelina_text = s.get("quelina_momento", "")
        moraleja = s.get("moraleja", "")

        # ═══ PAGE 1: HERO OPENING (full-bleed image + title overlay) ═══
        h += f"""
<div class="story-hero">
  {f'<img class="bg" src="{hero_img}"/>' if hero_img else ''}
  <div class="grad"></div>
  <div class="info">
    <p class="num">{n}</p>
    <div class="sep"></div>
    <h2>{s.get("titulo","")}</h2>
    <p class="char">{s.get("personaje","")}</p>
    <p class="sit">{s.get("situacion","")}</p>
  </div>
</div>
"""

        # ═══ PAGE 2-3: TEXT PART 1 ═══
        h += f'<div class="text-page">{p1html}</div>'

        # ═══ PAGE 4: MID-STORY IMAGE BREAK ═══
        if mid_img:
            h += f'<div class="img-break"><img src="{mid_img}"/></div>'

        # ═══ PAGE 5-6: TEXT PART 2 ═══
        if p2html:
            h += f'<div class="text-page">{p2html}</div>'

        # ═══ PAGE 7: ATMOSPHERE PAGE (circular image + key quote) ═══
        if atmo_img:
            # Extract a powerful sentence from the story for the quote
            key_sentence = ""
            for p in part3[:2]:
                if len(p) > 40:
                    key_sentence = p[:120] + "..." if len(p) > 120 else p
                    break
            if not key_sentence and moraleja:
                key_sentence = moraleja

            h += f"""
<div class="atmo">
  <img src="{atmo_img}"/>
  <p class="quote">"{key_sentence}"</p>
</div>
"""

        # ═══ PAGE 8: TEXT PART 3 (resolution) ═══
        if p3html:
            h += f'<div class="text-page">{p3html}</div>'

        # ═══ PAGE 9: QUELINA MOMENT ═══
        if quelina_text or moraleja:
            h += '<div class="quel">'
            if i_quel:
                h += f'<div class="quel-img"><img src="{i_quel}"/></div>'
            h += f"""<div class="quel-box">
<span class="sp tl">✦</span><span class="sp tr">✦</span>
<span class="sp bl">✦</span><span class="sp br">✦</span>
<p class="qt">El Momento de Quelina</p>
<div class="qs"></div>
<p class="qm">{quelina_text}</p>
<div class="qs"></div>
<p class="qmoral">« {moraleja} »</p>
</div></div>"""

        # ═══ PAGE 10: CLOSING VIGNETTE ═══
        if close_img:
            h += f"""
<div class="atmo">
  <img src="{close_img}" style="width:3in;height:3in;"/>
</div>
"""

    # Back matter
    h += """
<div class="back"><h2>Sobre el Autor</h2>
<p>CUBALIVE — creador digital, padre y soñador. Desde Las Vegas, combina IA, arte y narrativa para crear experiencias que abrazan, enseñan y acompañan.</p>
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
    print(f"═══ Cinematic Engine v8 — Tomo {tomo_num} ═══")
    stories = json.load(open(f"public/stories/tomo-{tomo_num}/all-stories.json"))
    if max_stories:
        stories = stories[:max_stories]
        json.dump(stories, open(f"/tmp/t{tomo_num}_limited.json","w"), ensure_ascii=False)
    print(f"Stories: {len(stories)}")
    print("Building HTML (embedding all images)...")

    # Temporarily limit if needed
    if max_stories:
        orig = f"public/stories/tomo-{tomo_num}/all-stories.json"
        import shutil
        shutil.copy(orig, f"/tmp/backup_t{tomo_num}.json")
        json.dump(stories, open(orig,"w"), ensure_ascii=False)

    html = build(tomo_num)
    print(f"HTML: {len(html)//1024}KB")

    if max_stories:
        import shutil
        shutil.copy(f"/tmp/backup_t{tomo_num}.json", orig)

    print("Rendering PDF...")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    doc = HTML(string=html).render(stylesheets=[CSS(string=STYLE)])
    doc.write_pdf(out)
    sz = os.path.getsize(out) / 1024 / 1024
    print(f"\n✅ {out}\n   Pages: {len(doc.pages)}\n   Size: {sz:.1f} MB")


if __name__ == "__main__":
    t = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    n = int(sys.argv[2]) if len(sys.argv) > 2 else None
    generate(t, f"public/downloads/la-tortuga-sabia-tomo-{t}-v8.pdf", n)
