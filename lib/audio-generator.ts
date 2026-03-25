import OpenAI from "openai";
import { getServiceSupabase } from "./supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Genera narración completa del cuento
export async function generateNarration(storyId: string, texto: string) {
  const supabase = getServiceSupabase();

  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    input: texto,
    voice: "nova",
    speed: 0.9,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  const path = `audio/narration/${storyId}.mp3`;

  await supabase.storage.from("tortuga-assets").upload(path, buffer, {
    contentType: "audio/mpeg",
    upsert: true,
  });

  const { data } = supabase.storage.from("tortuga-assets").getPublicUrl(path);

  await supabase
    .from("stories")
    .update({
      narration_url: data.publicUrl,
      tts_status: "narration_done",
    })
    .eq("id", storyId);

  // Log cost: TTS-1-HD = $0.030 per 1000 chars
  const cost = (texto.length / 1000) * 0.03;
  await logCost("openai-tts", "narration", cost, storyId);

  return data.publicUrl;
}

// Genera voz especial de Quelina
export async function generateQuelinaVoice(
  storyId: string,
  quelinaMomento: string
) {
  const supabase = getServiceSupabase();

  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    input: quelinaMomento,
    voice: "onyx",
    speed: 0.85,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  const path = `audio/quelina/${storyId}.mp3`;

  await supabase.storage.from("tortuga-assets").upload(path, buffer, {
    contentType: "audio/mpeg",
    upsert: true,
  });

  const { data } = supabase.storage.from("tortuga-assets").getPublicUrl(path);

  await supabase
    .from("stories")
    .update({
      quelina_audio_url: data.publicUrl,
      tts_status: "complete",
    })
    .eq("id", storyId);

  // Log cost
  const cost = (quelinaMomento.length / 1000) * 0.03;
  await logCost("openai-tts", "quelina-voice", cost, storyId);

  return data.publicUrl;
}

// Registra costo en api_costs
async function logCost(
  service: string,
  operation: string,
  cost: number,
  storyId: string
) {
  const supabase = getServiceSupabase();
  await supabase.from("api_costs").insert({
    service,
    operation,
    cost_usd: cost,
    story_id: storyId,
  });
}
