#!/usr/bin/env node
/**
 * EXPORTACIÓN DE CUENTOS A PDF POR TOMO
 *
 * Genera un PDF por tomo con todos los cuentos publicados.
 * Los PDFs no incluyen imágenes — solo texto formateado.
 *
 * Uso:
 *   node scripts/export_pdf.js             # Exporta todos los tomos
 *   node scripts/export_pdf.js --tomo=3    # Solo el tomo 3
 *   node scripts/export_pdf.js --format=html # Exporta HTML (para imprimir a PDF)
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebkwgrvqavutbfxkwore.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const TARGET_TOMO = args.tomo ? parseInt(args.tomo, 10) : null;
const FORMAT = args.format || 'html';

const TOMO_INFO = {
  1: { titulo: 'El Despertar de Quelina',   subtitulo: 'Cuentos de autoconocimiento y primeras emociones', edades: '4-5 años' },
  2: { titulo: 'El Bosque de los Miedos',   subtitulo: 'Cuentos de valentía y confianza',                   edades: '4-6 años' },
  3: { titulo: 'El Mar de las Amistades',   subtitulo: 'Cuentos de amistad y trabajo en equipo',            edades: '5-6 años' },
  4: { titulo: 'La Montaña de los Sueños',  subtitulo: 'Cuentos de perseverancia y creatividad',            edades: '5-7 años' },
  5: { titulo: 'El Jardín de las Palabras', subtitulo: 'Cuentos de comunicación y empatía',                 edades: '6-7 años' },
  6: { titulo: 'El Cielo de Quelina',       subtitulo: 'Cuentos de gratitud, amor y nuevos comienzos',      edades: '6-8 años' },
  7: { titulo: 'Quelina y el Mundo Grande', subtitulo: 'Cuentos para crecer con sabiduría',                 edades: '9-12 años' },
};

function escapeHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function generateHtml(tomoNum, tomoMeta, stories) {
  const storyPages = stories.map((story, idx) => `
    <div class="story-page" ${idx > 0 ? 'style="page-break-before: always"' : ''}>
      <div class="story-header">
        <div class="story-number">Cuento ${story.numero_en_tomo}</div>
        <h2 class="story-title">${escapeHtml(story.titulo)}</h2>
        <div class="story-meta">
          <span class="tag edad">👶 ${escapeHtml(story.edad_sugerida)}</span>
          <span class="tag tematica">🌱 ${escapeHtml(story.tematica_terapeutica?.replace(/_/g, ' '))}</span>
        </div>
        ${story.resumen ? `<p class="story-summary"><em>${escapeHtml(story.resumen)}</em></p>` : ''}
      </div>

      <div class="story-content">
        <p>${escapeHtml(story.cuento_completo)}</p>
      </div>

      <div class="story-footer">
        <div class="moraleja">
          <span class="moraleja-label">🐢 Quelina dice:</span>
          <p>${escapeHtml(story.moraleja)}</p>
        </div>
        ${story.actividad_sugerida ? `
        <div class="actividad">
          <span class="actividad-label">✋ Actividad para compartir:</span>
          <p>${escapeHtml(story.actividad_sugerida)}</p>
        </div>` : ''}
      </div>
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La Tortuga Sabia — Tomo ${tomoNum}: ${tomoMeta.titulo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Lora', Georgia, serif;
      font-size: 13pt;
      line-height: 1.8;
      color: #2c2c2c;
      background: #fffef9;
    }

    .cover-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 60px 40px;
      background: linear-gradient(135deg, #1a4f3a 0%, #2d7a5a 50%, #1a4f3a 100%);
      color: white;
      page-break-after: always;
    }

    .cover-series { font-family: 'Nunito', sans-serif; font-size: 14pt; letter-spacing: 4px; text-transform: uppercase; opacity: 0.8; margin-bottom: 20px; }
    .cover-turtle { font-size: 72pt; margin: 30px 0; }
    .cover-tomo { font-family: 'Nunito', sans-serif; font-size: 12pt; opacity: 0.7; margin-bottom: 10px; }
    .cover-title { font-size: 36pt; font-weight: 600; line-height: 1.2; margin-bottom: 15px; }
    .cover-subtitle { font-size: 14pt; opacity: 0.85; margin-bottom: 30px; font-style: italic; }
    .cover-edades { font-family: 'Nunito', sans-serif; font-size: 12pt; background: rgba(255,255,255,0.15); padding: 8px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
    .cover-author { font-size: 11pt; opacity: 0.7; margin-top: 40px; letter-spacing: 2px; text-transform: uppercase; }
    .cover-divider { width: 60px; height: 2px; background: rgba(255,255,255,0.4); margin: 20px auto; }

    .toc-page {
      padding: 60px 80px;
      page-break-after: always;
    }
    .toc-title { font-family: 'Nunito', sans-serif; font-size: 18pt; color: #1a4f3a; margin-bottom: 30px; border-bottom: 2px solid #1a4f3a; padding-bottom: 10px; }
    .toc-entry { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; border-bottom: 1px dotted #ccc; }
    .toc-num { color: #1a4f3a; font-weight: 600; min-width: 30px; font-family: 'Nunito', sans-serif; }
    .toc-story-title { flex: 1; padding: 0 10px; }
    .toc-tematica { font-size: 9pt; color: #888; font-style: italic; }

    .story-page {
      padding: 60px 80px;
      max-width: 800px;
      margin: 0 auto;
    }

    .story-header { margin-bottom: 30px; }
    .story-number { font-family: 'Nunito', sans-serif; font-size: 10pt; color: #1a4f3a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
    .story-title { font-size: 22pt; color: #1a4f3a; line-height: 1.3; margin-bottom: 12px; }
    .story-meta { display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap; }
    .tag { font-family: 'Nunito', sans-serif; font-size: 9pt; padding: 3px 10px; border-radius: 12px; }
    .tag.edad { background: #e8f5e9; color: #2d7a5a; }
    .tag.tematica { background: #fff3e0; color: #e65100; }
    .story-summary { font-style: italic; color: #666; font-size: 11pt; border-left: 3px solid #2d7a5a; padding-left: 15px; margin-bottom: 10px; }

    .story-content p { margin-bottom: 1em; text-align: justify; }
    .story-content p:first-child::first-letter {
      font-size: 36pt;
      font-weight: 600;
      color: #1a4f3a;
      float: left;
      line-height: 0.8;
      margin: 8px 8px 0 0;
    }

    .story-footer { margin-top: 35px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
    .moraleja { background: #f0f7f4; border-left: 4px solid #1a4f3a; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 15px; }
    .moraleja-label { font-family: 'Nunito', sans-serif; font-weight: 700; color: #1a4f3a; display: block; margin-bottom: 5px; font-size: 10pt; }
    .moraleja p { font-style: italic; color: #2c4a3a; }
    .actividad { background: #fffde7; border-left: 4px solid #f9a825; padding: 15px 20px; border-radius: 0 8px 8px 0; }
    .actividad-label { font-family: 'Nunito', sans-serif; font-weight: 700; color: #e65100; display: block; margin-bottom: 5px; font-size: 10pt; }

    @media print {
      body { background: white; }
      .story-page { padding: 40px 60px; }
    }
  </style>
</head>
<body>

  <!-- PORTADA -->
  <div class="cover-page">
    <div class="cover-series">La Tortuga Sabia</div>
    <div class="cover-turtle">🐢</div>
    <div class="cover-tomo">Tomo ${tomoNum}</div>
    <h1 class="cover-title">${tomoMeta.titulo}</h1>
    <div class="cover-divider"></div>
    <p class="cover-subtitle">${tomoMeta.subtitulo}</p>
    <div class="cover-edades">Para niños de ${tomoMeta.edades}</div>
    <p style="margin-top: 15px; opacity: 0.7; font-size: 11pt;">${stories.length} cuentos terapéuticos</p>
    <div class="cover-author">CUBALIVE</div>
  </div>

  <!-- ÍNDICE -->
  <div class="toc-page">
    <h2 class="toc-title">Índice de cuentos</h2>
    ${stories.map(s => `
    <div class="toc-entry">
      <span class="toc-num">${s.numero_en_tomo}.</span>
      <span class="toc-story-title">${escapeHtml(s.titulo)}</span>
      <span class="toc-tematica">${(s.tematica_terapeutica || '').replace(/_/g, ' ')}</span>
    </div>`).join('')}
  </div>

  <!-- CUENTOS -->
  ${storyPages}

</body>
</html>`;
}

async function exportTomo(tomoNum) {
  const tomoMeta = TOMO_INFO[tomoNum];
  if (!tomoMeta) {
    console.error(`❌ Tomo ${tomoNum} no definido`);
    return;
  }

  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .eq('tomo', tomoNum)
    .eq('estado', 'publicado')
    .order('numero_en_tomo');

  if (error) throw error;

  if (!stories?.length) {
    console.log(`⚠️  Tomo ${tomoNum}: sin cuentos publicados todavía.`);
    return;
  }

  const outputDir = resolve(__dirname, `../output/tomo_${tomoNum}`);
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const html = generateHtml(tomoNum, tomoMeta, stories);
  const filename = `tomo_${tomoNum}_${tomoMeta.titulo.toLowerCase().replace(/\s+/g, '_').replace(/[áéíóú]/g, c => ({á:'a',é:'e',í:'i',ó:'o',ú:'u'})[c] || c)}.html`;
  const filepath = resolve(outputDir, filename);

  writeFileSync(filepath, html, 'utf-8');
  console.log(`   ✅ Tomo ${tomoNum}: ${stories.length} cuentos → ${filepath}`);
  console.log(`      💡 Abre el HTML en Chrome y usa Ctrl+P → Guardar como PDF`);
}

async function main() {
  console.log('\n🐢 LA TORTUGA SABIA — Exportador de PDF');
  console.log('━'.repeat(50));

  if (!SUPABASE_SERVICE_KEY) throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada');

  const tomos = TARGET_TOMO ? [TARGET_TOMO] : [1, 2, 3, 4, 5, 6, 7];

  for (const tomoNum of tomos) {
    process.stdout.write(`📖 Exportando Tomo ${tomoNum}...`);
    try {
      await exportTomo(tomoNum);
    } catch (err) {
      console.log(` ❌ ${err.message}`);
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log('✅ Exportación completada');
  console.log('📁 Archivos en: output/tomo_N/');
  console.log('💡 Para generar PDF: abre el .html en Chrome → Ctrl+P → Guardar como PDF\n');
}

main().catch(console.error);
