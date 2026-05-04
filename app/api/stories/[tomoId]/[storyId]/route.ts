import { getServiceSupabase } from "@/lib/supabase";
import { checkStoryAccess } from "@/lib/access-control";
import { NextRequest, NextResponse } from "next/server";

// GET /api/stories/[tomoId]/[storyId]
// Returns full story content — respects access control
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tomoId: string; storyId: string }> },
) {
  const { tomoId, storyId } = await params;
  const tomo = parseInt(tomoId, 10);
  const numero = parseInt(storyId, 10);

  if (isNaN(tomo) || isNaN(numero)) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  // Check access (userId from header set by middleware)
  const userId = req.headers.get("x-user-id") ?? null;
  const access = await checkStoryAccess(userId, tomo, numero);

  if (!access.allowed) {
    return NextResponse.json(
      { error: "Acceso restringido", reason: access.reason, upgrade_url: access.upgrade_url },
      { status: 403 },
    );
  }

  const supabase = getServiceSupabase();

  const { data: story, error } = await supabase
    .from("stories")
    .select("*")
    .eq("tomo", tomo)
    .eq("numero_en_tomo", numero)
    .eq("estado", "publicado")
    .single();

  if (error || !story) {
    return NextResponse.json({ error: "Cuento no encontrado" }, { status: 404 });
  }

  // Fetch audio if available
  const { data: audio } = await supabase
    .from("story_audio")
    .select("audio_url, duracion_segundos")
    .eq("tomo", tomo)
    .eq("numero_en_tomo", numero)
    .single();

  return NextResponse.json({ story, audio: audio ?? null });
}
