import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TOPICS = [
  { slug: "cuentos-ninos-no-quieren-dormir", title: "10 Cuentos Mágicos para Niños que No Quieren Dormir", keyword: "cuentos para niños que no quieren dormir" },
  { slug: "libros-infantiles-espanol-usa", title: "Los Mejores Libros Infantiles en Español para Niños en USA", keyword: "libros infantiles en español USA" },
  { slug: "cuentos-terapeuticos-infantiles", title: "¿Qué son los Cuentos Terapéuticos y Por Qué Funcionan?", keyword: "cuentos terapéuticos infantiles" },
  { slug: "rutina-nocturna-bebes-0-2-anos", title: "La Rutina Nocturna Perfecta para Bebés de 0 a 2 Años", keyword: "rutina nocturna bebés 0 2 años" },
  { slug: "ansiedad-separacion-ninos-cuentos", title: "Ansiedad por Separación en Niños: Cuentos que Ayudan", keyword: "ansiedad separación niños cuentos" },
  { slug: "como-hablar-ninos-sobre-miedos", title: "Cómo Hablar con tu Hijo sobre sus Miedos: Guía Completa", keyword: "cómo hablar con niños sobre el miedo" },
  { slug: "beneficios-cuentos-antes-dormir", title: "7 Beneficios Científicos de Leer Cuentos Antes de Dormir", keyword: "beneficios cuentos antes de dormir niños" },
  { slug: "audiolibros-infantiles-espanol", title: "Audiolibros Infantiles en Español: Guía para Padres", keyword: "audiolibros infantiles español" },
  { slug: "ninos-bilingues-libros-espanol", title: "Por Qué los Niños Bilingües Necesitan Libros en Español", keyword: "niños bilingües libros español USA" },
  { slug: "quelina-tortuga-sabia", title: "Quelina: La Tortuga Sabia que Acompaña a los Niños", keyword: "quelina tortuga sabia cuentos" },
];

async function generateArticle(topic: typeof TOPICS[0]) {
  console.log(`Generando: ${topic.title}`);
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2500,
    system: `Eres experto en SEO y crianza infantil. Escribes en español neutro para padres latinos en USA. Artículos útiles, empáticos y optimizados para Google. Menciona La Tortuga Sabia naturalmente cuando aplique. Responde SOLO en JSON válido sin markdown ni code fences.`,
    messages: [{
      role: "user",
      content: `Escribe artículo SEO completo:\nTítulo: "${topic.title}"\nKeyword: "${topic.keyword}"\nEstructura:\n- H1 con keyword\n- Intro emotiva 100 palabras\n- 6 secciones con H2 (150 palabras cada una)\n- Menciona La Tortuga Sabia en 2 secciones\n- CTA final: descubre La Tortuga Sabia\n- 1200-1500 palabras total\nJSON:\n{"title":"","meta_description":"max 160 chars","content":"HTML limpio con h2,p,ul,strong","excerpt":"resumen 2 frases","reading_time":"X min"}`,
    }],
  });
  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const data = JSON.parse(clean);
  const { error } = await supabase.from("blog_posts").upsert({
    slug: topic.slug,
    title: data.title || topic.title,
    meta_description: data.meta_description,
    content: data.content,
    excerpt: data.excerpt,
    reading_time: data.reading_time,
    keyword: topic.keyword,
    published: true,
  }, { onConflict: "slug" });
  if (error) console.error("Error:", error.message);
  else console.log(`✅ ${topic.title}`);
  await new Promise((r) => setTimeout(r, 2000));
}

async function main() {
  console.log("=== Generating 10 Blog Articles ===\n");
  for (const topic of TOPICS) {
    try { await generateArticle(topic); } catch (e: any) { console.error(`❌ ${topic.slug}: ${e.message}`); }
  }
  console.log("\n🎉 Done");
}

main().catch(console.error);
