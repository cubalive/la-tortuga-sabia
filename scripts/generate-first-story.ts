import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateFirstStory() {
  console.log("=== Generating First Story ===\n");
  console.log("Generando cuento con Claude...");

  const story = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: `Eres el autor de La Tortuga Sabia.
    Quelina es una tortuga anciana y sabia con constelaciones en el caparazón.
    Su frase de entrada: "Detente un momento... y escucha lo que el viento tiene que decirle a tu corazón."
    Escribe en español neutro, tono cálido y poético.
    Responde SOLO en JSON válido sin markdown.`,
    messages: [
      {
        role: "user",
        content: `Genera el cuento #1 del Tomo I para niños de 0-2 años:
      Título: El búho que no quería cerrar los ojos
      Personaje: Búho bebé llamado Buby
      Situación real: niño que resiste la hora de dormir

      Responde en JSON:
      {
        "titulo": "",
        "historia": "",
        "quelina_momento": "",
        "moraleja": "",
        "suno_prompt": "",
        "suno_lyrics": "",
        "il_portada": "prompt para DALL-E de la portada",
        "il_problema": "prompt para DALL-E del problema",
        "il_quelina": "prompt para DALL-E de Quelina apareciendo",
        "il_resolucion": "prompt para DALL-E de la resolución",
        "il_vineta": "prompt para DALL-E de viñeta final"
      }`,
      },
    ],
  });

  const content = story.content[0];
  if (content.type !== "text") throw new Error("No text response");
  const data = JSON.parse(content.text);

  console.log("✅ Cuento generado");
  console.log("TÍTULO:", data.titulo);
  console.log("MORALEJA:", data.moraleja);
  console.log("\nHISTORIA:\n", data.historia);
  console.log("\nQUELINA:\n", data.quelina_momento);
  console.log("\nSUNO PROMPT:\n", data.suno_prompt);
  console.log("\nSUNO LYRICS:\n", data.suno_lyrics);

  console.log("\nGenerando 5 ilustraciones...");

  const prompts = [
    data.il_portada,
    data.il_problema,
    data.il_quelina,
    data.il_resolucion,
    data.il_vineta,
  ];
  const nombres = ["portada", "problema", "quelina", "resolucion", "vineta"];

  for (let i = 0; i < 5; i++) {
    const img = await openai.images.generate({
      model: "dall-e-3",
      prompt:
        prompts[i] +
        " Watercolor children book illustration, Studio Ghibli style, warm colors, no text, soft color wash background in deep forest greens, NO white background, atmospheric depth.",
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    });
    console.log(`✅ Ilustración ${i + 1} (${nombres[i]}): ${img.data![0].url}`);
    // Rate limit pause
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n🎉 PRIMER CUENTO COMPLETO");
  console.log(
    "Costo estimado: ~$0.75 (Claude) + ~$0.40 (5 DALL-E) = ~$1.15 total"
  );
}

generateFirstStory().catch(console.error);
