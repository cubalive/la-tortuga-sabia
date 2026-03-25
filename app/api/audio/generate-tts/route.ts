import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { generateNarration, generateQuelinaVoice } from "@/lib/audio-generator";

export async function POST(request: NextRequest) {
  try {
    const { storyId } = await request.json();

    if (!storyId) {
      return NextResponse.json(
        { error: "storyId es requerido" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get story from Supabase
    const { data: story, error } = await supabase
      .from("stories")
      .select("*")
      .eq("id", storyId)
      .single();

    if (error || !story) {
      return NextResponse.json(
        { error: "Cuento no encontrado" },
        { status: 404 }
      );
    }

    // Generate narration
    const narrationUrl = await generateNarration(
      storyId,
      story.content || story.texto || ""
    );

    // Generate Quelina voice
    const quelinaUrl = await generateQuelinaVoice(
      storyId,
      story.quelina_momento || story.moraleja || ""
    );

    return NextResponse.json({
      narration_url: narrationUrl,
      quelina_audio_url: quelinaUrl,
    });
  } catch (err) {
    console.error("Error generating TTS:", err);
    return NextResponse.json(
      { error: "Error generando audio TTS" },
      { status: 500 }
    );
  }
}
