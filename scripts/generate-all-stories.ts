import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import fs from "fs";
import https from "https";
import path from "path";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 300_000 });

function downloadImage(url: string, filepath: string): Promise<void> {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

const TOMOS = [
  {
    num: 1,
    title: "El Bosque Encantado",
    age: "0-2 años",
    theme: "Rutinas básicas y emociones simples para bebés. Hora de dormir, comer, bañarse, compartir, primeros miedos.",
    style: "Muy corto y repetitivo, onomatopeyas, frases rítmicas."
  },
  {
    num: 2,
    title: "Los Amigos del Camino",
    age: "2-4 años",
    theme: "Amistad, compartir, emociones, familia, animales amigos. Primeras aventuras sociales.",
    style: "Diálogos simples, repetición con variación, canciones cortas integradas."
  },
  {
    num: 3,
    title: "El Río de los Sueños",
    age: "4-6 años",
    theme: "Aventuras, descubrimiento, naturaleza, creatividad, resolver problemas pequeños.",
    style: "Narrativa más elaborada, pequeños misterios, personajes con personalidad."
  },
  {
    num: 4,
    title: "La Montaña de la Sabiduría",
    age: "5-8 años",
    theme: "Valores profundos, diversidad, medio ambiente, autoestima, resiliencia, trabajo en equipo.",
    style: "Historias más largas con arcos narrativos, moralejas elaboradas, vocabulario más rico."
  }
];

async function generateStoryBatch(tomo: typeof TOMOS[0], batchNum: number, startNum: number, count: number): Promise<any[]> {
  const prompt = `Genera ${count} cuentos para el Tomo ${tomo.num} "${tomo.title}" (${tomo.age}).
Tema general: ${tomo.theme}
Estilo: ${tomo.style}
Cuentos del #${startNum} al #${startNum + count - 1}.

Cada cuento tiene un animal diferente con nombre propio.
Quelina (tortuga sabia) aparece en cada cuento con su frase: "Detente un momento... y escucha lo que el viento tiene que decirle a tu corazón."

IMPORTANTE: Responde SOLO JSON válido, un array de objetos. Sin markdown.
[
  {
    "numero": ${startNum},
    "titulo": "título del cuento",
    "personaje": "Animal + nombre",
    "situacion": "qué situación real del niño aborda",
    "historia": "el cuento completo (${tomo.num <= 2 ? '200-400' : '400-600'} palabras)",
    "quelina_momento": "momento donde Quelina interviene",
    "moraleja": "lección del cuento",
    "il_portada": "prompt en inglés para DALL-E de la portada del cuento, Studio Ghibli watercolor style"
  }
]
Genera exactamente ${count} cuentos diferentes, cada uno con animal y situación únicos.`;

  console.log(`  Generando batch ${batchNum} (cuentos #${startNum}-${startNum+count-1})...`);
  
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: `Eres el autor de "La Tortuga Sabia". Quelina es una tortuga anciana y sabia con constelaciones doradas en su caparazón. Escribe en español neutro, tono cálido y poético. Responde SOLO en JSON válido sin markdown ni code fences.`,
    messages: [{ role: "user", content: prompt }]
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  // Clean potential markdown fences
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    const stories = JSON.parse(clean);
    console.log(`  ✅ ${stories.length} cuentos generados`);
    return stories;
  } catch (e) {
    console.error(`  ❌ Error parsing batch ${batchNum}:`, (e as Error).message);
    console.error(`  First 200 chars:`, clean.substring(0, 200));
    return [];
  }
}

async function generateCoverImage(story: any, tomoNum: number, storyNum: number): Promise<string | null> {
  try {
    const resp = await openai.images.generate({
      model: "dall-e-3",
      prompt: story.il_portada + " Watercolor children book illustration, Studio Ghibli style, warm colors, no text, cute and magical.",
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    });
    const url = resp.data![0].url!;
    const filepath = `public/images/stories/tomo-${tomoNum}/story-${storyNum}.jpg`;
    await downloadImage(url, filepath);
    return filepath;
  } catch (e) {
    console.error(`  ❌ Image error story ${storyNum}:`, (e as Error).message);
    return null;
  }
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  LA TORTUGA SABIA — Full Generation");
  console.log("  200 stories + 200 illustrations");
  console.log("═══════════════════════════════════════\n");

  const allResults: Record<number, any[]> = {};
  let totalStories = 0;
  let totalImages = 0;

  for (const tomo of TOMOS) {
    console.log(`\n══ TOMO ${tomo.num}: ${tomo.title} (${tomo.age}) ══`);
    
    const stories: any[] = [];
    // Generate in batches of 10
    for (let batch = 0; batch < 5; batch++) {
      const startNum = batch * 10 + 1;
      const batchStories = await generateStoryBatch(tomo, batch + 1, startNum, 10);
      stories.push(...batchStories);
      // Small pause between Claude calls
      await new Promise(r => setTimeout(r, 1000));
    }

    // Save all stories JSON
    const storyPath = `public/stories/tomo-${tomo.num}/all-stories.json`;
    fs.writeFileSync(storyPath, JSON.stringify(stories, null, 2));
    console.log(`\n  📖 ${stories.length} cuentos guardados en ${storyPath}`);
    totalStories += stories.length;

    // Generate cover images
    console.log(`\n  🎨 Generando ${stories.length} portadas...`);
    for (const story of stories) {
      const num = story.numero;
      const imgPath = await generateCoverImage(story, tomo.num, num);
      if (imgPath) {
        story.cover_image = `/${imgPath.replace('public/', '')}`;
        totalImages++;
        console.log(`  ✅ Tomo ${tomo.num} Story ${num}: ${story.titulo}`);
      }
      // Rate limit: 2s between DALL-E calls
      await new Promise(r => setTimeout(r, 2000));
    }

    // Re-save with image paths
    fs.writeFileSync(storyPath, JSON.stringify(stories, null, 2));
    allResults[tomo.num] = stories;
  }

  // Summary
  console.log("\n═══════════════════════════════════════");
  console.log("  GENERATION COMPLETE");
  console.log(`  Stories: ${totalStories}`);
  console.log(`  Images: ${totalImages}`);
  console.log(`  Est. cost: ~$${(totalStories * 0.02 + totalImages * 0.08).toFixed(2)}`);
  console.log("═══════════════════════════════════════");

  // Print story titles
  for (const tomo of TOMOS) {
    console.log(`\nTomo ${tomo.num} — ${tomo.title}:`);
    (allResults[tomo.num] || []).forEach((s: any) => {
      console.log(`  #${s.numero}: ${s.titulo} (${s.personaje})`);
    });
  }
}

main().catch(console.error);
