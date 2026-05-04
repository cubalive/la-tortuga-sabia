import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";

export const metadata = {
  title: "Biblioteca | La Tortuga Sabia",
  description: "Los 7 tomos de Quelina — 228 cuentos terapéuticos para niños de 4 a 12 años.",
};

interface Tomo {
  id: number;
  titulo: string;
  subtitulo?: string;
  tematica_principal?: string;
  grupo_edad?: string;
  edad_min?: number;
  edad_max?: number;
  total_cuentos?: number;
}

const GRUPO_EMOJI: Record<string, string> = {
  primario: "🌱",
  intermedio: "🌿",
  avanzado: "🌳",
};

export default async function BibliotecaPage() {
  let tomos: Tomo[] = [];

  try {
    const supabase = getServiceSupabase();
    const { data } = await supabase
      .from("tomos")
      .select("id, titulo, subtitulo, tematica_principal, grupo_edad, edad_min, edad_max, total_cuentos")
      .order("id");
    tomos = data ?? [];
  } catch {
    // DB unavailable at build time — render with static fallback
  }

  // Static fallback if DB is empty
  if (!tomos.length) {
    tomos = [
      { id: 1, titulo: "El Despertar de Quelina",       grupo_edad: "primario",    edad_min: 4,  edad_max: 5,  total_cuentos: 33 },
      { id: 2, titulo: "El Jardín de los Sentimientos", grupo_edad: "primario",    edad_min: 4,  edad_max: 5,  total_cuentos: 33 },
      { id: 3, titulo: "La Montaña del Coraje",          grupo_edad: "intermedio",  edad_min: 6,  edad_max: 7,  total_cuentos: 33 },
      { id: 4, titulo: "El Mar de los Secretos",         grupo_edad: "intermedio",  edad_min: 6,  edad_max: 7,  total_cuentos: 33 },
      { id: 5, titulo: "El Bosque de los Miedos",        grupo_edad: "intermedio",  edad_min: 8,  edad_max: 9,  total_cuentos: 33 },
      { id: 6, titulo: "La Ciudad de los Sueños",        grupo_edad: "intermedio",  edad_min: 8,  edad_max: 9,  total_cuentos: 33 },
      { id: 7, titulo: "El Valle de los Cambios",        grupo_edad: "avanzado",    edad_min: 10, edad_max: 12, total_cuentos: 30 },
    ];
  }

  return (
    <div className="min-h-screen" style={{ background: "#050d12" }}>
      <style>{`* { cursor: auto !important; }`}</style>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <Link
          href="/"
          className="inline-block text-xs font-cinzel tracking-wider mb-8 transition-colors"
          style={{ color: "rgba(254,250,224,0.4)" }}
        >
          ← Inicio
        </Link>

        <div className="mb-10">
          <p
            className="font-cinzel text-xs tracking-widest mb-2"
            style={{ color: "rgba(201,136,42,0.6)" }}
          >
            BIBLIOTECA DE QUELINA
          </p>
          <h1 className="font-cinzel text-4xl md:text-5xl text-cream font-bold mb-3">
            Los 7 Tomos
          </h1>
          <p className="font-playfair italic text-base" style={{ color: "rgba(254,250,224,0.5)" }}>
            228 cuentos terapéuticos para niños de 4 a 12 años
          </p>
        </div>

        {/* Free tier notice */}
        <div
          className="rounded-2xl p-4 mb-8 flex items-center gap-3"
          style={{ background: "rgba(45,106,79,0.1)", border: "1px solid rgba(45,106,79,0.2)" }}
        >
          <span className="text-2xl">🐢</span>
          <p className="text-sm font-playfair" style={{ color: "rgba(254,250,224,0.7)" }}>
            El <strong className="text-cream">cuento #1 de cada tomo</strong> es gratuito.
            {" "}
            <Link href="/planes" className="text-jade-light underline underline-offset-2">
              Ver planes
            </Link>
            {" "}para acceder a todos los cuentos.
          </p>
        </div>

        {/* Tomos grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tomos.map((tomo, i) => (
            <Link
              key={tomo.id}
              href={`/biblioteca/tomo/${tomo.id}`}
              className="group rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{
                background: "#0a1a24",
                border: "1px solid rgba(255,255,255,0.05)",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="font-cinzel text-5xl font-bold select-none"
                  style={{ color: "rgba(201,136,42,0.18)" }}
                >
                  {tomo.id}
                </span>
                <span className="text-2xl" aria-hidden>
                  {GRUPO_EMOJI[tomo.grupo_edad ?? "primario"] ?? "📖"}
                </span>
              </div>

              <h2
                className="font-cinzel text-base font-bold text-cream mb-1 leading-snug group-hover:text-gold transition-colors"
              >
                {tomo.titulo}
              </h2>

              {tomo.subtitulo && (
                <p className="text-xs font-playfair italic mb-3" style={{ color: "rgba(254,250,224,0.4)" }}>
                  {tomo.subtitulo}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap mt-auto">
                {tomo.edad_min && tomo.edad_max && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{ background: "rgba(201,136,42,0.1)", color: "rgba(201,136,42,0.7)" }}
                  >
                    {tomo.edad_min}-{tomo.edad_max} años
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {tomo.total_cuentos ?? "—"} cuentos
                </span>
              </div>

              <div className="mt-4 flex items-center gap-1.5">
                <span
                  className="text-xs font-cinzel tracking-wider transition-colors group-hover:text-gold"
                  style={{ color: "rgba(254,250,224,0.2)" }}
                >
                  Explorar →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <p className="text-sm text-gray-500 mb-3 font-playfair">
            ¿Quieres acceder a todos los cuentos?
          </p>
          <Link
            href="/planes"
            className="inline-block px-8 py-3 rounded-2xl font-cinzel text-sm text-cream tracking-wider transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)",
              borderBottom: "3px solid #0d2e1f",
            }}
          >
            Ver todos los planes
          </Link>
        </div>
      </div>
    </div>
  );
}
