import fs from "fs";
import path from "path";

// epub-gen-memory returns a Buffer
async function generateEpub() {
  console.log("=== Generating EPUB ===\n");

  const storiesPath = path.join(process.cwd(), "public/stories/tomo-1/all-stories.json");
  const stories = JSON.parse(fs.readFileSync(storiesPath, "utf-8"));
  stories.sort((a: any, b: any) => a.numero - b.numero);
  console.log(`Loaded ${stories.length} stories`);

  const chapters = [
    {
      title: "Dedicatoria",
      content: `<div style="text-align:center;margin-top:40%;"><p><em>Para todos los niños que todavía creen que las tortugas pueden hablar con las estrellas...</em></p><p><em>Y para los padres que se detienen un momento a escuchar.</em></p><br/><p>— Quelina 🐢</p></div>`,
    },
    {
      title: "Carta al lector",
      content: `<h2>Querido papá, querida mamá:</h2><p>Este libro nació de una pregunta que no me dejaba dormir: ¿qué pasaría si los niños tuvieran a alguien que los escuchara de verdad?</p><p>No un adulto que da consejos. Alguien que se sienta despacio, hace una sola pregunta poderosa, y luego espera en silencio.</p><p>Así nació Quelina.</p><p>Ella no resuelve problemas. Ilumina caminos. No da respuestas. Hace preguntas que cambian todo.</p><p>Este libro es para leer en voz alta. Para abrazar mientras se lee. Para volver a leer cuando el niño lo pida otra vez. Y otra vez.</p><p>Porque los mejores cuentos son los que se leen mil veces y cada vez dicen algo nuevo.</p><p>Con amor y constelaciones,<br/><strong>CUBALIVE</strong><br/>Las Vegas, 2025</p>`,
    },
    ...stories.map((s: any) => ({
      title: `${s.numero}. ${s.titulo}`,
      content: `
        <h2>${s.titulo}</h2>
        <p style="color:#666;font-size:0.9em;font-style:italic;">Cuento #${s.numero} · ${s.personaje || ""} · ${s.situacion || ""}</p>
        <hr/>
        ${(s.historia || "").split("\n\n").map((p: string) => `<p>${p}</p>`).join("")}
        ${s.quelina_momento ? `<div style="background:#f0f7f0;border-left:4px solid #2D6A4F;padding:15px;margin:20px 0;border-radius:0 8px 8px 0;"><p style="font-weight:bold;color:#2D6A4F;margin:0 0 8px;">🐢 El momento de Quelina:</p><p style="font-style:italic;color:#1a4a35;margin:0;">${s.quelina_momento}</p></div>` : ""}
        ${s.moraleja ? `<p style="text-align:center;color:#C9882A;font-style:italic;margin:20px 0;">✦ ${s.moraleja}</p>` : ""}
      `,
    })),
    {
      title: "Sobre el Autor",
      content: `<h2>CUBALIVE</h2><p>Creador digital, padre y soñador que cree que la tecnología puede hacer del mundo un lugar más mágico para los niños. Desde Las Vegas, Nevada, combina inteligencia artificial, arte y narrativa para crear experiencias que abrazan, enseñan y acompañan.</p><p><strong>latortugasabia.com</strong></p>`,
    },
    {
      title: "La colección completa",
      content: `<h2>La colección de La Tortuga Sabia</h2><p><strong>Tomo I — El Bosque Encantado</strong> (0-2 años) ✓</p><p><strong>Tomo II — El Bosque de los Sentimientos</strong> (3-4 años) · Próximamente</p><p><strong>Tomo III — El Gran Río de las Preguntas</strong> (5-6 años) · Próximamente</p><p><strong>Tomo IV — Las Montañas que se Pueden Escalar</strong> (7-9 años) · Próximamente</p><br/><p>latortugasabia.com</p>`,
    },
  ];

  // Dynamic import for epub-gen-memory
  const { default: Epub } = await import("epub-gen-memory");

  const epub = await Epub(
    {
      title: "La Tortuga Sabia — El Bosque Encantado",
      author: "CUBALIVE",
      publisher: "PASSKAL LLC",
      lang: "es",
      tocTitle: "Contenido",
      description: "50 cuentos terapéuticos para niños de 0 a 2 años",
      css: `
        body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #1a1a1a; }
        h1, h2 { color: #2D6A4F; margin-bottom: 16px; }
        h3 { color: #C9882A; }
        p { margin-bottom: 14px; }
        em { color: #2D6A4F; }
        hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
      `,
    },
    chapters
  );

  const outputDir = path.join(process.cwd(), "public/downloads");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "la-tortuga-sabia-tomo-1.epub");
  fs.writeFileSync(outputPath, epub);

  const sizeMB = (epub.length / 1024 / 1024).toFixed(2);
  console.log(`\n✅ EPUB generated: ${outputPath}`);
  console.log(`   Size: ${sizeMB} MB`);
  console.log(`   Chapters: ${chapters.length}`);
  console.log(`   Stories: ${stories.length}`);
}

generateEpub().catch(console.error);
