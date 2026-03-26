import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

interface Story {
  numero: number;
  titulo: string;
  personaje: string;
  situacion: string;
  historia: string;
  quelina_momento: string;
  moraleja: string;
}

function addCenteredText(doc: jsPDF, text: string, y: number, size: number, style: string = "normal") {
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
  const pageWidth = doc.internal.pageSize.getWidth();
  const lines = doc.splitTextToSize(text, pageWidth - 60);
  const textWidth = doc.getTextWidth(lines[0] || "");
  const x = (pageWidth - textWidth) / 2;
  doc.text(lines, pageWidth / 2, y, { align: "center" });
  return y + lines.length * (size * 0.5);
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > 570) {
      doc.addPage();
      y = 50;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

async function generatePDF() {
  console.log("═══ Generating Tomo I PDF ═══\n");

  // Load stories
  const storiesPath = path.join(process.cwd(), "public/stories/tomo-1/all-stories.json");
  const stories: Story[] = JSON.parse(fs.readFileSync(storiesPath, "utf-8"));
  stories.sort((a, b) => a.numero - b.numero);
  console.log(`Loaded ${stories.length} stories`);

  // Create PDF (8.5 x 8.5 inches = 612 x 612 points)
  const doc = new jsPDF({ unit: "pt", format: [612, 612] });
  const W = 612;

  // ═══ PAGE 1: Title Page ═══
  doc.setFillColor(5, 13, 18);
  doc.rect(0, 0, W, W, "F");
  doc.setTextColor(254, 250, 224);
  addCenteredText(doc, "LA TORTUGA SABIA", 200, 36, "bold");
  doc.setTextColor(201, 136, 42);
  addCenteredText(doc, "TOMO I", 260, 24, "bold");
  addCenteredText(doc, "El Bosque Encantado", 295, 20, "italic");
  doc.setTextColor(150, 150, 150);
  addCenteredText(doc, "50 cuentos terapéuticos para niños de 0-2 años", 340, 11, "normal");
  addCenteredText(doc, "Por CUBALIVE", 380, 12, "normal");

  // ═══ PAGE 2: Copyright ═══
  doc.addPage();
  doc.setFillColor(5, 13, 18);
  doc.rect(0, 0, W, W, "F");
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  let cy = 450;
  const copyrightLines = [
    "© 2025 CUBALIVE",
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
    "Historias escritas con Claude AI",
    "Música generada con Suno AI",
    "",
    "Primera edición digital — 2025",
    "ISBN: En trámite",
  ];
  for (const line of copyrightLines) {
    doc.text(line, W / 2, cy, { align: "center" });
    cy += 13;
  }

  // ═══ PAGE 3: Dedication ═══
  doc.addPage();
  doc.setFillColor(5, 13, 18);
  doc.rect(0, 0, W, W, "F");
  doc.setTextColor(201, 136, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "italic");
  const dedication = [
    "Para todos los niños que todavía",
    "creen que las tortugas pueden hablar",
    "con las estrellas...",
    "",
    "Y para los padres que se detienen",
    "un momento a escuchar.",
  ];
  let dy = 220;
  for (const line of dedication) {
    doc.text(line, W / 2, dy, { align: "center" });
    dy += 22;
  }

  // ═══ PAGE 4: Letter from author ═══
  doc.addPage();
  doc.setFillColor(5, 13, 18);
  doc.rect(0, 0, W, W, "F");
  doc.setTextColor(254, 250, 224);
  addCenteredText(doc, "Carta del Autor", 80, 20, "bold");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  const letter = `Querido lector,

Este libro nació de una idea simple: que cada niño merece un cuento que entienda exactamente lo que siente.

Quelina no es solo una tortuga. Es esa voz sabia que todos necesitamos cuando el mundo se siente grande y confuso. No da respuestas — hace preguntas. No resuelve problemas — ilumina caminos.

Cada uno de estos 50 cuentos aborda una situación real que los niños pequeños enfrentan: el miedo a la oscuridad, no querer dormir, la llegada de un hermano, los primeros pasos. Quelina aparece en el momento justo, no antes, y deja que cada personaje encuentre su propia luz.

Este libro es para leer en voz alta. Para abrazar mientras se lee. Para volver a leer cuando el niño lo pida otra vez. Y otra vez. Y otra vez.

Porque los mejores cuentos son los que se leen mil veces y cada vez dicen algo nuevo.

Con amor y constelaciones,
CUBALIVE`;
  wrapText(doc, letter, 50, 120, W - 100, 15);

  // ═══ PAGE 5: Table of Contents ═══
  doc.addPage();
  doc.setFillColor(5, 13, 18);
  doc.rect(0, 0, W, W, "F");
  doc.setTextColor(201, 136, 42);
  addCenteredText(doc, "Índice", 60, 22, "bold");
  doc.setTextColor(254, 250, 224);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let iy = 100;
  for (const s of stories) {
    if (iy > 580) {
      doc.addPage();
      doc.setFillColor(5, 13, 18);
      doc.rect(0, 0, W, W, "F");
      doc.setTextColor(254, 250, 224);
      doc.setFontSize(9);
      iy = 50;
    }
    const num = String(s.numero).padStart(2, "0");
    doc.text(`${num}.  ${s.titulo}`, 60, iy);
    doc.setTextColor(150, 150, 150);
    doc.text(`${s.personaje}`, W - 60, iy, { align: "right" });
    doc.setTextColor(254, 250, 224);
    iy += 14;
  }

  // ═══ STORIES ═══
  for (const story of stories) {
    // Story title page
    doc.addPage();
    doc.setFillColor(5, 13, 18);
    doc.rect(0, 0, W, W, "F");

    // Story number
    doc.setTextColor(201, 136, 42);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.text(String(story.numero), W / 2, 180, { align: "center" });

    // Title
    doc.setTextColor(254, 250, 224);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(story.titulo, W - 100);
    doc.text(titleLines, W / 2, 240, { align: "center" });

    // Character & situation
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(story.personaje || "", W / 2, 300, { align: "center" });
    doc.text(story.situacion || "", W / 2, 318, { align: "center" });

    // Story text page
    doc.addPage();
    doc.setFillColor(5, 13, 18);
    doc.rect(0, 0, W, W, "F");
    doc.setTextColor(230, 225, 210);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let sy = 50;
    const paragraphs = (story.historia || "").split("\n\n");
    for (const para of paragraphs) {
      if (para.trim()) {
        sy = wrapText(doc, para.trim(), 50, sy, W - 100, 15);
        sy += 8;
      }
    }

    // Quelina moment box
    if (story.quelina_momento) {
      if (sy > 480) {
        doc.addPage();
        doc.setFillColor(5, 13, 18);
        doc.rect(0, 0, W, W, "F");
        sy = 50;
      }
      sy += 10;
      doc.setDrawColor(201, 136, 42);
      doc.setFillColor(20, 15, 10);
      doc.roundedRect(40, sy, W - 80, 80, 8, 8, "FD");
      doc.setTextColor(201, 136, 42);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("EL MOMENTO DE QUELINA", 55, sy + 18);
      doc.setTextColor(220, 210, 190);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      wrapText(doc, story.quelina_momento, 55, sy + 35, W - 120, 12);
    }

    // Moraleja
    if (story.moraleja) {
      doc.setTextColor(201, 136, 42);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(story.moraleja, W / 2, 570, { align: "center" });
    }
  }

  // ═══ FINAL PAGES ═══
  doc.addPage();
  doc.setFillColor(5, 13, 18);
  doc.rect(0, 0, W, W, "F");
  doc.setTextColor(201, 136, 42);
  addCenteredText(doc, "Sobre el Autor", 150, 22, "bold");
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  wrapText(doc, "CUBALIVE es un creador digital, padre y soñador que cree que la tecnología puede hacer del mundo un lugar más mágico para los niños. Desde Las Vegas, Nevada, combina inteligencia artificial, arte y narrativa para crear experiencias que abrazan, enseñan y acompañan. La Tortuga Sabia es su primera obra publicada — la primera de muchas constelaciones por descubrir.", 60, 200, W - 120, 16);

  // Coming soon
  doc.addPage();
  doc.setFillColor(5, 13, 18);
  doc.rect(0, 0, W, W, "F");
  doc.setTextColor(201, 136, 42);
  addCenteredText(doc, "Próximamente", 150, 22, "bold");
  doc.setTextColor(254, 250, 224);
  doc.setFontSize(14);
  const tomos = [
    "Tomo II — Los Amigos del Camino (3-4 años)",
    "Tomo III — El Río de los Sueños (5-6 años)",
    "Tomo IV — La Montaña de la Sabiduría (7-9 años)",
  ];
  let ty = 220;
  for (const t of tomos) {
    doc.text(t, W / 2, ty, { align: "center" });
    ty += 30;
  }
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(11);
  doc.text("latortugasabia.com", W / 2, ty + 40, { align: "center" });

  // Save
  const outputDir = path.join(process.cwd(), "public/downloads");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "la-tortuga-sabia-tomo-1.pdf");
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(outputPath, pdfBuffer);
  const sizeMB = (pdfBuffer.length / 1024 / 1024).toFixed(2);
  console.log(`✅ PDF generated: ${outputPath} (${sizeMB} MB)`);
  console.log(`   Pages: ~${doc.getNumberOfPages()}`);
  console.log(`   Stories: ${stories.length}`);
}

generatePDF().catch(console.error);
