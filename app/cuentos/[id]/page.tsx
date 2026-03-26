"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import stories from "@/public/stories/tomo-1/all-stories.json";

export default function CuentoPage() {
  const { id } = useParams();
  const num = parseInt(id as string);
  const story = (stories as any[]).find((s) => s.numero === num);
  const prev = num > 1 ? num - 1 : null;
  const next = num < 50 ? num + 1 : null;
  const [nightMode, setNightMode] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 7) setNightMode(true);
  }, []);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050d12" }}>
        <p className="text-cream">Cuento no encontrado</p>
      </div>
    );
  }

  const bg = nightMode ? "#000000" : "#050d12";
  const textColor = nightMode ? "#FEFAE0" : "#e6e1d2";
  const fontSize = nightMode ? 13 : 11;

  return (
    <div className="min-h-screen" style={{ background: bg, filter: nightMode ? "brightness(0.9)" : "none" }}>
      <style>{`* { cursor: auto !important; }`}</style>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/cuentos" className="text-gray-400 hover:text-cream text-sm font-cinzel">
            ← Cuentos
          </Link>
          <button
            onClick={() => setNightMode(!nightMode)}
            className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-cream"
            style={{ cursor: "pointer" }}
          >
            {nightMode ? "☀️ Día" : "🌙 Noche"}
          </button>
        </div>

        {/* Story number */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-gold/30 font-cinzel text-6xl font-bold mb-2">{String(num).padStart(2, "0")}</p>
          <h1 className="font-cinzel text-2xl md:text-3xl text-cream font-bold mb-2">{story.titulo}</h1>
          <p className="text-sm text-gray-400 mb-1">{story.personaje}</p>
          <p className="text-xs text-gray-500 mb-8">{story.situacion}</p>
        </motion.div>

        {/* Story text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {(story.historia || "").split("\n\n").map((para: string, i: number) => (
            <p
              key={i}
              className="mb-4 leading-relaxed"
              style={{ color: textColor, fontSize: `${fontSize}pt`, fontFamily: "var(--font-playfair)" }}
            >
              {para}
            </p>
          ))}
        </motion.div>

        {/* Quelina moment */}
        {story.quelina_momento && (
          <div
            className="rounded-2xl p-6 mb-8"
            style={{ background: "rgba(201,136,42,0.08)", border: "1px solid rgba(201,136,42,0.25)" }}
          >
            <p className="text-xs text-gold font-cinzel font-bold mb-2">EL MOMENTO DE QUELINA 🐢</p>
            <p className="text-sm font-playfair italic" style={{ color: "#e6d5b8" }}>
              {story.quelina_momento}
            </p>
          </div>
        )}

        {/* Moraleja */}
        {story.moraleja && (
          <p className="text-center text-gold font-playfair italic text-sm mb-12">
            ✨ {story.moraleja}
          </p>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-white/5">
          {prev ? (
            <Link href={`/cuentos/${prev}`} className="text-sm text-gray-400 hover:text-cream font-cinzel">
              ← Cuento {prev}
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/cuentos/${next}`} className="text-sm text-gray-400 hover:text-cream font-cinzel">
              Cuento {next} →
            </Link>
          ) : <span />}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/#pricing"
            className="inline-block px-8 py-3 rounded-2xl font-cinzel text-sm text-cream tracking-wider"
            style={{
              background: "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)",
              borderBottom: "4px solid #0d2e1f",
            }}
          >
            📖 Conseguir el libro completo
          </Link>
        </div>
      </div>
    </div>
  );
}
