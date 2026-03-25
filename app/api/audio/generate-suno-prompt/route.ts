import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { generateSunoPrompt } from "@/lib/suno-generator";

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

    const result = await generateSunoPrompt(
      storyId,
      story.content || story.texto || "",
      story.personaje || "Quelina",
      story.emocion || "alegría",
      story.edad_target || "3-8 años",
      story.tomo || 1
    );

    return NextResponse.json({
      suno_prompt: result.suno_prompt,
      suno_lyrics: result.suno_lyrics,
    });
  } catch (err) {
    console.error("Error generating Suno prompt:", err);
    return NextResponse.json(
      { error: "Error generando prompt de Suno" },
      { status: 500 }
    );
  }
}
