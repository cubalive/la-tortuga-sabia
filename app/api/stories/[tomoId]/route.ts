import { getServiceSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/stories/[tomoId]
// Returns all published stories for a tomo (metadata only, no full text for locked stories)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tomoId: string }> },
) {
  const { tomoId } = await params;
  const tomo = parseInt(tomoId, 10);

  if (isNaN(tomo) || tomo < 1 || tomo > 7) {
    return NextResponse.json({ error: "Tomo inválido" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  const { data: stories, error } = await supabase
    .from("stories")
    .select(
      "id, tomo, numero_en_tomo, titulo, resumen, tematica_terapeutica, edad_sugerida, palabras_count, tiene_audio, estado",
    )
    .eq("tomo", tomo)
    .eq("estado", "publicado")
    .order("numero_en_tomo");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: tomoData } = await supabase
    .from("tomos")
    .select("id, titulo, subtitulo, tematica_principal, grupo_edad, edad_min, edad_max, total_cuentos")
    .eq("id", tomo)
    .single();

  return NextResponse.json({
    tomo: tomoData,
    stories: stories ?? [],
    total: stories?.length ?? 0,
  });
}
