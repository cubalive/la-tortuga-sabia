"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import stories from "@/public/stories/tomo-1/all-stories.json";

const EMOCIONES = ["miedo", "tristeza", "alegría", "soledad", "amor", "valentía", "confianza", "todos"];

export default function CuentosPage() {
  const [search, setSearch] = useState("");
  const [emocion, setEmocion] = useState("todos");

  const filtered = useMemo(() => {
    return (stories as any[]).filter((s) => {
      const matchSearch =
        !search ||
        s.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        s.personaje?.toLowerCase().includes(search.toLowerCase()) ||
        s.situacion?.toLowerCase().includes(search.toLowerCase());
      const matchEmocion =
        emocion === "todos" ||
        s.situacion?.toLowerCase().includes(emocion) ||
        s.titulo?.toLowerCase().includes(emocion) ||
        s.moraleja?.toLowerCase().includes(emocion);
      return matchSearch && matchEmocion;
    });
  }, [search, emocion]);

  return (
    <div className="min-h-screen" style={{ background: "#050d12" }}>
      <style>{`* { cursor: auto !important; }`}</style>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/" className="text-gray-400 hover:text-cream text-sm font-cinzel mb-8 inline-block">
          ← Volver al bosque
        </Link>

        <h1 className="font-cinzel text-3xl md:text-4xl text-cream mb-2">Los 50 Cuentos</h1>
        <p className="font-playfair italic text-gold text-sm mb-8">Tomo I — El Bosque Encantado</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, personaje o tema..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-cream placeholder:text-gray-600 focus:outline-none focus:border-gold/30"
            style={{ cursor: "text" }}
          />
          <select
            value={emocion}
            onChange={(e) => setEmocion(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none"
            style={{ cursor: "pointer" }}
          >
            {EMOCIONES.map((e) => (
              <option key={e} value={e} style={{ background: "#0a1a24" }}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <p className="text-gray-500 text-xs mb-6">{filtered.length} cuentos encontrados</p>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s: any, i: number) => (
            <motion.div
              key={s.numero}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                href={`/cuentos/${s.numero}`}
                className="block rounded-2xl border border-white/5 p-5 transition-all hover:border-gold/20 hover:bg-white/[0.02]"
                style={{ background: "rgba(10,26,36,0.5)" }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-bold text-gold/20 font-cinzel shrink-0">
                    {String(s.numero).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-cinzel text-sm text-cream font-bold mb-1 truncate">{s.titulo}</h3>
                    <p className="text-xs text-gray-400 mb-1">{s.personaje}</p>
                    <p className="text-xs text-gray-500 truncate">{s.situacion}</p>
                    <p className="text-xs text-gold/60 mt-2 font-playfair italic truncate">{s.moraleja}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-12 font-playfair italic">
            No se encontraron cuentos con esos filtros 🌿
          </p>
        )}
      </div>
    </div>
  );
}
