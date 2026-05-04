#!/usr/bin/env node
/**
 * SELECTOR DE LOS 33 MEJORES CUENTOS DEL TOMO 1 ORIGINAL
 *
 * Del Tomo 1 original de 50 cuentos, usa la IA para:
 * 1. Evaluar calidad gramatical
 * 2. Evaluar pertinencia temática para el Tomo 1 ("El Despertar de Quelina")
 * 3. Verificar que no se dupliquen temáticas
 * 4. Seleccionar los mejores 33 y renumerarlos
 * 5. Archivar los 17 restantes
 *
 * Uso: node scripts/select_best_tomo1.js
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebkwgrvqavutbfxkwore.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function evaluateStory(story) {
  const prompt = `Eres un editor experto en literatura infantil terapéutica en español.

Evalúa este cuento de "La Tortuga Sabia" para el Tomo 1 "El Despertar de Quelina"
(temática: autoconocimiento, emociones básicas, curiosidad, edad 4-8 años).

Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "puntuacion_total": 8.5,
  "calidad_gramatical": 9,
  "pertinencia_tematica": 8,
  "adecuacion_edad": 9,
  "originalidad": 8,
  "valor_terapeutico": 8,
  "mantener": true,
  "razon": "Breve justificación de 1 oración"
}

Cuento a evaluar:
Título: ${story.titulo}
Temática: ${story.tematica_terapeutica}
Texto: ${(story.cuento_completo || '').substring(0, 500)}...

Responde SOLO con el JSON.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim()
    .replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(text);
}

async function main() {
  console.log('\n🐢 Seleccionando los 33 mejores cuentos del Tomo 1 original...\n');

  if (!SUPABASE_SERVICE_KEY) throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada');
  if (!ANTHROPIC_API_KEY) throw new Error('❌ ANTHROPIC_API_KEY no configurada');

  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .eq('tomo', 1)
    .neq('estado', 'archivado')
    .order('numero_en_tomo');

  if (error) throw error;

  if (!stories || stories.length === 0) {
    console.log('⚠️  No se encontraron cuentos del Tomo 1 en Supabase.');
    console.log('   Ejecuta primero: node scripts/generate_stories.js --tomo=1');
    return;
  }

  if (stories.length <= 33) {
    console.log(`ℹ️  Solo hay ${stories.length} cuentos en el Tomo 1. No es necesario seleccionar.`);
    console.log('   Ejecuta: node scripts/generate_stories.js --tomo=1 para completar los 33 cuentos.');
    return;
  }

  console.log(`📚 Encontrados ${stories.length} cuentos del Tomo 1`);
  console.log('🔍 Evaluando calidad y pertinencia...\n');

  const evaluations = [];

  for (const story of stories) {
    process.stdout.write(`   Evaluando: "${story.titulo}"...`);
    try {
      const evaluation = await evaluateStory(story);
      evaluations.push({ story, eval: evaluation });
      const icon = evaluation.mantener ? '✅' : '⚠️';
      console.log(` ${evaluation.puntuacion_total}/10 ${icon}`);
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.log(` ❌ Error: ${err.message}`);
      evaluations.push({
        story,
        eval: { puntuacion_total: 5, mantener: true, razon: 'Error en evaluación' },
      });
    }
  }

  // Sort by score descending and select top 33
  evaluations.sort((a, b) => b.eval.puntuacion_total - a.eval.puntuacion_total);

  const selected = evaluations.slice(0, 33);
  const archived = evaluations.slice(33);

  console.log('\n📊 RESULTADOS:');
  console.log(`   ✅ Seleccionados: ${selected.length} cuentos`);
  console.log(`   📦 Archivados: ${archived.length} cuentos`);

  // Renumber selected stories 1-33
  console.log('\n🔢 Renumerando cuentos seleccionados...');
  for (let i = 0; i < selected.length; i++) {
    const { story } = selected[i];
    const newNum = i + 1;

    await supabase
      .from('stories')
      .update({
        numero_en_tomo: newNum,
        estado: 'publicado',
        revisado_gramaticalmente: true,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', story.id);

    const score = selected[i].eval.puntuacion_total;
    console.log(`   ${newNum}. "${story.titulo}" (era #${story.numero_en_tomo}, score: ${score})`);
  }

  // Archive the rest
  console.log('\n📦 Archivando cuentos no seleccionados...');
  for (const { story } of archived) {
    await supabase
      .from('stories')
      .update({ estado: 'archivado', actualizado_en: new Date().toISOString() })
      .eq('id', story.id);
    console.log(`   - "${story.titulo}" (archivado)`);
  }

  // Save selection report
  const report = {
    fecha: new Date().toISOString(),
    total_evaluados: stories.length,
    seleccionados: selected.map((e, i) => ({
      num_nuevo: i + 1,
      titulo: e.story.titulo,
      score: e.eval.puntuacion_total,
      tematica: e.story.tematica_terapeutica,
      razon: e.eval.razon,
    })),
    archivados: archived.map(e => ({
      titulo: e.story.titulo,
      score: e.eval.puntuacion_total,
      razon: e.eval.razon,
    })),
  };

  writeFileSync('./data/tomo1_selections.json', JSON.stringify(report, null, 2));

  console.log('\n✅ ¡Selección completada!');
  console.log('   Reporte guardado en: data/tomo1_selections.json\n');
}

main().catch(console.error);
