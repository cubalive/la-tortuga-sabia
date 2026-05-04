import OpenAI from "openai";
import { getServiceSupabase } from "@/lib/supabase";
import { checkStoryAccess } from "@/lib/access-control";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/tts
// Body: { tomo, numeroEnTomo, text }
// Generates TTS with OpenAI nova voice, caches in Supabase Storage
export async function POST(req: NextRequest) {
  try {
    const { tomo, numeroEnTomo, text } = await req.json();

    if (!tomo || !numeroEnTomo || !text) {
      return NextResponse.json({ error: "tomo, numeroEnTomo y text son requeridos" }, { status: 400 });
    }

    const userId = req.headers.get("x-user-id") ?? null;
    const access = await checkStoryAccess(userId, tomo, numeroEnTomo);

    if (!access.allowed) {
      return NextResponse.json(
        { error: "Sin acceso al audio", upgrade_url: access.upgrade_url },
        { status: 403 },
      );
    }

    const supabase = getServiceSupabase();

    // Return cached audio if it already exists
    const { data: cached } = await supabase
      .from("story_audio")
      .select("audio_url, duracion_segundos")
      .eq("tomo", tomo)
      .eq("numero_en_tomo", numeroEnTomo)
      .single();

    if (cached?.audio_url) {
      return NextResponse.json({ audio_url: cached.audio_url, cached: true });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI no configurado" }, { status: 500 });
    }

    // Generate TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: text,
      speed: 0.9,
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());
    const filename = `tomos/tomo-${tomo}/cuento-${String(numeroEnTomo).padStart(2, "0")}.mp3`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(filename, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filename);
    const audioUrl = urlData.publicUrl;

    // Save to story_audio table
    const { data: storyRow } = await supabase
      .from("stories")
      .select("id")
      .eq("tomo", tomo)
      .eq("numero_en_tomo", numeroEnTomo)
      .single();

    await supabase.from("story_audio").upsert({
      story_id: storyRow?.id ?? null,
      tomo,
      numero_en_tomo: numeroEnTomo,
      audio_url: audioUrl,
      voz: "nova",
    }, { onConflict: "tomo,numero_en_tomo" });

    return NextResponse.json({ audio_url: audioUrl, cached: false });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "Error generando audio" }, { status: 500 });
  }
}
