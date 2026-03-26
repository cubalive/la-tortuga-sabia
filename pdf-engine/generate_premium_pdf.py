#!/usr/bin/env python3
"""
La Tortuga Sabia — Premium Book PDF Generator
PASSKAL LLC / CUBALIVE © 2025
"""

import json
import os
import math
import random
from io import BytesIO
from pathlib import Path
from reportlab.lib.pagesizes import inch
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image as RLImage,
    Table, TableStyle, Frame, PageTemplate, BaseDocTemplate, KeepTogether
)
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm, mm
from PIL import Image as PILImage, ImageDraw, ImageFilter, ImageFont
import numpy as np

# ═══════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════
PAGE_W = 8.5 * inch  # 612 pts
PAGE_H = 8.5 * inch  # Square format
MARGIN = 0.7 * inch
TEXT_W = PAGE_W - 2 * MARGIN

# Colors
JADE = HexColor("#2D6A4F")
JADE_DARK = HexColor("#1B4332")
GOLD = HexColor("#C9882A")
GOLD_LIGHT = HexColor("#E8B84B")
CREAM = HexColor("#FEFAE0")
DARK = HexColor("#050d12")
BROWN = HexColor("#3D2510")
GREEN_DEEP = HexColor("#1B3A2D")

SCENE_COLORS = {
    "noche": (238, 242, 252),
    "bosque": (238, 248, 240),
    "jardin": (252, 240, 240),
    "agua": (232, 244, 252),
    "cielo": (240, 246, 255),
    "cueva": (244, 236, 252),
    "prado": (252, 246, 232),
}


def create_paper_texture(w, h, scene="bosque"):
    """Create warm paper-like background."""
    base_color = SCENE_COLORS.get(scene, (245, 242, 235))
    img = PILImage.new("RGB", (w, h), base_color)
    pixels = np.array(img, dtype=np.float32)

    # Add subtle grain
    noise = np.random.normal(0, 3, pixels.shape)
    pixels = np.clip(pixels + noise, 0, 255)

    # Add vignette
    y, x = np.ogrid[:h, :w]
    cx, cy = w / 2, h / 2
    dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / np.sqrt(cx ** 2 + cy ** 2)
    vignette = 1 - dist * 0.06
    for c in range(3):
        pixels[:, :, c] *= vignette

    return PILImage.fromarray(pixels.astype(np.uint8))


def apply_torn_border(img, seed=42):
    """Apply torn paper edge to image."""
    rng = random.Random(seed)
    w, h = img.size

    # Create mask with irregular edges
    mask = PILImage.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)

    margin = int(min(w, h) * 0.04)
    points = []
    num_points = 120
    for i in range(num_points):
        t = i / num_points
        if t < 0.25:  # top
            x = margin + (w - 2 * margin) * (t / 0.25)
            y = margin + rng.gauss(0, margin * 0.5)
        elif t < 0.5:  # right
            x = w - margin + rng.gauss(0, margin * 0.5)
            y = margin + (h - 2 * margin) * ((t - 0.25) / 0.25)
        elif t < 0.75:  # bottom
            x = w - margin - (w - 2 * margin) * ((t - 0.5) / 0.25)
            y = h - margin + rng.gauss(0, margin * 0.5)
        else:  # left
            x = margin + rng.gauss(0, margin * 0.5)
            y = h - margin - (h - 2 * margin) * ((t - 0.75) / 0.25)
        points.append((max(0, min(w - 1, int(x))), max(0, min(h - 1, int(y)))))

    draw.polygon(points, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(2))

    result = PILImage.new("RGBA", (w, h), (0, 0, 0, 0))
    img_rgba = img.convert("RGBA")
    result.paste(img_rgba, mask=mask)
    return result


class TortugaBook:
    """Generates premium children's book PDF."""

    def __init__(self, tomo_num, stories, output_path, images_dir=None):
        self.tomo = tomo_num
        self.stories = sorted(stories, key=lambda s: s.get("numero", 0))
        self.output_path = output_path
        self.images_dir = images_dir

        self.tomo_info = {
            1: {"title": "El Bosque Encantado", "subtitle": "50 cuentos terapéuticos para niños de 0-2 años", "color": "#2D6A4F", "scene": "bosque"},
            2: {"title": "El Bosque de los Sentimientos", "subtitle": "50 cuentos sobre emociones y primeras amistades", "color": "#C9882A", "scene": "prado"},
            3: {"title": "El Río de los Sueños", "subtitle": "50 cuentos sobre aventuras y descubrimiento", "color": "#4682B4", "scene": "agua"},
            4: {"title": "La Montaña de la Sabiduría", "subtitle": "50 cuentos sobre valores y resiliencia", "color": "#7B5EA7", "scene": "cielo"},
        }[tomo_num]

    def generate(self):
        """Generate the complete book PDF."""
        c = canvas.Canvas(self.output_path, pagesize=(PAGE_W, PAGE_H))
        c.setTitle(f"La Tortuga Sabia — Tomo {self.tomo}: {self.tomo_info['title']}")
        c.setAuthor("CUBALIVE")
        c.setSubject("Cuentos terapéuticos infantiles")

        page_num = [0]

        def new_page():
            page_num[0] += 1
            return page_num[0]

        # ═══ PORTADA ═══
        self._draw_cover(c)
        c.showPage()
        new_page()

        # ═══ CRÉDITOS ═══
        self._draw_credits(c)
        c.showPage()
        new_page()

        # ═══ DEDICATORIA ═══
        self._draw_dedication(c)
        c.showPage()
        new_page()

        # ═══ CARTA DEL AUTOR ═══
        self._draw_letter(c)
        c.showPage()
        new_page()

        # ═══ ÍNDICE ═══
        self._draw_index(c)
        c.showPage()
        new_page()

        # ═══ SEPARADOR ═══
        self._draw_separator(c)
        c.showPage()
        new_page()

        # ═══ 50 CUENTOS ═══
        for story in self.stories:
            # Title page
            self._draw_story_title(c, story)
            c.showPage()
            new_page()

            # Story text pages
            pages = self._split_story_text(story)
            for i, page_text in enumerate(pages):
                is_last = (i == len(pages) - 1)
                self._draw_story_page(c, story, page_text, page_num[0], is_last)
                c.showPage()
                new_page()

            # Quelina moment page
            if story.get("quelina_momento") or story.get("moraleja"):
                self._draw_quelina_page(c, story, page_num[0])
                c.showPage()
                new_page()

        # ═══ SOBRE EL AUTOR ═══
        self._draw_about(c)
        c.showPage()
        new_page()

        # ═══ CONTRAPORTADA ═══
        self._draw_back_cover(c)
        c.showPage()

        c.save()
        print(f"✅ PDF generated: {self.output_path}")
        print(f"   Pages: {page_num[0] + 1}")
        print(f"   Stories: {len(self.stories)}")
        return self.output_path

    def _set_bg(self, c, scene=None):
        """Set page background color."""
        scene = scene or self.tomo_info["scene"]
        colors = SCENE_COLORS.get(scene, (245, 242, 235))
        c.setFillColorRGB(colors[0] / 255, colors[1] / 255, colors[2] / 255)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    def _draw_page_num(self, c, n):
        """Draw page number with decorative leaf."""
        c.setFillColor(GOLD)
        c.setFont("Helvetica", 9)
        x = PAGE_W - MARGIN if n % 2 == 1 else MARGIN
        c.drawCentredString(x, 25, str(n))

    def _draw_cover(self, c):
        """Draw book cover."""
        # Dark background
        c.setFillColor(DARK)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        # Load cover image if available
        cover_path = f"public/images/portada-b.jpg"
        if os.path.exists(cover_path):
            try:
                c.drawImage(cover_path, 0, 0, PAGE_W, PAGE_H, preserveAspectRatio=True, anchor="c")
                # Dark overlay
                c.setFillColorRGB(0.02, 0.05, 0.07, 0.5)
                c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
            except:
                pass

        # Title
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 42)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.55, "La Tortuga Sabia")

        # Tomo subtitle
        c.setFont("Helvetica-Oblique", 18)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.48, f"Tomo {self.tomo}")

        c.setFont("Helvetica-Oblique", 16)
        c.setFillColor(CREAM)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.43, self.tomo_info["title"])

        # Subtitle
        c.setFont("Helvetica", 11)
        c.setFillColorRGB(0.6, 0.6, 0.6)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.37, self.tomo_info["subtitle"])

        # Bottom bar
        c.setFillColorRGB(0.02, 0.05, 0.07, 0.7)
        c.rect(0, 0, PAGE_W, 60, fill=1, stroke=0)
        c.setFillColor(CREAM)
        c.setFont("Helvetica", 10)
        c.drawCentredString(PAGE_W / 2, 28, "Por CUBALIVE · PASSKAL LLC · Las Vegas, NV")

    def _draw_credits(self, c):
        """Draw credits page."""
        self._set_bg(c, "bosque")
        c.setFillColor(BROWN)
        y = PAGE_H * 0.45
        lines = [
            ("Helvetica-Bold", 10, "© 2025 CUBALIVE"),
            ("Helvetica", 9, "Publicado por PASSKAL LLC"),
            ("Helvetica", 9, "Las Vegas, Nevada, USA"),
            ("Helvetica", 9, ""),
            ("Helvetica", 9, "latortugasabia.com"),
            ("Helvetica", 9, ""),
            ("Helvetica", 9, "Todos los derechos reservados."),
            ("Helvetica", 9, "Ninguna parte de este libro puede ser"),
            ("Helvetica", 9, "reproducida sin permiso escrito del editor."),
            ("Helvetica", 9, ""),
            ("Helvetica", 8, "Ilustraciones generadas con DALL-E 3"),
            ("Helvetica", 8, "Historias creadas con asistencia de IA"),
            ("Helvetica", 8, ""),
            ("Helvetica-Bold", 9, "Primera edición digital — 2025"),
        ]
        for font, size, text in lines:
            c.setFont(font, size)
            c.drawCentredString(PAGE_W / 2, y, text)
            y -= size * 1.6

    def _draw_dedication(self, c):
        """Draw dedication page."""
        self._set_bg(c, "noche")
        c.setFillColor(GOLD)
        c.setFont("Helvetica-BoldOblique", 16)

        lines = [
            "Para todos los niños que todavía",
            "creen que las tortugas pueden hablar",
            "con las estrellas...",
            "",
            "Y para los padres que se detienen",
            "un momento a escuchar.",
        ]
        y = PAGE_H * 0.55
        for line in lines:
            c.drawCentredString(PAGE_W / 2, y, line)
            y -= 26

        c.setFont("Helvetica", 12)
        c.drawCentredString(PAGE_W / 2, y - 30, "— Quelina 🐢")

    def _draw_letter(self, c):
        """Draw author's letter."""
        self._set_bg(c)
        c.setFillColor(GREEN_DEEP)
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(PAGE_W / 2, PAGE_H - MARGIN - 30, "Carta del Autor")

        c.setFillColor(BROWN)
        c.setFont("Helvetica", 10)
        text = """Querido lector,

Este libro nació de una idea simple: que cada niño merece un cuento que entienda exactamente lo que siente.

Quelina no es solo una tortuga. Es esa voz sabia que todos necesitamos cuando el mundo se siente grande y confuso. No da respuestas — hace preguntas. No resuelve problemas — ilumina caminos.

Cada uno de estos 50 cuentos aborda una situación real que los niños pequeños enfrentan. Quelina aparece en el momento justo, no antes, y deja que cada personaje encuentre su propia luz.

Este libro es para leer en voz alta. Para abrazar mientras se lee. Para volver a leer cuando el niño lo pida otra vez.

Porque los mejores cuentos son los que se leen mil veces y cada vez dicen algo nuevo.

Con amor y constelaciones,
CUBALIVE
Las Vegas, 2025"""

        y = PAGE_H - MARGIN - 70
        for line in text.split("\n"):
            if line.strip():
                c.drawString(MARGIN + 20, y, line.strip())
            y -= 14

    def _draw_index(self, c):
        """Draw table of contents."""
        self._set_bg(c)
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(PAGE_W / 2, PAGE_H - MARGIN - 30, "Índice")

        c.setFillColor(BROWN)
        c.setFont("Helvetica", 9)
        y = PAGE_H - MARGIN - 70

        for s in self.stories:
            if y < MARGIN + 30:
                c.showPage()
                self._set_bg(c)
                c.setFillColor(BROWN)
                c.setFont("Helvetica", 9)
                y = PAGE_H - MARGIN - 30

            num = str(s.get("numero", "")).zfill(2)
            title = s.get("titulo", "")[:55]
            character = (s.get("personaje", "") or "")[:25]

            c.drawString(MARGIN + 10, y, f"{num}.")
            c.drawString(MARGIN + 35, y, title)
            c.setFillColor(GOLD)
            c.drawRightString(PAGE_W - MARGIN - 10, y, character)
            c.setFillColor(BROWN)
            y -= 13

    def _draw_separator(self, c):
        """Draw separator page."""
        self._set_bg(c, "noche")
        c.setFillColor(GOLD)
        c.setFont("Helvetica-BoldOblique", 24)
        c.drawCentredString(PAGE_W / 2, PAGE_H / 2 + 20, "Que comience la magia...")

        c.setFont("Helvetica", 14)
        c.drawCentredString(PAGE_W / 2, PAGE_H / 2 - 20, "✦")

    def _draw_story_title(self, c, story):
        """Draw story title page."""
        scene = self._get_scene(story)
        self._set_bg(c, scene)

        num = story.get("numero", 0)

        # Big watermark number
        c.setFillColorRGB(0.1, 0.23, 0.18, 0.06)
        c.setFont("Helvetica-Bold", 120)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.55, str(num))

        # Actual number
        c.setFillColor(GREEN_DEEP)
        c.setFont("Helvetica-Bold", 42)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.58, str(num))

        # Gold separator
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.5)
        c.line(PAGE_W * 0.3, PAGE_H * 0.52, PAGE_W * 0.7, PAGE_H * 0.52)
        # Diamond in center
        cx, cy = PAGE_W / 2, PAGE_H * 0.52
        c.setFillColor(GOLD)
        p = c.beginPath()
        p.moveTo(cx, cy + 5)
        p.lineTo(cx + 5, cy)
        p.lineTo(cx, cy - 5)
        p.lineTo(cx - 5, cy)
        p.close()
        c.drawPath(p, fill=1)

        # Title
        c.setFillColor(GREEN_DEEP)
        c.setFont("Helvetica-Bold", 22)
        title = story.get("titulo", "")
        if len(title) > 35:
            # Split into 2 lines
            mid = len(title) // 2
            split = title.rfind(" ", 0, mid + 10)
            if split == -1:
                split = mid
            c.drawCentredString(PAGE_W / 2, PAGE_H * 0.45, title[:split])
            c.drawCentredString(PAGE_W / 2, PAGE_H * 0.41, title[split:].strip())
        else:
            c.drawCentredString(PAGE_W / 2, PAGE_H * 0.45, title)

        # Character
        c.setFillColor(GOLD)
        c.setFont("Helvetica-BoldOblique", 14)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.36, story.get("personaje", ""))

        # Situation
        c.setFillColor(BROWN)
        c.setFont("Helvetica-Oblique", 11)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.32, story.get("situacion", ""))

        # Cover image if available
        img_path = None
        if self.images_dir:
            img_path = os.path.join(self.images_dir, f"story-{num}-portada.jpg")
        if img_path and os.path.exists(img_path):
            try:
                img_w = PAGE_W * 0.4
                img_h = img_w
                x = (PAGE_W - img_w) / 2
                y = PAGE_H * 0.08
                c.drawImage(img_path, x, y, img_w, img_h, preserveAspectRatio=True, anchor="c")
            except:
                pass

    def _draw_story_page(self, c, story, text, page_num, is_last):
        """Draw a story text page."""
        scene = self._get_scene(story)
        self._set_bg(c, scene)

        c.setFillColor(BROWN)
        c.setFont("Helvetica", 11)

        y = PAGE_H - MARGIN - 20
        line_height = 15

        # Draw text
        paragraphs = text.split("\n\n") if "\n\n" in text else [text]
        for para in paragraphs:
            words = para.strip().split()
            if not words:
                y -= line_height
                continue

            line = ""
            for word in words:
                test = f"{line} {word}".strip()
                if c.stringWidth(test, "Helvetica", 11) > TEXT_W:
                    c.drawString(MARGIN, y, line)
                    y -= line_height
                    line = word
                    if y < MARGIN + 40:
                        break
                else:
                    line = test
            if line:
                c.drawString(MARGIN, y, line)
                y -= line_height
            y -= 6  # paragraph spacing

        # Page number
        self._draw_page_num(c, page_num)

    def _draw_quelina_page(self, c, story, page_num):
        """Draw the Quelina moment page with golden panel."""
        scene = self._get_scene(story)
        self._set_bg(c, scene)

        # Quelina image if available
        num = story.get("numero", 0)
        img_path = None
        if self.images_dir:
            img_path = os.path.join(self.images_dir, f"story-{num}-quelina.jpg")
        if img_path and os.path.exists(img_path):
            try:
                img_w = PAGE_W * 0.35
                img_h = img_w
                x = (PAGE_W - img_w) / 2
                c.drawImage(img_path, x, PAGE_H * 0.62, img_w, img_h, preserveAspectRatio=True, anchor="c")
            except:
                pass

        # Golden panel
        panel_x = MARGIN + 10
        panel_y = MARGIN + 40
        panel_w = TEXT_W - 20
        panel_h = PAGE_H * 0.45

        # Panel background
        c.setFillColorRGB(1, 0.99, 0.91)  # #FFFCE8
        c.roundRect(panel_x, panel_y, panel_w, panel_h, 14, fill=1, stroke=0)

        # Panel border
        c.setStrokeColor(GOLD)
        c.setLineWidth(2.5)
        c.roundRect(panel_x, panel_y, panel_w, panel_h, 14, fill=0, stroke=1)

        # Inner border
        c.setStrokeColor(GOLD_LIGHT)
        c.setLineWidth(0.8)
        c.roundRect(panel_x + 6, panel_y + 6, panel_w - 12, panel_h - 12, 10, fill=0, stroke=1)

        # Panel title
        c.setFillColor(GOLD)
        c.setFont("Helvetica-BoldOblique", 13)
        c.drawCentredString(PAGE_W / 2, panel_y + panel_h - 30, "🐢 El Momento de Quelina")

        # Separator line
        c.setStrokeColor(GOLD_LIGHT)
        c.setLineWidth(0.5)
        sep_y = panel_y + panel_h - 40
        c.line(panel_x + 30, sep_y, panel_x + panel_w - 30, sep_y)

        # Quelina message
        quelina_text = story.get("quelina_momento", "")
        if quelina_text:
            c.setFillColor(BROWN)
            c.setFont("Helvetica-Oblique", 10)

            y = sep_y - 20
            words = quelina_text.split()
            line = ""
            max_w = panel_w - 40
            for word in words:
                test = f"{line} {word}".strip()
                if c.stringWidth(test, "Helvetica-Oblique", 10) > max_w:
                    c.drawCentredString(PAGE_W / 2, y, line)
                    y -= 14
                    line = word
                else:
                    line = test
            if line:
                c.drawCentredString(PAGE_W / 2, y, line)
                y -= 14

        # Separator before moraleja
        c.setStrokeColor(GOLD_LIGHT)
        moral_sep_y = panel_y + 55
        c.line(panel_x + 30, moral_sep_y, panel_x + panel_w - 30, moral_sep_y)

        # Moraleja
        moraleja = story.get("moraleja", "")
        if moraleja:
            c.setFillColor(GOLD)
            c.setFont("Helvetica-BoldOblique", 13)
            c.drawCentredString(PAGE_W / 2, panel_y + 30, f"✦ {moraleja}")

        # Corner sparkles
        sparkle = "✦"
        c.setFillColor(GOLD_LIGHT)
        c.setFont("Helvetica", 10)
        c.drawString(panel_x + 12, panel_y + panel_h - 18, sparkle)
        c.drawString(panel_x + panel_w - 20, panel_y + panel_h - 18, sparkle)
        c.drawString(panel_x + 12, panel_y + 10, sparkle)
        c.drawString(panel_x + panel_w - 20, panel_y + 10, sparkle)

        self._draw_page_num(c, page_num)

    def _draw_about(self, c):
        """Draw about the author page."""
        self._set_bg(c)
        c.setFillColor(GREEN_DEEP)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(PAGE_W / 2, PAGE_H - MARGIN - 40, "Sobre el Autor")

        c.setFillColor(BROWN)
        c.setFont("Helvetica", 11)
        text = """CUBALIVE es un creador digital, padre y soñador que cree que la tecnología puede hacer del mundo un lugar más mágico para los niños.

Desde Las Vegas, Nevada, combina inteligencia artificial, arte y narrativa para crear experiencias que abrazan, enseñan y acompañan.

La Tortuga Sabia es su primera colección publicada — la primera de muchas constelaciones por descubrir.

latortugasabia.com"""

        y = PAGE_H - MARGIN - 80
        for line in text.split("\n"):
            if line.strip():
                words = line.strip().split()
                wline = ""
                for word in words:
                    test = f"{wline} {word}".strip()
                    if c.stringWidth(test, "Helvetica", 11) > TEXT_W - 40:
                        c.drawCentredString(PAGE_W / 2, y, wline)
                        y -= 16
                        wline = word
                    else:
                        wline = test
                if wline:
                    c.drawCentredString(PAGE_W / 2, y, wline)
                    y -= 16
            y -= 8

    def _draw_back_cover(self, c):
        """Draw back cover."""
        c.setFillColor(DARK)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.6, "La Tortuga Sabia")

        c.setFillColor(CREAM)
        c.setFont("Helvetica-Oblique", 12)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.54, "200 cuentos terapéuticos para niños de 0 a 9 años")

        tomos = [
            "Tomo I — El Bosque Encantado (0-2 años)",
            "Tomo II — El Bosque de los Sentimientos (3-4 años)",
            "Tomo III — El Río de los Sueños (5-6 años)",
            "Tomo IV — La Montaña de la Sabiduría (7-9 años)",
        ]
        y = PAGE_H * 0.42
        c.setFont("Helvetica", 11)
        for t in tomos:
            c.drawCentredString(PAGE_W / 2, y, t)
            y -= 20

        c.setFillColorRGB(0.4, 0.4, 0.4)
        c.setFont("Helvetica", 9)
        c.drawCentredString(PAGE_W / 2, 40, "© 2025 CUBALIVE · PASSKAL LLC · latortugasabia.com")

    def _split_story_text(self, story):
        """Split story text into pages (~250 words each)."""
        text = story.get("historia", "")
        words = text.split()
        pages = []
        words_per_page = 250

        for i in range(0, len(words), words_per_page):
            chunk = " ".join(words[i:i + words_per_page])
            pages.append(chunk)

        return pages if pages else [""]

    def _get_scene(self, story):
        """Determine scene type from story content."""
        text = (story.get("titulo", "") + " " + story.get("historia", "")).lower()
        if any(w in text for w in ["noche", "luna", "estrella", "dormir", "sueño"]):
            return "noche"
        if any(w in text for w in ["agua", "río", "mar", "nadar", "pez"]):
            return "agua"
        if any(w in text for w in ["flor", "jardín", "mariposa", "primavera"]):
            return "jardin"
        if any(w in text for w in ["cielo", "volar", "pájaro", "nube"]):
            return "cielo"
        if any(w in text for w in ["cueva", "oscur", "miedo", "sombra"]):
            return "cueva"
        if any(w in text for w in ["prado", "hierba", "sol", "campo"]):
            return "prado"
        return "bosque"


def main():
    import sys

    tomo_num = int(sys.argv[1]) if len(sys.argv) > 1 else 1

    stories_file = f"public/stories/tomo-{tomo_num}/all-stories.json"
    if not os.path.exists(stories_file):
        # Try individual files
        import glob
        files = sorted(glob.glob(f"public/stories/tomo-{tomo_num}/story-*.json"),
                       key=lambda x: int("".join(c for c in os.path.basename(x).replace("story-", "").replace(".json", "") if c.isdigit()) or "0"))
        stories = []
        for f in files:
            if "all-" not in f and "literary" not in f:
                try:
                    stories.append(json.load(open(f)))
                except:
                    pass
        # Dedupe
        seen = set()
        unique = []
        for s in stories:
            n = s.get("numero", 0)
            if n > 0 and n not in seen:
                seen.add(n)
                unique.append(s)
        stories = sorted(unique, key=lambda s: s.get("numero", 0))
    else:
        stories = json.load(open(stories_file))

    print(f"Loaded {len(stories)} stories for Tomo {tomo_num}")

    images_dir = f"public/images/stories/tomo-{tomo_num}"
    output = f"public/downloads/la-tortuga-sabia-tomo-{tomo_num}-premium.pdf"
    os.makedirs(os.path.dirname(output), exist_ok=True)

    book = TortugaBook(tomo_num, stories, output, images_dir)
    book.generate()


if __name__ == "__main__":
    main()
