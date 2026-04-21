import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import fs from "fs";
import https from "https";
import path from "path";
import { SYSTEM_PROMPT, TOMOS, type StoryData } from "../lib/story-generator";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 300_000 });
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

async function generateBatch(tomo: typeof TOMOS[0], start: number, count: number, retries = 2): Promise<StoryData[]> {
  const prompt = `Genera ${count} cuentos para el Tomo ${tomo.num} "${tomo.title}" (${tomo.age}).
Tema general del tomo: ${tomo.theme}
Cuentos del #${start} al #${start + count - 1}.

REGLAS:
- Cada cuento tiene un ANIMAL DIFERENTE con nombre propio
- Cada cuento aborda una SITUACIÓN REAL DIFERENTE del niño
- Quelina aparece en cada cuento siguiendo la estructura obligatoria
- Cada cuento tiene ${tomo.words} palabras COMPLETAS (no resúmenes)
- Los cuentos son OBRAS LITERARIAS, no esqueletos ni sinopsis

Responde SOLO un array JSON válido. Sin markdown, sin code fences, solo el JSON.
[{
  "numero": ${start},
  "titulo": "",
  "personaje": "Animal + nombre propio",
  "situacion": "situación real del niño",
  "historia": "CUENTO COMPLETO con toda la estructura obligatoria",
  "quelina_momento": "fragmento de la intervención de Quelina",
  "moraleja": "lección implícita (referencia interna)",
  "il_portada": "DALL-E prompt in English, Studio Ghibli watercolor style",
  "il_problema": "DALL-E prompt in English",
  "il_quelina": "DALL-E prompt in English",
  "il_resolucion": "DALL-E prompt in English",
  "il_vineta": "DALL-E prompt in English",
  "suno_prompt": "Suno music prompt in English (max 200 chars)",
  "suno_lyrics": "Letra canción español, 3 estrofas + coro"
}]`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content[0].type === "text" ? msg.content[0].text : "";
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(clean) as StoryData[];
    } catch (e: any) {
      console.error(`    Attempt ${attempt + 1} failed: ${e.message?.substring(0, 100)}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 5000));
    }
  }
  return [];
}

async function generateCover(prompt: string, filepath: string, retries = 2): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt + " Watercolor children book illustration, Studio Ghibli style, warm colors, no text, cute magical, soft color wash background in deep forest greens and midnight blues, NO white background, atmospheric depth, painted paper texture.",
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      });
      await downloadImage(resp.data![0].url!, filepath);
      return true;
    } catch (e: any) {
      console.error(`    Image attempt ${attempt + 1} failed: ${e.message?.substring(0, 80)}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 5000));
    }
  }
  return false;
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  LA TORTUGA SABIA — Full Generation");
  console.log("  Literary-quality stories + DALL-E 3");
  console.log("  Using new SYSTEM_PROMPT from lib/");
  console.log("═══════════════════════════════════════\n");

  let totalStories = 0;
  let totalImages = 0;

  for (const tomo of TOMOS) {
    console.log(`\n══ TOMO ${tomo.num}: ${tomo.title} (${tomo.age}) ══`);

    const allStories: StoryData[] = [];

    // Generate stories in batches of 5 (smaller for higher quality)
    for (let batch = 0; batch < 10; batch++) {
      const start = batch * 5 + 1;
      process.stdout.write(`  Batch ${batch + 1}/10 (stories ${start}-${start + 4})... `);
      const stories = await generateBatch(tomo, start, 5);
      console.log(`${stories.length} stories`);
      allStories.push(...stories);
      await new Promise(r => setTimeout(r, 1000));
    }

    // Save stories
    const dir = `public/stories/tomo-${tomo.num}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/all-stories.json`, JSON.stringify(allStories, null, 2));
    console.log(`  📖 ${allStories.length} stories saved`);
    totalStories += allStories.length;

    // Generate covers
    console.log(`  🎨 Generating ${allStories.length} cover images...`);
    const imgDir = `public/images/stories/tomo-${tomo.num}`;
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

    for (const story of allStories) {
      const num = story.numero;
      const filepath = `${imgDir}/story-${num}.jpg`;
      if (story.il_portada) {
        const ok = await generateCover(story.il_portada, filepath);
        if (ok) {
          totalImages++;
          console.log(`  ✅ T${tomo.num}S${num}: ${story.titulo}`);
        } else {
          console.log(`  ❌ T${tomo.num}S${num}: ${story.titulo} (image failed)`);
        }
        await new Promise(r => setTimeout(r, 2500));
      }
    }

    // Add image paths and re-save
    for (const story of allStories) {
      (story as any).cover_image = `/images/stories/tomo-${tomo.num}/story-${story.numero}.jpg`;
    }
    fs.writeFileSync(`${dir}/all-stories.json`, JSON.stringify(allStories, null, 2));
  }

  console.log("\n═══════════════════════════════════════");
  console.log("  GENERATION COMPLETE!");
  console.log(`  Stories: ${totalStories}`);
  console.log(`  Images: ${totalImages}`);
  console.log(`  Est. cost: ~$${(totalStories * 0.03 + totalImages * 0.08).toFixed(2)}`);
  console.log("═══════════════════════════════════════\n");

  for (const tomo of TOMOS) {
    const file = `public/stories/tomo-${tomo.num}/all-stories.json`;
    if (fs.existsSync(file)) {
      const stories = JSON.parse(fs.readFileSync(file, "utf-8"));
      console.log(`\nTomo ${tomo.num} — ${tomo.title}:`);
      stories.forEach((s: any) => console.log(`  #${s.numero}: ${s.titulo} (${s.personaje})`));
    }
  }
}

main().catch(console.error);
