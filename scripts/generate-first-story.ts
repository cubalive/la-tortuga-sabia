import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StoryCost {
  service: string;
  model: string;
  usage: string;
  estimatedCost: number;
}

const costs: StoryCost[] = [];

async function generateStoryText(): Promise<string> {
  console.log("Generating story text with Claude...");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `Escribe un cuento infantil completo para "La Tortuga Sabia".

DETALLES:
- Título: "El búho que no quería cerrar los ojos"
- Tomo I, cuento número 1
- Personaje principal: Búho bebé llamado "Olivo"
- Quelina (tortuga sabia) aparece como guía
- Situación: un niño que no quiere dormir
- Edad objetivo: 2-4 años
- Extensión: ~800 palabras
- Tono: tierno, mágico, reconfortante
- Incluye diálogos entre Olivo y Quelina
- Termina con Olivo cerrando los ojos feliz
- Incluye una moraleja sutil sobre la importancia de dormir
- Escribe en español, lenguaje simple para niños pequeños

FORMATO:
Título
Subtítulo corto
[5 secciones marcadas con ---ILUSTRACION X--- donde irán las imágenes]
Texto del cuento
Moraleja final`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  costs.push({
    service: "Anthropic",
    model: "claude-sonnet-4-20250514",
    usage: `${message.usage.input_tokens} in / ${message.usage.output_tokens} out`,
    estimatedCost:
      (message.usage.input_tokens / 1_000_000) * 3 +
      (message.usage.output_tokens / 1_000_000) * 15,
  });

  console.log("Story generated successfully!");
  return text;
}

async function generateIllustrations(): Promise<Record<string, string>> {
  const illustrations = [
    {
      key: "cover",
      prompt: `Baby owl with huge round eyes wide open under a full moon.
      Sitting on a branch in a magical forest at night.
      Stars twinkling, fireflies glowing around.
      Children's book illustration, extremely cute, Studio Ghibli style.
      Soft watercolor, warm golden moonlight, jade green leaves.
      Magical, cozy, bedtime story feeling.`,
    },
    {
      key: "problem",
      prompt: `Baby owl looking around curiously while all forest animals sleep.
      Deer, bunny, fox all curled up peacefully sleeping.
      Owl's eyes wide open, looking a bit worried.
      Night forest scene, soft moonlight, children's book style.
      Studio Ghibli watercolor, cute and gentle.
      Warm tones, peaceful except for the alert little owl.`,
    },
    {
      key: "quelina_appears",
      prompt: `Ancient wise turtle with golden constellation patterns on shell.
      Appearing magically among glowing stars and fireflies.
      Kind smile, wise gentle eyes, jade green color.
      Meeting a cute baby owl on a branch.
      Magical sparkles and golden light surrounding them.
      Children's book illustration, Studio Ghibli style, watercolor.`,
    },
    {
      key: "resolution",
      prompt: `Baby owl peacefully closing its eyes with a gentle smile.
      Surrounded by soft golden starlight and tiny fireflies.
      Ancient wise turtle watching lovingly nearby.
      Magical protective bubble of warm light around them.
      Dreamy, peaceful, sleepy atmosphere.
      Children's book illustration, Studio Ghibli watercolor style.`,
    },
    {
      key: "goodnight",
      prompt: `A single beautiful golden star glowing in a dark sky.
      Soft warm light radiating outward.
      Tiny sleeping baby owl silhouette on a branch below.
      Minimalist, elegant, peaceful night scene.
      Children's book final page illustration.
      Studio Ghibli style, magical, simple and beautiful.`,
    },
  ];

  const urls: Record<string, string> = {};

  for (const illus of illustrations) {
    console.log(`Generating illustration: ${illus.key}...`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: illus.prompt,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    });
    urls[illus.key] = response.data![0].url!;
    console.log(`  ${illus.key} URL:`, urls[illus.key]);

    costs.push({
      service: "OpenAI",
      model: "dall-e-3",
      usage: "1 HD image 1024x1024",
      estimatedCost: 0.08,
    });
  }

  return urls;
}

async function saveToSupabase(
  storyText: string,
  illustrationUrls: Record<string, string>
) {
  console.log("\nSaving to Supabase...");

  // Save story
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .insert({
      title: "El búho que no quería cerrar los ojos",
      tomo: 1,
      story_number: 1,
      character: "Olivo (Búho bebé)",
      situation: "Un niño que no quiere dormir",
      age_range: "2-4 años",
      content: storyText,
      illustrations: illustrationUrls,
      status: "draft",
    })
    .select()
    .single();

  if (storyError) {
    console.log("Note: Could not save story to Supabase:", storyError.message);
    console.log("(Table may not exist yet — story content shown below)");
  } else {
    console.log("Story saved with ID:", story.id);
  }

  // Save costs
  const totalCost = costs.reduce((sum, c) => sum + c.estimatedCost, 0);
  const { error: costError } = await supabase.from("api_costs").insert({
    operation: "generate_first_story",
    costs: costs,
    total_estimated_usd: totalCost,
  });

  if (costError) {
    console.log(
      "Note: Could not save costs to Supabase:",
      costError.message
    );
  } else {
    console.log("Costs saved to Supabase");
  }
}

async function main() {
  console.log("=== Generating First Story ===\n");
  console.log('Story: "El búho que no quería cerrar los ojos"');
  console.log("Tomo I, Cuento #1\n");

  // Generate story text and illustrations in parallel
  const [storyText, illustrationUrls] = await Promise.all([
    generateStoryText(),
    generateIllustrations(),
  ]);

  // Save to Supabase
  await saveToSupabase(storyText, illustrationUrls);

  // Print results
  console.log("\n" + "=".repeat(60));
  console.log("STORY TEXT:");
  console.log("=".repeat(60));
  console.log(storyText);

  console.log("\n" + "=".repeat(60));
  console.log("ILLUSTRATION URLS:");
  console.log("=".repeat(60));
  Object.entries(illustrationUrls).forEach(([key, url]) => {
    console.log(`${key}: ${url}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("COST BREAKDOWN:");
  console.log("=".repeat(60));
  costs.forEach((c) => {
    console.log(`  ${c.service} (${c.model}): $${c.estimatedCost.toFixed(4)} — ${c.usage}`);
  });
  const totalCost = costs.reduce((sum, c) => sum + c.estimatedCost, 0);
  console.log(`\n  TOTAL ESTIMATED: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
