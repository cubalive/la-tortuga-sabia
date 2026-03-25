import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const storyId = formData.get("storyId") as string | null;

    if (!file || !storyId) {
      return NextResponse.json(
        { error: "file y storyId son requeridos" },
        { status: 400 }
      );
    }

    if (!file.type.includes("audio/mpeg") && !file.name.endsWith(".mp3")) {
      return NextResponse.json(
        { error: "Solo se aceptan archivos .mp3" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `audio/suno/${storyId}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from("tortuga-assets")
      .upload(path, buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Error subiendo archivo: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from("tortuga-assets")
      .getPublicUrl(path);

    await supabase
      .from("stories")
      .update({
        suno_audio_url: data.publicUrl,
        suno_status: "uploaded",
      })
      .eq("id", storyId);

    return NextResponse.json({
      suno_audio_url: data.publicUrl,
    });
  } catch (err) {
    console.error("Error uploading Suno MP3:", err);
    return NextResponse.json(
      { error: "Error subiendo MP3 de Suno" },
      { status: 500 }
    );
  }
}
