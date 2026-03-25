import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateQuelinaLogo() {
  console.log("Generating Quelina logo...");
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Quelina, an ancient wise turtle character logo.
    Chibi style, extremely cute and magical.
    Shell has golden constellation patterns glowing.
    Big expressive wise eyes with golden sparkles.
    Soft jade green color #2D6A4F.
    Golden accents #C9882A on shell patterns.
    Circular composition perfect for app icon.
    Dark background #050d12.
    Studio Ghibli meets luxury brand aesthetic.
    High detail, magical, premium quality.
    No text. Perfect symmetry.`,
    size: "1024x1024",
    quality: "hd",
    style: "vivid",
  });

  const imageUrl = response.data![0].url!;
  console.log("Logo URL:", imageUrl);
  return imageUrl;
}

async function generateHeroBackground() {
  console.log("Generating hero background...");
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Magical cosmic forest at night, children's book illustration.
    Ancient wise turtle floating in center surrounded by glowing stars.
    Deep dark background #050d12 with nebulae in jade green and purple.
    Golden particles and constellation patterns.
    Four small magical planets orbiting the turtle.
    Studio Ghibli art style, extremely detailed.
    Watercolor meets digital art, warm and inviting.
    Perfect for children's book cover.
    Ultra high quality, cinematic composition.`,
    size: "1792x1024",
    quality: "hd",
    style: "vivid",
  });

  const imageUrl = response.data![0].url!;
  console.log("Hero URL:", imageUrl);
  return imageUrl;
}

async function generateTomoCovers() {
  const tomos = [
    {
      num: 1,
      prompt: `Magical enchanted forest at night, children's book illustration.
      Fireflies creating golden light paths between ancient trees.
      A cute wise turtle watching from mossy rock.
      Deep greens and golds, Studio Ghibli style.
      Magical, peaceful, inviting for young children.
      Ultra detailed watercolor digital art.`,
    },
    {
      num: 2,
      prompt: `Colorful forest with animal friends gathered in clearing.
      Bunny, fox, owl, deer all together listening to a story.
      Cute wise turtle in center telling tales.
      Vibrant autumn colors, golden light, magical atmosphere.
      Studio Ghibli style, children's book illustration.
      Warm, friendly, full of life and color.`,
    },
    {
      num: 3,
      prompt: `Magical crystal river through glowing forest.
      Fish of light swimming in luminous water.
      Ancient turtle on riverbank under starry sky.
      Blues, teals and silvers with golden reflections.
      Children's book illustration, Studio Ghibli style.
      Mysterious, adventurous, beautiful.`,
    },
    {
      num: 4,
      prompt: `Majestic mountain peak with northern lights aurora borealis.
      Ancient wise turtle near mountain top looking at stars.
      Purple, green and gold aurora filling the sky.
      Snowy peaks, magical atmosphere, epic scale.
      Children's book illustration, Studio Ghibli style.
      Awe-inspiring, magical, triumphant.`,
    },
  ];

  const urls: Record<number, string> = {};
  for (const tomo of tomos) {
    console.log(`Generating Tomo ${tomo.num} cover...`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: tomo.prompt,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    });
    const url = response.data![0].url!;
    urls[tomo.num] = url;
    console.log(`Tomo ${tomo.num} URL:`, url);
  }
  return urls;
}

async function main() {
  console.log("=== DALL-E 3 Asset Generation ===\n");

  const [logoUrl, heroUrl, tomoUrls] = await Promise.all([
    generateQuelinaLogo(),
    generateHeroBackground(),
    generateTomoCovers(),
  ]);

  console.log("\n=== ALL GENERATED URLS ===");
  console.log("Logo:", logoUrl);
  console.log("Hero:", heroUrl);
  Object.entries(tomoUrls).forEach(([num, url]) => {
    console.log(`Tomo ${num}:`, url);
  });

  console.log("\n=== NEXT STEPS ===");
  console.log("1. Download images to /public/images/");
  console.log("2. Update components to reference them");
  console.log("3. Redeploy to Vercel");
}

main().catch(console.error);
