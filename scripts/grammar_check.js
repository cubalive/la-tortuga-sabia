#!/usr/bin/env node
/**
 * CORRECCIÓN GRAMATICAL DE TODOS LOS CUENTOS
 *
 * Uso:
 *   node scripts/grammar_check.js              # Todos los pendientes
 *   node scripts/grammar_check.js --tomo=3     # Solo el tomo 3
 *   node scripts/grammar_check.js --force      # Rerevisar todos
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebkwgrvqavutbfxkwore.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const TARGET_TOMO = args.tomo ? parseInt(args.tomo, 10) : null;
const FORCE = args.force === true;

function buildGrammarPrompt(story) {
  return `Eres un corrector de textos experto en español neutro latinoamericano, especializado en literatura infantil terapéutica.

INSTRUCCIONES ESTRICTAS:
1. Corrige TODOS los errores ortográficos (tildes, uso de b/v, h, ll/y, etc.)
2. Corrige la puntuación (comas, puntos, signos de apertura ¿¡, comillas «»)
3. Corrige concordancia de género y número
4. Mejora la fluidez narrativa sin cambiar el mensaje terapéutico
5. Asegura consistencia en el tiempo verbal (no mezclar pasado y presente)
6. Verifica que las palabras sean apropiadas para niños de ${story.edad_sugerida}
7. Mantén el tono cálido y esperanzador
8. NO cambies los nombres de personajes ni el escenario
9. NO cambies el significado ni la moraleja

CUENTO A CORREGIR:
Título: ${story.titulo}
Edad: ${story.edad_sugerida}
Temática: ${story.tematica_terapeutica}

CUENTO:
${story.cuento_completo}

MORALEJA:
${story.moraleja}

ACTIVIDAD:
${story.actividad_sugerida || ''}

Responde ÚNICAMENTE con este JSON sin markdown:
{
  "cuento_completo": "texto completamente corregido",
  "moraleja": "moraleja corregida",
  "actividad_sugerida": "actividad corregida",
  "correcciones_realizadas": ["lista breve de tipos de correcciones hechas"],
  "revisado_gramaticalmente": true
}`;
}

async function correctStory(story) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: buildGrammarPrompt(story) }],
  });

  const text = response.content[0].text.trim()
    .replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

  return JSON.parse(text);
}

async function main() {
  console.log('\n🐢 LA TORTUGA SABIA — Corrector Gramatical');
  console.log('━'.repeat(45));

  if (!SUPABASE_SERVICE_KEY) throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada');
  if (!ANTHROPIC_API_KEY) throw new Error('❌ ANTHROPIC_API_KEY no configurada');

  let query = supabase
    .from('stories')
    .select('*')
    .order('tomo', { ascending: true })
    .order('numero_en_tomo', { ascending: true });

  if (TARGET_TOMO) {
    query = query.eq('tomo', TARGET_TOMO);
    console.log(`   Tomo: ${TARGET_TOMO}`);
  }

  if (!FORCE) {
    query = query.eq('revisado_gramaticalmente', false);
  } else {
    console.log('   Modo: Forzado (revisará todos)');
  }

  const { data: stories, error } = await query;
  if (error) throw error;

  if (!stories?.length) {
    console.log('✅ No hay cuentos pendientes de revisión gramatical.');
    return;
  }

  console.log(`📝 Cuentos a revisar: ${stories.length}\n`);

  let corrected = 0;
  let errors = 0;

  for (const story of stories) {
    process.stdout.write(`   [T${story.tomo}/#${story.numero_en_tomo}] "${story.titulo}"...`);

    try {
      const corrections = await correctStory(story);

      await supabase
        .from('stories')
        .update({
          cuento_completo: corrections.cuento_completo,
          moraleja: corrections.moraleja,
          actividad_sugerida: corrections.actividad_sugerida,
          revisado_gramaticalmente: true,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', story.id);

      const numCorrections = corrections.correcciones_realizadas?.length || 0;
      console.log(` ✅ (${numCorrections} tipos de correcciones)`);
      corrected++;

      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.log(` ❌ ${err.message}`);
      errors++;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log('\n' + '━'.repeat(45));
  console.log(`✅ Corregidos: ${corrected}`);
  console.log(`❌ Errores: ${errors}\n`);
}

main().catch(console.error);
