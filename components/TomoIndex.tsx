"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Story {
  id: string;
  numero_en_tomo: number;
  titulo: string;
  resumen?: string;
  tematica_terapeutica?: string;
  edad_sugerida?: string;
  tiene_audio?: boolean;
}

interface TomoData {
  id: number;
  titulo: string;
  subtitulo?: string;
  tematica_principal?: string;
  grupo_edad?: string;
  edad_min?: number;
  edad_max?: number;
  total_cuentos?: number;
}

interface TomoIndexProps {
  tomo: TomoData;
  stories: Story[];
  accessibleTomos: number[];
}

export default function TomoIndex({ tomo, stories, accessibleTomos }: TomoIndexProps) {
  const [search, setSearch] = useState("");

  const hasFullAccess = accessibleTomos.includes(tomo.id);

  const filtered = stories.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.titulo.toLowerCase().includes(q) ||
      (s.tematica_terapeutica ?? "").toLowerCase().includes(q) ||
      (s.resumen ?? "").toLowerCase().includes(q)
    );
  });

  function isLocked(story: Story): boolean {
    return story.numero_en_tomo !== 1 && !hasFullAccess;
  }

  return (
    <div className="min-h-screen" style={{ background: "#050d12" }}>
      <style>{`* { cursor: auto !important; }`}</style>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          href="/biblioteca"
          className="inline-block text-xs font-cinzel tracking-wider mb-8 transition-colors"
          style={{ color: "rgba(254,250,224,0.4)" }}
        >
          ← Biblioteca
        </Link>

        {/* Tomo header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p
            className="font-cinzel text-xs tracking-widest mb-2"
            style={{ color: "rgba(201,136,42,0.6)" }}
          >
            TOMO {tomo.id}
          </p>
          <h1 className="font-cinzel text-3xl md:text-4xl text-cream font-bold mb-1">
            {tomo.titulo}
          </h1>
          {tomo.subtitulo && (
            <p className="font-playfair italic text-sm" style={{ color: "rgba(254,250,224,0.5)" }}>
              {tomo.subtitulo}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-3">
            {tomo.tematica_principal && (
              <span
                className="text-xs px-3 py-1 rounded-full font-cinzel tracking-wider"
                style={{ background: "rgba(45,106,79,0.15)", color: "#40916C" }}
              >
                {tomo.tematica_principal}
              </span>
            )}
            {tomo.grupo_edad && (
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: "rgba(201,136,42,0.1)", color: "rgba(201,136,42,0.8)" }}
              >
                {tomo.grupo_edad} años
              </span>
            )}
            <span className="text-xs text-gray-500">{stories.length} cuentos</span>
          </div>
        </motion.div>

        {/* Access banner */}
        {!hasFullAccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"
            style={{ background: "rgba(201,136,42,0.07)", border: "1px solid rgba(201,136,42,0.2)" }}
          >
            <p className="text-sm text-cream font-playfair">
              🔒 Solo el cuento #1 es gratuito. Desbloquea el tomo completo.
            </p>
            <Link
              href={`/planes?tomo=${tomo.id}`}
              className="shrink-0 text-xs font-cinzel tracking-wider px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "#2D6A4F", color: "#FEFAE0" }}
            >
              Ver planes
            </Link>
          </motion.div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o tema..."
            className="w-full rounded-xl px-4 py-3 text-sm text-cream placeholder-gray-600 focus:outline-none focus:border-gold/30"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "text",
            }}
          />
        </div>

        {/* Story list */}
        <div className="space-y-2">
          {filtered.map((story, i) => {
            const locked = isLocked(story);
            const href = `/biblioteca/tomo/${tomo.id}/cuento/${story.numero_en_tomo}`;

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link
                  href={href}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-all group"
                  style={{
                    background: "rgba(10,26,36,0.5)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Number */}
                  <span
                    className="text-2xl font-bold font-cinzel shrink-0 w-10 text-right select-none"
                    style={{ color: locked ? "rgba(255,255,255,0.08)" : "rgba(201,136,42,0.25)" }}
                  >
                    {String(story.numero_en_tomo).padStart(2, "0")}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-cinzel text-sm font-bold truncate transition-colors group-hover:text-gold"
                      style={{ color: locked ? "rgba(254,250,224,0.35)" : "#FEFAE0" }}
                    >
                      {story.titulo}
                    </h3>
                    {story.tematica_terapeutica && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(64,145,108,0.7)" }}>
                        {story.tematica_terapeutica.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {story.tiene_audio && !locked && (
                      <span className="text-xs" title="Audio disponible">🔊</span>
                    )}
                    {locked ? (
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>🔒</span>
                    ) : (
                      <span
                        className="text-xs font-cinzel tracking-wider transition-colors group-hover:text-gold"
                        style={{ color: "rgba(254,250,224,0.2)" }}
                      >
                        →
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center py-12 font-playfair italic text-gray-500">
            No se encontraron cuentos 🌿
          </p>
        )}
      </div>
    </div>
  );
}
