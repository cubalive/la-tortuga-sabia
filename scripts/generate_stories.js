#!/usr/bin/env node
/**
 * LA TORTUGA SABIA — Story Generation Script
 *
 * Uso:
 *   node scripts/generate_stories.js --tomo=1          # Genera un tomo específico
 *   node scripts/generate_stories.js --tomo=all        # Genera todos los tomos
 *   node scripts/generate_stories.js --tomo=2 --from=5 # Desde el cuento #5 del tomo 2
 *   node scripts/generate_stories.js --tomo=all --dry-run
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebkwgrvqavutbfxkwore.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const GENERATE_IMAGES = false;
const GENERATE_AUDIO = false;
const DELAY_BETWEEN_STORIES = 2500;
const CHECKPOINT_EVERY = 5;
const MODEL = 'claude-sonnet-4-6';

// ─── ARGS PARSING ──────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const TARGET_TOMO = args.tomo || 'all';
const FROM_STORY = parseInt(args.from || '1', 10);
const DRY_RUN = args['dry-run'] === true;

// ─── CLIENTS ───────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── LOAD THEMES ───────────────────────────────────────────────────────────
const THEMES = JSON.parse(readFileSync(resolve(__dirname, '../data/story_themes.json'), 'utf-8'));

// ─── PROGRESS TRACKING ─────────────────────────────────────────────────────
const PROGRESS_FILE = resolve(__dirname, '../data/progress.json');

function loadProgress() {
  if (existsSync(PROGRESS_FILE)) return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
  return { completed: [], errors: [], lastUpdated: null };
}

function saveProgress(progress) {
  progress.lastUpdated = new Date().toISOString();
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function isCompleted(progress, tomo, num) {
  return progress.completed.some(c => c.tomo === tomo && c.num === num);
}

// ─── PROMPT BUILDING ───────────────────────────────────────────────────────
function buildPrompt(tomo, storyDef, tomoInfo) {
  const isAdvanced = tomoInfo.grupo === 'avanzado';
  const wordRange = isAdvanced ? '600-900 palabras' : '400-600 palabras';

  return `Eres CUBALIVE, autora de la serie infantil terapéutica "La Tortuga Sabia".
Tu personaje principal es Quelina, una pequeña tortuga sabia, curiosa y valiente que vive en el Valle Esmeralda.
Sus amigos: Lumo (luciérnaga), Pino (puercoespín), Mara (mariposa), Río (pez).
El caparazón de Quelina tiene espirales doradas que brillan cuando aprende algo nuevo.
El Gran Roble Sabio está en el centro del Valle.

TOMO ${tomo} — "${tomoInfo.titulo}"
Temática: ${tomoInfo.tematica_principal}
Edades: ${tomoInfo.edades}

CUENTO #${storyDef.num}:
- Título: "${storyDef.titulo}"
- Temática terapéutica: ${storyDef.tematica}
- Edad sugerida: ${storyDef.edad} años

INSTRUCCIONES:
1. Extensión: ${wordRange}
2. Español neutro latinoamericano, sin regionalismos ni errores gramaticales
3. Tono cálido y esperanzador, nunca aterrador ni oscuro
4. La enseñanza surge naturalmente de la historia, no como sermón
5. Incluir al menos un amigo de Quelina (Lumo, Pino, Mara o Río)
6. El caparazón dorado puede brillar en momentos de aprendizaje
7. Lenguaje apropiado para la edad indicada
8. NO mencionar dispositivos tecnológicos (excepto tomo 7 donde es temático)
9. Revisar ortografía y gramática al 100% antes de responder

Responde ÚNICAMENTE con este JSON puro (sin markdown, sin texto adicional):
{
  "titulo": "${storyDef.titulo}",
  "tomo": ${tomo},
  "numero_en_tomo": ${storyDef.num},
  "edad_sugerida": "${storyDef.edad} años",
  "tematica_terapeutica": "${storyDef.tematica}",
  "resumen": "Dos oraciones que describan el cuento sin revelar el final.",
  "cuento_completo": "El texto completo del cuento, párrafos separados por doble salto de línea.",
  "moraleja": "Una sola oración poderosa y memorable.",
  "actividad_sugerida": "Actividad de máximo 3 pasos para padres e hijos, sin materiales especiales.",
  "palabras_count": 450,
  "revisado_gramaticalmente": true,
  "tiene_imagen": false,
  "tiene_audio": false,
  "estado": "publicado"
}`;
}

// ─── GRAMMAR CORRECTION ────────────────────────────────────────────────────
async function correctGrammar(story) {
  const prompt = `Corrector experto de español neutro latinoamericano para literatura infantil.
Corrige ortografía, puntuación, concordancia y fluidez sin cambiar el mensaje ni los personajes.
Edad objetivo: ${story.edad_sugerida}

Cuento: ${story.cuento_completo}
Moraleja: ${story.moraleja}

Responde ÚNICAMENTE con JSON puro (sin markdown):
{"cuento_completo":"texto corregido","moraleja":"moraleja corregida","revisado_gramaticalmente":true}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const text = response.content[0].text.trim()
      .replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return { ...story, ...JSON.parse(text) };
  } catch {
    console.warn(`  ⚠️  No se pudo corregir gramáticamente "${story.titulo}"`);
    return story;
  }
}

// ─── STORY GENERATION ──────────────────────────────────────────────────────
async function generateStory(tomo, storyDef, tomoInfo) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: buildPrompt(tomo, storyDef, tomoInfo) }],
  });

  const cleaned = response.content[0].text.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  const story = JSON.parse(cleaned);
  story.tiene_imagen = false;
  story.tiene_audio = false;
  story.imagen_url = null;
  story.audio_url = null;
  story.grupo_edad = tomoInfo.grupo;
  story.palabras_count = story.cuento_completo.split(/\s+/).length;
  return story;
}

// ─── SAVE TO SUPABASE ──────────────────────────────────────────────────────
async function saveToSupabase(story) {
  const { data, error } = await supabase
    .from('stories')
    .upsert(story, { onConflict: 'tomo,numero_en_tomo' })
    .select()
    .single();

  if (error) throw new Error(`Supabase: ${error.message}`);

  await supabase
    .from('generacion_progreso')
    .upsert({
      tomo: story.tomo,
      numero_en_tomo: story.numero_en_tomo,
      estado: 'completado',
      completado_en: new Date().toISOString(),
    }, { onConflict: 'tomo,numero_en_tomo' });

  return data;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🐢 LA TORTUGA SABIA — Generador de Cuentos v2.0');
  console.log('━'.repeat(50));
  console.log(`📚 Modo: ${TARGET_TOMO === 'all' ? 'Todos los tomos' : `Tomo ${TARGET_TOMO}`}`);
  console.log(`🖼️  Imágenes: NO (desactivado)`);
  console.log(`🔊 Audio: NO (desactivado)`);
  console.log(`🧪 Dry Run: ${DRY_RUN ? 'SÍ — no se guardará nada' : 'NO'}`);
  console.log('━'.repeat(50) + '\n');

  if (!SUPABASE_SERVICE_KEY) throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada en .env');
  if (!ANTHROPIC_API_KEY) throw new Error('❌ ANTHROPIC_API_KEY no configurada en .env');

  const progress = loadProgress();
  let totalGenerated = 0;
  let totalErrors = 0;

  const tomoNumbers = TARGET_TOMO === 'all'
    ? [1, 2, 3, 4, 5, 6, 7]
    : [parseInt(TARGET_TOMO, 10)];

  for (const tomoNum of tomoNumbers) {
    const tomoInfo = THEMES.tomos[String(tomoNum)];

    if (!tomoInfo) {
      console.warn(`⚠️  Tomo ${tomoNum} no encontrado en story_themes.json`);
      continue;
    }

    const totalStories = tomoInfo.cuentos.length;
    console.log(`\n📖 TOMO ${tomoNum}: "${tomoInfo.titulo}"`);
    console.log(`   ${totalStories} cuentos | Edad: ${tomoInfo.edades}`);
    console.log('─'.repeat(50));

    for (const storyDef of tomoInfo.cuentos) {
      if (storyDef.num < FROM_STORY) continue;

      if (isCompleted(progress, tomoNum, storyDef.num)) {
        console.log(`   ✅ [${storyDef.num}/${totalStories}] ${storyDef.titulo} (ya completado)`);
        continue;
      }

      if (DRY_RUN) {
        console.log(`   📋 [${storyDef.num}/${totalStories}] ${storyDef.titulo} [${storyDef.tematica}]`);
        continue;
      }

      process.stdout.write(`   ⏳ [${storyDef.num}/${totalStories}] ${storyDef.titulo}...`);

      try {
        let story = await generateStory(tomoNum, storyDef, tomoInfo);
        story = await correctGrammar(story);
        await saveToSupabase(story);

        progress.completed.push({ tomo: tomoNum, num: storyDef.num, titulo: storyDef.titulo });
        totalGenerated++;

        console.log(` ✅ (${story.palabras_count} palabras)`);

        if (totalGenerated % CHECKPOINT_EVERY === 0) {
          saveProgress(progress);
          console.log(`   💾 Checkpoint guardado (${totalGenerated} cuentos generados)`);
        }

        await sleep(DELAY_BETWEEN_STORIES);
      } catch (error) {
        console.log(` ❌ ERROR: ${error.message}`);
        progress.errors.push({
          tomo: tomoNum,
          num: storyDef.num,
          titulo: storyDef.titulo,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        totalErrors++;

        await supabase
          .from('generacion_progreso')
          .upsert({
            tomo: tomoNum,
            numero_en_tomo: storyDef.num,
            estado: 'error',
            intentos: 1,
            error_mensaje: error.message,
          }, { onConflict: 'tomo,numero_en_tomo' });

        await sleep(DELAY_BETWEEN_STORIES * 2);
      }
    }

    console.log(`\n   ✅ Tomo ${tomoNum} completado`);
  }

  saveProgress(progress);

  console.log('\n' + '━'.repeat(50));
  console.log('📊 RESUMEN FINAL');
  console.log(`   ✅ Cuentos generados: ${totalGenerated}`);
  console.log(`   ❌ Errores: ${totalErrors}`);
  console.log(`   💾 Progreso guardado en: data/progress.json`);

  if (totalErrors > 0) {
    console.log('\n⚠️  Cuentos con errores:');
    progress.errors.forEach(e => {
      console.log(`   - Tomo ${e.tomo}, #${e.num}: "${e.titulo}" — ${e.error}`);
    });
    console.log('\n💡 Tip: Ejecuta el script de nuevo para reintentar los errores automáticamente.');
  }

  console.log('\n🐢 ¡Gracias por dar vida a Quelina!\n');
}

main().catch(console.error);
