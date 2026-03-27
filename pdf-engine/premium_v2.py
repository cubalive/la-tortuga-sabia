#!/usr/bin/env python3
"""
LA TORTUGA SABIA — PREMIUM PDF ENGINE v2
Composición pixel-perfect con PIL + reportlab
Director de arte: bordes orgánicos, texturas de papel, tipografía premium
"""

import json, os, math, random, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.pagesizes import inch
from io import BytesIO
import numpy as np

# ═══════════════════════════════════════
# CONSTANTS — EDITORIAL PREMIUM SCALES
# ═══════════════════════════════════════
DPI = 150
PAGE_W_IN = 8.5
PAGE_H_IN = 11.0
PAGE_W = int(PAGE_W_IN * DPI)  # 1275
PAGE_H = int(PAGE_H_IN * DPI)  # 1650
MARGIN = int(1.0 * DPI)  # 150px — generous editorial margins

# ═══ TYPOGRAPHIC SCALE (PIL pts at 150 DPI) ═══
# At 150 DPI: PIL 30pt ≈ 20pt printed. PIL 24pt ≈ 16pt printed.
T_COVER_TITLE = 60      # Book title on cover
T_COVER_SUB = 32        # Cover subtitle
T_CHAPTER_NUM = 72      # Story number (decorative)
T_CHAPTER_TITLE = 40    # Story title
T_CHAPTER_CHAR = 28     # Character name
T_CHAPTER_SIT = 22      # Situation line
T_BODY = 28             # Main body text — LARGE and readable
T_BODY_LINE_H = 46      # Line height — generous breathing
T_INDEX_ENTRY = 22      # Index entries
T_INDEX_TITLE = 36      # Index page title
T_DEDIC = 30            # Dedication text
T_CREDITS = 16          # Credits/legal
T_PANEL_TITLE = 30      # Quelina panel title
T_PANEL_MSG = 24        # Quelina panel message
T_PANEL_MORAL = 28      # Moraleja — prominent
T_PAGE_NUM = 16         # Page number
WORDS_PER_PAGE = 150    # Fills ~75% of text area at 28pt body

# Fonts
FONT_TITLE = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
FONT_TITLE_IT = "/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf"
FONT_BODY = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
FONT_BODY_IT = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"
FONT_BODY_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"

# Colors
C_DARK = (5, 13, 18)
C_CREAM = (254, 250, 224)
C_GOLD = (201, 136, 42)
C_GOLD_LIGHT = (232, 184, 75)
C_JADE = (45, 106, 79)
C_JADE_DARK = (27, 67, 50)
C_BROWN = (61, 37, 16)
C_GREEN_DEEP = (27, 58, 45)

SCENE_BG = {
    "noche": (235, 238, 248),
    "bosque": (235, 245, 238),
    "agua": (230, 242, 250),
    "jardin": (248, 238, 238),
    "cielo": (238, 244, 252),
    "cueva": (242, 234, 248),
    "prado": (248, 244, 230),
}


def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()


# ═══════════════════════════════════════
# PAPER TEXTURE
# ═══════════════════════════════════════
def create_paper_bg(w, h, scene="bosque", seed=42):
    """Premium paper texture with grain + vignette."""
    rng = np.random.RandomState(seed)
    base = SCENE_BG.get(scene, (242, 240, 235))
    img = np.full((h, w, 3), base, dtype=np.float32)

    # Subtle grain
    noise = rng.normal(0, 2.5, (h, w, 3))
    img += noise

    # Warm vignette
    y, x = np.ogrid[:h, :w]
    cx, cy = w / 2, h / 2
    dist = np.sqrt((x - cx)**2 * 1.2 + (y - cy)**2) / np.sqrt(cx**2 + cy**2)
    vignette = 1 - np.clip(dist * 0.08, 0, 0.08)
    for c in range(3):
        img[:, :, c] *= vignette

    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


# ═══════════════════════════════════════
# ORGANIC BORDERS
# ═══════════════════════════════════════
def apply_torn_border(img, style="rasgado", seed=42):
    """Apply organic irregular border to image. Interior always 100% sharp."""
    rng = random.Random(seed)
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)

    margin = int(min(w, h) * 0.04)

    if style == "acuarela":
        # Watercolor: ellipse with undulations
        cx, cy = w // 2, h // 2
        points = []
        for i in range(200):
            angle = (i / 200) * 2 * math.pi
            rx = (w // 2 - margin) * (1 + 0.03 * math.sin(angle * 7) + 0.02 * math.sin(angle * 13))
            ry = (h // 2 - margin) * (1 + 0.03 * math.cos(angle * 5) + 0.02 * math.cos(angle * 11))
            x = cx + rx * math.cos(angle) + rng.gauss(0, margin * 0.3)
            y = cy + ry * math.sin(angle) + rng.gauss(0, margin * 0.3)
            points.append((int(x), int(y)))
        draw.polygon(points, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(5))

    elif style == "fundido":
        # Fade: soft alpha gradient from center
        arr = np.zeros((h, w), dtype=np.float32)
        yy, xx = np.ogrid[:h, :w]
        cx, cy = w / 2, h / 2
        dist = np.sqrt(((xx - cx) / (w * 0.45))**2 + ((yy - cy) / (h * 0.45))**2)
        arr = np.clip(1.0 - dist, 0, 1) ** 0.8
        mask = Image.fromarray((arr * 255).astype(np.uint8))
        mask = mask.filter(ImageFilter.GaussianBlur(12))

    else:  # rasgado (torn paper)
        num_pts = 150
        points = []
        for i in range(num_pts):
            t = i / num_pts
            if t < 0.25:
                x = margin + (w - 2 * margin) * (t / 0.25)
                y = margin + rng.gauss(0, margin * 0.6)
            elif t < 0.5:
                x = w - margin + rng.gauss(0, margin * 0.6)
                y = margin + (h - 2 * margin) * ((t - 0.25) / 0.25)
            elif t < 0.75:
                x = w - margin - (w - 2 * margin) * ((t - 0.5) / 0.25)
                y = h - margin + rng.gauss(0, margin * 0.6)
            else:
                x = margin + rng.gauss(0, margin * 0.6)
                y = h - margin - (h - 2 * margin) * ((t - 0.75) / 0.25)
            # Random tears
            if rng.random() < 0.07:
                x += rng.gauss(0, margin * 1.5)
                y += rng.gauss(0, margin * 1.5)
            points.append((max(0, min(w-1, int(x))), max(0, min(h-1, int(y)))))
        draw.polygon(points, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(1.5))

    result = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    img_rgba = img.convert("RGBA")
    result.paste(img_rgba, mask=mask)
    return result


# ═══════════════════════════════════════
# IMAGE VARIANTS (editorial reuse)
# ═══════════════════════════════════════
def make_soft_background(img, page_w, page_h, opacity=0.08):
    """Create a full-page softened background from an illustration."""
    bg = img.copy().resize((page_w, page_h), Image.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(25))
    # Reduce to near-invisible tint
    arr = np.array(bg, dtype=np.float32)
    arr = arr * opacity + np.array(SCENE_BG.get("bosque", (240, 240, 235)), dtype=np.float32) * (1 - opacity)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def make_banner_crop(img, target_w, target_h):
    """Crop image to a wide banner shape for top-of-page use."""
    w, h = img.size
    # Take middle horizontal strip
    strip_h = int(h * 0.4)
    top = (h - strip_h) // 2
    cropped = img.crop((0, top, w, top + strip_h))
    return cropped.resize((target_w, target_h), Image.LANCZOS)


def make_detail_crop(img, target_size):
    """Crop a detail from the center of the image."""
    w, h = img.size
    crop_size = min(w, h) // 2
    cx, cy = w // 2, h // 2
    cropped = img.crop((cx - crop_size // 2, cy - crop_size // 2,
                        cx + crop_size // 2, cy + crop_size // 2))
    return cropped.resize((target_size, target_size), Image.LANCZOS)


# ═══════════════════════════════════════
# TEXT RENDERING
# ═══════════════════════════════════════
def draw_text_wrapped(draw, text, x, y, max_w, font, color, line_h=None):
    """Draw wrapped text, return final y position."""
    if line_h is None:
        line_h = int(font.size * 1.6)

    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] > max_w:
            if current:
                lines.append(current)
            current = word
        else:
            current = test
    if current:
        lines.append(current)

    for line in lines:
        draw.text((x, y), line, fill=color, font=font)
        y += line_h

    return y


def draw_centered_text(draw, text, y, page_w, font, color):
    """Draw centered text."""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (page_w - tw) // 2
    draw.text((x, y), text, fill=color, font=font)
    return y + int(font.size * 1.8)


# ═══════════════════════════════════════
# GOLDEN QUELINA PANEL
# ═══════════════════════════════════════
def create_quelina_panel(quelina_text, moraleja, w, scene="bosque"):
    """Create the golden Quelina moment panel — EDITORIAL PREMIUM."""
    h = 580  # Tall panel for generous text
    panel = Image.new("RGB", (w, h), (255, 253, 238))
    draw = ImageDraw.Draw(panel)

    # Outer border — thick gold
    draw.rounded_rectangle([(0, 0), (w-1, h-1)], radius=20, outline=C_GOLD, width=5)
    # Inner border — fine gold
    draw.rounded_rectangle([(10, 10), (w-11, h-11)], radius=16, outline=C_GOLD_LIGHT, width=2)

    # Corner sparkles — bigger
    sparkle_font = get_font(FONT_BODY, 28)
    draw.text((20, 14), "✦", fill=C_GOLD_LIGHT, font=sparkle_font)
    draw.text((w - 44, 14), "✦", fill=C_GOLD_LIGHT, font=sparkle_font)
    draw.text((20, h - 40), "✦", fill=C_GOLD_LIGHT, font=sparkle_font)
    draw.text((w - 44, h - 40), "✦", fill=C_GOLD_LIGHT, font=sparkle_font)

    # Title — large
    title_font = get_font(FONT_TITLE_IT, T_PANEL_TITLE)
    draw_centered_text(draw, "El Momento de Quelina", 35, w, title_font, C_GOLD)

    # Separator — ornamental
    sep_y = 80
    draw.line([(50, sep_y), (w - 50, sep_y)], fill=C_GOLD_LIGHT, width=2)
    # Center diamond
    cx = w // 2
    draw.polygon([(cx, sep_y-7), (cx+7, sep_y), (cx, sep_y+7), (cx-7, sep_y)], fill=C_GOLD)

    # Quelina message — generous size
    if quelina_text:
        msg_font = get_font(FONT_BODY_IT, T_PANEL_MSG)
        draw_text_wrapped(draw, quelina_text, 45, 105, w - 90, msg_font, C_BROWN, line_h=40)

    # Separator before moraleja
    sep_y2 = h - 115
    draw.line([(50, sep_y2), (w - 50, sep_y2)], fill=C_GOLD_LIGHT, width=2)
    cx = w // 2
    draw.polygon([(cx, sep_y2-6), (cx+6, sep_y2), (cx, sep_y2+6), (cx-6, sep_y2)], fill=C_GOLD)

    # Moraleja — the MOST visible text on the page
    if moraleja:
        moral_font = get_font(FONT_TITLE_IT, T_PANEL_MORAL)
        # Center the moraleja with wrapping
        draw_centered_text(draw, f"« {moraleja} »", h - 75, w, moral_font, C_GOLD)

    return panel


# ═══════════════════════════════════════
# PAGE COMPOSERS
# ═══════════════════════════════════════
def detect_scene(story):
    text = (story.get("titulo", "") + " " + story.get("historia", "")).lower()
    if any(w in text for w in ["noche", "luna", "estrella", "dormir"]): return "noche"
    if any(w in text for w in ["agua", "río", "mar", "nadar"]): return "agua"
    if any(w in text for w in ["flor", "jardín", "mariposa"]): return "jardin"
    if any(w in text for w in ["cielo", "volar", "pájaro"]): return "cielo"
    if any(w in text for w in ["cueva", "oscur", "sombra"]): return "cueva"
    if any(w in text for w in ["prado", "hierba", "sol"]): return "prado"
    return "bosque"


def compose_cover(tomo_num, tomo_title, subtitle, cover_img_path=None):
    """Compose premium cover page."""
    page = Image.new("RGB", (PAGE_W, PAGE_H), C_DARK)
    draw = ImageDraw.Draw(page)

    # Cover image (full bleed with overlay)
    if cover_img_path and os.path.exists(cover_img_path):
        try:
            cover = Image.open(cover_img_path).convert("RGB")
            cover = cover.resize((PAGE_W, PAGE_H), Image.LANCZOS)
            # Dark overlay
            overlay = Image.new("RGB", (PAGE_W, PAGE_H), (0, 0, 0))
            page = Image.blend(cover, overlay, 0.45)
            draw = ImageDraw.Draw(page)
        except:
            pass

    # Title
    title_font = get_font(FONT_TITLE, 52)
    draw_centered_text(draw, "La Tortuga Sabia", PAGE_H // 2 - 80, PAGE_W, title_font, C_GOLD)

    # Tomo
    tomo_font = get_font(FONT_TITLE_IT, 28)
    draw_centered_text(draw, f"Tomo {tomo_num}", PAGE_H // 2 - 10, PAGE_W, tomo_font, C_CREAM)

    # Tomo title
    sub_font = get_font(FONT_BODY_IT, 22)
    draw_centered_text(draw, tomo_title, PAGE_H // 2 + 30, PAGE_W, sub_font, C_CREAM)

    # Subtitle
    small_font = get_font(FONT_BODY, 14)
    draw_centered_text(draw, subtitle, PAGE_H // 2 + 70, PAGE_W, small_font, (160, 160, 160))

    # Bottom bar
    draw.rectangle([(0, PAGE_H - 60), (PAGE_W, PAGE_H)], fill=(10, 18, 25))
    bar_font = get_font(FONT_BODY, 12)
    draw_centered_text(draw, "Por CUBALIVE · PASSKAL LLC · Las Vegas, NV", PAGE_H - 40, PAGE_W, bar_font, C_CREAM)

    return page


def compose_story_title_page(story, story_img_path=None):
    """Compose story title page — HERO layout, no overlaps."""
    scene = detect_scene(story)
    page = create_paper_bg(PAGE_W, PAGE_H, scene, seed=story.get("numero", 1))
    draw = ImageDraw.Draw(page)
    num = story.get("numero", 0)

    # Story image FIRST — large hero at top (60% of page width)
    img_bottom = MARGIN + 20  # default if no image
    if story_img_path and os.path.exists(story_img_path):
        try:
            img = Image.open(story_img_path).convert("RGB")
            img_size = int(PAGE_W * 0.58)
            img = img.resize((img_size, img_size), Image.LANCZOS)
            bordered = apply_torn_border(img, "acuarela", seed=num * 7)
            x = (PAGE_W - img_size) // 2
            y_img = MARGIN + 10
            page.paste(bordered, (x, y_img), bordered)
            draw = ImageDraw.Draw(page)  # refresh after paste
            img_bottom = y_img + img_size + 20
        except:
            pass

    # Number — small elegant, above title (not watermark)
    num_font = get_font(FONT_TITLE, 48)
    y_num = img_bottom + 5
    draw_centered_text(draw, str(num), y_num, PAGE_W, num_font, C_GREEN_DEEP)

    # Gold separator with diamond
    y_sep = y_num + 55
    draw.line([(PAGE_W * 3 // 10, y_sep), (PAGE_W * 7 // 10, y_sep)], fill=C_GOLD, width=2)
    cx = PAGE_W // 2
    draw.polygon([(cx, y_sep-6), (cx+6, y_sep), (cx, y_sep+6), (cx-6, y_sep)], fill=C_GOLD)

    # Title — LARGE, below separator
    title = story.get("titulo", "")
    title_font = get_font(FONT_TITLE, T_CHAPTER_TITLE)
    y_title = y_sep + 18
    draw_centered_text(draw, title, y_title, PAGE_W, title_font, C_GREEN_DEEP)

    # Character — below title with clear spacing
    char_font = get_font(FONT_TITLE_IT, T_CHAPTER_CHAR)
    y_char = y_title + 55
    draw_centered_text(draw, story.get("personaje", ""), y_char, PAGE_W, char_font, C_GOLD)

    # Situation — below character with clear spacing
    sit_font = get_font(FONT_BODY_IT, T_CHAPTER_SIT)
    y_sit = y_char + 40
    draw_centered_text(draw, story.get("situacion", ""), y_sit, PAGE_W, sit_font, C_BROWN)

    return page


def compose_story_text_page(story, text_chunk, page_num, has_image=False, img_path=None, layout="A"):
    """Compose a story text page — EDITORIAL PREMIUM layout."""
    scene = detect_scene(story)
    page = create_paper_bg(PAGE_W, PAGE_H, scene, seed=page_num * 13)
    draw = ImageDraw.Draw(page)

    body_font = get_font(FONT_BODY, T_BODY)
    text_w = PAGE_W - 2 * MARGIN
    y = MARGIN + 40
    line_h = T_BODY_LINE_H

    # Split into paragraphs
    paragraphs = text_chunk.split("\n\n") if "\n\n" in text_chunk else [text_chunk]

    if has_image and img_path and os.path.exists(img_path):
        try:
            img = Image.open(img_path).convert("RGB")

            if layout == "B":
                # IMAGE TOP CENTER — text fills below (best for readability)
                img_w = int(PAGE_W * 0.55)
                img_h = int(img_w * 0.75)  # Crop to landscape ratio
                img = img.resize((img_w, img_w), Image.LANCZOS)
                # Crop to landscape
                img_cropped = img.crop((0, int(img_w * 0.12), img_w, int(img_w * 0.88)))
                bordered = apply_torn_border(img_cropped, "acuarela", seed=page_num * 11)
                ix = (PAGE_W - img_w) // 2
                page.paste(bordered, (ix, y), bordered)
                y += img_cropped.size[1] + 35
                # Text below at full width
                for para in paragraphs:
                    if para.strip():
                        y = draw_text_wrapped(draw, para.strip(), MARGIN, y, text_w, body_font, C_BROWN, line_h=line_h)
                        y += 18

            elif layout == "C":
                # TEXT ONLY — no image on this page (image was on title page)
                # Use full page for generous text
                for para in paragraphs:
                    if para.strip():
                        y = draw_text_wrapped(draw, para.strip(), MARGIN, y, text_w, body_font, C_BROWN, line_h=line_h)
                        y += 18

            else:
                # Layout A: SMALL IMAGE as accent, text dominant
                img_w = int(PAGE_W * 0.30)
                img = img.resize((img_w, img_w), Image.LANCZOS)
                bordered = apply_torn_border(img, "fundido", seed=page_num * 11)
                # Place image in right margin as accent
                ix = PAGE_W - MARGIN - img_w + 20
                iy = MARGIN + 60
                page.paste(bordered, (ix, iy), bordered)
                # Text at full width (image overlaps subtly with fundido)
                for para in paragraphs:
                    if para.strip():
                        y = draw_text_wrapped(draw, para.strip(), MARGIN, y, text_w, body_font, C_BROWN, line_h=line_h)
                        y += 18
        except:
            for para in paragraphs:
                if para.strip():
                    y = draw_text_wrapped(draw, para.strip(), MARGIN, y, text_w, body_font, C_BROWN, line_h=line_h)
                    y += 18
    else:
        # TEXT ONLY PAGE — editorial with generous spacing
        # Use softened image background if available from story
        if img_path and os.path.exists(img_path):
            try:
                src = Image.open(img_path).convert("RGB")
                soft_bg = make_soft_background(src, PAGE_W, PAGE_H, opacity=0.06)
                page = Image.blend(page, soft_bg, 0.5)
                draw = ImageDraw.Draw(page)
            except:
                pass

        # Subtle top ornament
        orn_y = y - 15
        draw.line([(PAGE_W // 2 - 80, orn_y), (PAGE_W // 2 - 10, orn_y)], fill=C_GOLD_LIGHT, width=1)
        draw.line([(PAGE_W // 2 + 10, orn_y), (PAGE_W // 2 + 80, orn_y)], fill=C_GOLD_LIGHT, width=1)
        # Center diamond
        cx = PAGE_W // 2
        draw.polygon([(cx, orn_y-4), (cx+4, orn_y), (cx, orn_y+4), (cx-4, orn_y)], fill=C_GOLD_LIGHT)

        for para in paragraphs:
            if para.strip():
                y = draw_text_wrapped(draw, para.strip(), MARGIN, y, text_w, body_font, C_BROWN, line_h=line_h)
                y += 22  # Generous paragraph spacing

    # Page number — subtle
    num_font = get_font(FONT_BODY_IT, T_PAGE_NUM)
    pg_str = str(page_num)
    if page_num % 2 == 1:
        draw.text((PAGE_W - MARGIN + 20, PAGE_H - 45), pg_str, fill=C_GOLD, font=num_font)
    else:
        draw.text((MARGIN - 30, PAGE_H - 45), pg_str, fill=C_GOLD, font=num_font)

    return page


def compose_quelina_page(story, quelina_img_path=None, page_num=0):
    """Compose the Quelina moment page."""
    scene = detect_scene(story)
    page = create_paper_bg(PAGE_W, PAGE_H, scene, seed=page_num * 17)

    # Quelina image with fundido border — centered prominently
    if quelina_img_path and os.path.exists(quelina_img_path):
        try:
            img = Image.open(quelina_img_path).convert("RGB")
            img_w = int(PAGE_W * 0.45)
            img = img.resize((img_w, img_w), Image.LANCZOS)
            bordered = apply_torn_border(img, "fundido", seed=page_num * 19)
            x = (PAGE_W - img_w) // 2
            page.paste(bordered, (x, MARGIN + 15), bordered)
        except:
            pass

    # Golden panel — EDITORIAL PREMIUM (fills lower portion)
    panel_w = PAGE_W - 2 * MARGIN + 20
    panel = create_quelina_panel(
        story.get("quelina_momento", ""),
        story.get("moraleja", ""),
        panel_w,
        scene
    )
    panel_x = (PAGE_W - panel_w) // 2
    panel_y = PAGE_H - MARGIN - 600
    page.paste(panel, (panel_x, panel_y))

    # Page number
    draw = ImageDraw.Draw(page)
    num_font = get_font(FONT_BODY_IT, 11)
    draw.text((PAGE_W - MARGIN, PAGE_H - 35), str(page_num), fill=C_GOLD, font=num_font)

    return page


# ═══════════════════════════════════════
# SPECIAL PAGES
# ═══════════════════════════════════════
def compose_dedication():
    page = create_paper_bg(PAGE_W, PAGE_H, "noche", seed=999)
    draw = ImageDraw.Draw(page)
    font = get_font(FONT_TITLE_IT, T_DEDIC)
    lines = [
        "Para todos los niños que todavía",
        "creen que las tortugas pueden hablar",
        "con las estrellas...",
        "",
        "Y para los padres que se detienen",
        "un momento a escuchar.",
    ]
    y = PAGE_H // 3 - 20
    for line in lines:
        if line:
            draw_centered_text(draw, line, y, PAGE_W, font, C_GOLD)
        y += 48

    # Signature — larger
    sig_font = get_font(FONT_BODY_IT, 24)
    draw_centered_text(draw, "— Quelina", y + 30, PAGE_W, sig_font, C_GOLD_LIGHT)

    return page


def compose_credits():
    page = create_paper_bg(PAGE_W, PAGE_H, "bosque", seed=998)
    draw = ImageDraw.Draw(page)

    # Position in lower third — editorial convention
    y = PAGE_H * 0.55

    pub_font = get_font(FONT_BODY_BOLD, T_CREDITS + 4)
    draw_centered_text(draw, "© 2025 CUBALIVE", y, PAGE_W, pub_font, C_BROWN)
    y += 35

    font = get_font(FONT_BODY, T_CREDITS + 2)
    for line in [
        "Publicado por PASSKAL LLC",
        "Las Vegas, Nevada, USA",
        "",
        "latortugasabia.com",
        "",
        "Todos los derechos reservados.",
        "Ninguna parte de este libro puede ser reproducida",
        "sin permiso escrito del editor.",
        "",
        "Ilustraciones generadas con DALL-E 3",
        "Historias creadas con asistencia de Claude AI",
        "",
        "Primera edición digital — 2025",
    ]:
        if line:
            draw_centered_text(draw, line, y, PAGE_W, font, C_BROWN)
        y += 24
    return page


def compose_index(stories):
    page = create_paper_bg(PAGE_W, PAGE_H, "bosque", seed=997)
    draw = ImageDraw.Draw(page)

    title_font = get_font(FONT_TITLE, T_INDEX_TITLE)
    draw_centered_text(draw, "Índice", MARGIN + 10, PAGE_W, title_font, C_GOLD)

    # Separator under title
    draw.line([(MARGIN + 40, MARGIN + 60), (PAGE_W - MARGIN - 40, MARGIN + 60)], fill=C_GOLD_LIGHT, width=2)

    idx_font = get_font(FONT_BODY, T_INDEX_ENTRY)
    char_font = get_font(FONT_BODY_IT, T_INDEX_ENTRY - 4)
    y = MARGIN + 85

    for s in stories:
        if y > PAGE_H - MARGIN - 30:
            break
        num = str(s.get("numero", "")).zfill(2)
        title = s.get("titulo", "")[:45]
        char = (s.get("personaje", "") or "")[:25]
        draw.text((MARGIN + 10, y), f"{num}.", fill=C_GOLD, font=idx_font)
        draw.text((MARGIN + 55, y), title, fill=C_BROWN, font=idx_font)
        # Right-align character
        bbox = draw.textbbox((0, 0), char, font=char_font)
        cw = bbox[2] - bbox[0]
        draw.text((PAGE_W - MARGIN - cw, y + 3), char, fill=C_GOLD, font=char_font)
        y += 28  # More spacing between entries

    return page


# ═══════════════════════════════════════
# MAIN GENERATOR
# ═══════════════════════════════════════
def generate_premium_book(tomo_num, output_path):
    """Generate complete premium PDF for a tomo."""
    stories_file = f"public/stories/tomo-{tomo_num}/all-stories.json"
    stories = json.load(open(stories_file))
    stories.sort(key=lambda s: s.get("numero", 0))

    tomo_info = {
        1: ("El Bosque Encantado", "50 cuentos terapéuticos para niños de 0-2 años"),
        2: ("El Bosque de los Sentimientos", "50 cuentos sobre emociones para niños de 3-4 años"),
        3: ("El Río de los Sueños", "50 cuentos de aventura para niños de 5-6 años"),
        4: ("La Montaña de la Sabiduría", "50 cuentos de valores para niños de 7-9 años"),
    }
    title, subtitle = tomo_info.get(tomo_num, ("", ""))

    cover_path = f"public/images/portada-b.jpg"
    matched_dir = f"public/images/stories/tomo-{tomo_num}/matched"
    orig_dir = f"public/images/stories/tomo-{tomo_num}"

    print(f"═══ Generating Premium PDF: Tomo {tomo_num} ═══")
    print(f"Stories: {len(stories)}")

    pages = []

    # Special pages
    pages.append(compose_cover(tomo_num, title, subtitle, cover_path))
    pages.append(compose_credits())
    pages.append(compose_dedication())
    pages.append(compose_index(stories))

    # Story pages
    layouts = ["A", "B", "C", "A"]
    page_counter = len(pages) + 1

    for story in stories:
        n = story.get("numero", 0)
        layout = layouts[n % len(layouts)]

        # Find images
        hist_img = f"{matched_dir}/story-{n}-historia.jpg"
        quel_img = f"{matched_dir}/story-{n}-quelina.jpg"
        if not os.path.exists(hist_img):
            hist_img = f"{orig_dir}/story-{n}-portada.jpg"
        if not os.path.exists(quel_img):
            hist_img_fallback = f"{orig_dir}/story-{n}-quelina.jpg"
            if os.path.exists(hist_img_fallback):
                quel_img = hist_img_fallback

        # Title page
        pages.append(compose_story_title_page(story, hist_img if os.path.exists(hist_img) else None))
        page_counter += 1

        # Story text pages
        text = story.get("historia", "")
        words = text.split()
        words_per_page = WORDS_PER_PAGE
        chunks = []
        for i in range(0, len(words), words_per_page):
            chunks.append(" ".join(words[i:i + words_per_page]))
        if not chunks:
            chunks = [""]

        for ci, chunk in enumerate(chunks):
            has_img = (ci == 0) and os.path.exists(hist_img)
            img_for_page = hist_img if has_img else None
            pages.append(compose_story_text_page(
                story, chunk, page_counter, has_img, img_for_page, layout
            ))
            page_counter += 1

        # Quelina page
        if story.get("quelina_momento") or story.get("moraleja"):
            pages.append(compose_quelina_page(
                story,
                quel_img if os.path.exists(quel_img) else None,
                page_counter
            ))
            page_counter += 1

    # Build PDF from PIL pages
    print(f"Assembling {len(pages)} pages into PDF...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    c = rl_canvas.Canvas(output_path, pagesize=(PAGE_W_IN * inch, PAGE_H_IN * inch))

    for i, page_img in enumerate(pages):
        # Save page as temp JPEG
        buf = BytesIO()
        page_img.save(buf, format="JPEG", quality=85, optimize=True)
        buf.seek(0)

        # Draw on PDF canvas
        from reportlab.lib.utils import ImageReader
        c.drawImage(ImageReader(buf), 0, 0, PAGE_W_IN * inch, PAGE_H_IN * inch)
        c.showPage()

        if (i + 1) % 50 == 0:
            print(f"  {i + 1}/{len(pages)} pages...")

    c.save()

    size_mb = os.path.getsize(output_path) / 1024 / 1024
    print(f"\n✅ PDF generated: {output_path}")
    print(f"   Pages: {len(pages)}")
    print(f"   Size: {size_mb:.1f} MB")
    return output_path


if __name__ == "__main__":
    import sys
    tomo = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    out = f"public/downloads/la-tortuga-sabia-tomo-{tomo}-premium-v2.pdf"
    generate_premium_book(tomo, out)
