"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AudioPlayer from "@/components/AudioPlayer";

interface Story {
  id: string;
  tomo: number;
  numero_en_tomo: number;
  titulo: string;
  cuento_completo: string;
  moraleja?: string;
  actividad_sugerida?: string;
  tematica_terapeutica?: string;
  edad_sugerida?: string;
  resumen?: string;
}

interface Audio {
  audio_url: string;
  duracion_segundos?: number;
}

interface BookReaderProps {
  story: Story;
  audio: Audio | null;
  totalCuentos: number;
}

export default function BookReader({ story, audio, totalCuentos }: BookReaderProps) {
  const [nightMode, setNightMode] = useState(false);
  const [showActividad, setShowActividad] = useState(false);

  const { tomo, numero_en_tomo } = story;
  const prev = numero_en_tomo > 1 ? numero_en_tomo - 1 : null;
  const next = numero_en_tomo < totalCuentos ? numero_en_tomo + 1 : null;

  const bgColor   = nightMode ? "#000000" : "#050d12";
  const textColor = nightMode ? "#FEFAE0" : "#e6e1d2";

  const paragraphs = (story.cuento_completo ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: bgColor }}
    >
      <style>{`* { cursor: auto !important; }`}</style>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/biblioteca/tomo/${tomo}`}
            className="text-xs font-cinzel tracking-wider transition-colors"
            style={{ color: "rgba(254,250,224,0.5)" }}
          >
            ← Tomo {tomo}
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel" style={{ color: "rgba(254,250,224,0.3)" }}>
              {numero_en_tomo} / {totalCuentos}
            </span>
            <button
              onClick={() => setNightMode(!nightMode)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                color: "rgba(254,250,224,0.5)",
                cursor: "pointer",
              }}
            >
              {nightMode ? "☀️ Día" : "🌙 Noche"}
            </button>
          </div>
        </div>

        {/* Story header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p
            className="font-cinzel text-7xl font-bold mb-3 select-none"
            style={{ color: "rgba(201,136,42,0.15)" }}
          >
            {String(numero_en_tomo).padStart(2, "0")}
          </p>
          <h1 className="font-cinzel text-2xl md:text-3xl text-cream font-bold leading-tight mb-2">
            {story.titulo}
          </h1>
          {story.tematica_terapeutica && (
            <span
              className="inline-block text-xs px-3 py-1 rounded-full font-cinzel tracking-wider"
              style={{ background: "rgba(45,106,79,0.2)", color: "#40916C" }}
            >
              {story.tematica_terapeutica.replace(/_/g, " ")}
            </span>
          )}
        </motion.div>

        {/* Audio player */}
        {audio?.audio_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <AudioPlayer
              audioUrl={audio.audio_url}
              duracionSegundos={audio.duracion_segundos}
            />
          </motion.div>
        )}

        {/* Story text */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 space-y-4"
        >
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="leading-relaxed"
              style={{
                color: textColor,
                fontFamily: "var(--font-playfair)",
                fontSize: "1.0625rem",
                lineHeight: "1.8",
              }}
            >
              {para}
            </p>
          ))}
        </motion.article>

        {/* Moraleja */}
        {story.moraleja && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-6 mb-6 text-center"
            style={{
              background: "rgba(201,136,42,0.07)",
              border: "1px solid rgba(201,136,42,0.2)",
            }}
          >
            <p className="text-xs font-cinzel tracking-widest mb-3" style={{ color: "rgba(201,136,42,0.6)" }}>
              ✨ MORALEJA
            </p>
            <p className="font-playfair italic text-sm md:text-base" style={{ color: "#e6d5b8" }}>
              {story.moraleja}
            </p>
          </motion.div>
        )}

        {/* Actividad sugerida (collapsible) */}
        {story.actividad_sugerida && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl mb-8 overflow-hidden"
            style={{ border: "1px solid rgba(45,106,79,0.2)" }}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              style={{
                background: "rgba(45,106,79,0.08)",
                cursor: "pointer",
              }}
              onClick={() => setShowActividad(!showActividad)}
            >
              <span className="text-xs font-cinzel tracking-widest" style={{ color: "#40916C" }}>
                🌱 ACTIVIDAD SUGERIDA
              </span>
              <span className="text-jade text-sm">{showActividad ? "▲" : "▼"}</span>
            </button>
            {showActividad && (
              <div className="px-5 py-4" style={{ background: "rgba(45,106,79,0.04)" }}>
                <p className="text-sm leading-relaxed font-playfair" style={{ color: textColor }}>
                  {story.actividad_sugerida}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Navigation */}
        <div
          className="flex justify-between items-center pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {prev ? (
            <Link
              href={`/biblioteca/tomo/${tomo}/cuento/${prev}`}
              className="flex items-center gap-2 text-xs font-cinzel tracking-wider transition-colors hover:text-cream"
              style={{ color: "rgba(254,250,224,0.4)" }}
            >
              ← Cuento {prev}
            </Link>
          ) : <span />}

          {next ? (
            <Link
              href={`/biblioteca/tomo/${tomo}/cuento/${next}`}
              className="flex items-center gap-2 text-xs font-cinzel tracking-wider transition-colors hover:text-cream"
              style={{ color: "rgba(254,250,224,0.4)" }}
            >
              Cuento {next} →
            </Link>
          ) : (
            <Link
              href={`/biblioteca/tomo/${tomo}`}
              className="text-xs font-cinzel tracking-wider transition-colors hover:text-gold"
              style={{ color: "rgba(201,136,42,0.6)" }}
            >
              Ver índice del tomo →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
