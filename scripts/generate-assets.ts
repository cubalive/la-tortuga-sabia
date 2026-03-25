import OpenAI from "openai";
import https from "https";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 300_000,
});

function downloadImage(url: string, filepath: string): Promise<void> {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", reject);
  });
}

async function generateAll() {
  console.log("=== DALL-E 3 Asset Generation ===\n");

  console.log("Generando logo de Quelina...");
  const logo = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Quelina the wise turtle, chibi kawaii style logo.
    Extremely cute, big expressive golden eyes with sparkles.
    Round shell with glowing golden constellation patterns.
    Soft jade green body #2D6A4F, golden accents #C9882A.
    Magical glow around her, dark background.
    Studio Ghibli meets luxury brand aesthetic.
    Perfect circular composition, no text.
    Ultra detailed, premium quality icon.`,
    size: "1024x1024",
    quality: "hd",
    style: "vivid",
  });
  await downloadImage(logo.data![0].url!, "public/images/quelina-logo.png");
  console.log("✅ Logo generado");

  console.log("Generando hero background...");
  const hero = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Magical cosmic forest at night, children book illustration.
    Ancient wise turtle floating in starry universe center.
    Deep dark space background with jade green and purple nebulae.
    Golden constellation particles and glowing stars everywhere.
    Four small magical planets orbiting the turtle.
    Studio Ghibli art style ultra detailed.
    Watercolor meets digital art, warm inviting atmosphere.
    Cinematic wide composition, 16:9 format.`,
    size: "1792x1024",
    quality: "hd",
    style: "vivid",
  });
  await downloadImage(hero.data![0].url!, "public/images/hero-bg.jpg");
  console.log("✅ Hero generado");

  const tomoPrompts = [
    `Magical enchanted forest at night, children book art.
    Fireflies creating golden light paths between ancient trees.
    Cute wise turtle on mossy rock watching tiny forest animals sleep.
    Deep greens and golds, Studio Ghibli style.
    Soft moonlight, magical peaceful atmosphere, dreamlike quality.`,

    `Colorful magical forest clearing at golden hour.
    Bunny, fox, owl, bear cub gathered in circle listening to story.
    Ancient wise turtle telling tales in center, glowing softly.
    Vibrant autumn colors, warm light, joyful atmosphere.
    Studio Ghibli style children book illustration, full of life.`,

    `Crystal magical river through glowing forest at night.
    Schools of luminous fish swimming in starlit water.
    Ancient wise turtle on mossy bank under aurora sky.
    Blues, teals, silvers with golden reflections in water.
    Studio Ghibli style, mysterious beautiful children illustration.`,

    `Majestic mountain peak with spectacular aurora borealis.
    Ancient wise turtle near summit looking at infinite stars.
    Purple green gold aurora filling entire sky magnificently.
    Snowy peaks, tiny forest below, epic scale magical atmosphere.
    Studio Ghibli style, awe-inspiring children book illustration.`,
  ];

  for (let i = 0; i < 4; i++) {
    console.log(`Generando Tomo ${i + 1}...`);
    const tomo = await openai.images.generate({
      model: "dall-e-3",
      prompt: tomoPrompts[i],
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    });
    await downloadImage(tomo.data![0].url!, `public/images/tomo-${i + 1}.jpg`);
    console.log(`✅ Tomo ${i + 1} generado`);
    // Rate limit pause
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n🎉 TODAS LAS IMÁGENES GENERADAS");
  console.log("Archivos en public/images/");
}

generateAll().catch(console.error);
