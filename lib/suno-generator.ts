import Anthropic from "@anthropic-ai/sdk";
import { getServiceSupabase } from "./supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateSunoPrompt(
  storyId: string,
  historia: string,
  personaje: string,
  emocion: string,
  edadTarget: string,
  tomo: number
) {
  const supabase = getServiceSupabase();

  const tomoStyles: Record<number, string> = {
    1: "Gentle lullaby, soft piano, warm strings, 55 BPM, no percussion, sleep music",
    2: "Playful acoustic guitar, light percussion, cheerful, 90 BPM, children folk",
    3: "Adventure music, light strings, curious wonder, 100 BPM, Studio Ghibli style",
    4: "Epic but gentle, piano and strings, emotional depth, 110 BPM, coming of age",
  };

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Basándote en este cuento infantil genera:
1. Un prompt musical para Suno AI (en inglés, máximo 200 caracteres, basado en este estilo base: "${tomoStyles[tomo] || tomoStyles[1]}")

2. Una letra de canción en español neutro (3 estrofas + coro, basada en la historia, apropiada para niños de ${edadTarget})

Historia: ${historia.substring(0, 500)}
Personaje principal: ${personaje}
Emoción central: ${emocion}

Responde SOLO en JSON válido sin markdown:
{
  "suno_prompt": "...",
  "suno_lyrics": "..."
}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("No text response from Claude");

  const data = JSON.parse(content.text) as {
    suno_prompt: string;
    suno_lyrics: string;
  };

  await supabase
    .from("stories")
    .update({
      suno_prompt: data.suno_prompt,
      suno_lyrics: data.suno_lyrics,
      suno_status: "prompt_ready",
    })
    .eq("id", storyId);

  // Log cost: Claude Sonnet ~$0.003 per 1K input + $0.015 per 1K output
  const estimatedCost = 0.02;
  await supabase.from("api_costs").insert({
    service: "anthropic",
    operation: "suno-prompt",
    cost_usd: estimatedCost,
    story_id: storyId,
  });

  return data;
}
