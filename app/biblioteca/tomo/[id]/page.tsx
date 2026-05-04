import { notFound } from "next/navigation";
import TomoIndexClient from "@/components/TomoIndex";
import { getServiceSupabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Tomo ${id} | Biblioteca La Tortuga Sabia`,
  };
}

export default async function TomoPage({ params }: PageProps) {
  const { id } = await params;
  const tomoId = parseInt(id, 10);

  if (isNaN(tomoId) || tomoId < 1 || tomoId > 7) {
    notFound();
  }

  const supabase = getServiceSupabase();

  const [{ data: tomoData }, { data: stories }] = await Promise.all([
    supabase
      .from("tomos")
      .select("id, titulo, subtitulo, tematica_principal, grupo_edad, edad_min, edad_max, total_cuentos")
      .eq("id", tomoId)
      .single(),
    supabase
      .from("stories")
      .select("id, numero_en_tomo, titulo, resumen, tematica_terapeutica, edad_sugerida, tiene_audio, estado")
      .eq("tomo", tomoId)
      .eq("estado", "publicado")
      .order("numero_en_tomo"),
  ]);

  if (!tomoData) {
    notFound();
  }

  return (
    <TomoIndexClient
      tomo={tomoData}
      stories={stories ?? []}
      accessibleTomos={[]}
    />
  );
}
