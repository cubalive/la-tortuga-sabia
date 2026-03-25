"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";

const QuellinaUniverse = dynamic(() => import("@/components/QuellinaUniverse"), { ssr: false });

const TITLE = "La Tortuga Sabia";
const QUOTE = "Cada cuento es una estrella que ilumina el corazón de un niño";

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  dur: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

export default function Hero() {
  const [charIndex, setCharIndex] = useState(0);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    if (charIndex < TITLE.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), 100);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowQuote(true), 400);
      return () => clearTimeout(t);
    }
  }, [charIndex]);

  const words = QUOTE.split(" ");

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Layer 1: base */}
      <div className="absolute inset-0" style={{ background: "#050d12" }} />

      {/* Layer 2: nebulas */}
      <div className="absolute inset-0 nebula-bg pointer-events-none" />

      {/* Layer 3: 3D scene */}
      <div className="absolute inset-0 opacity-50">
        <QuellinaUniverse />
      </div>

      {/* Layer 4: golden particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: "#C9882A" }}
          animate={{ y: [0, -25, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl">
        {/* Title — letter by letter with micro-glow */}
        <h1 className="font-cinzel text-5xl md:text-7xl font-bold mb-6 min-h-[1.2em]" style={{ color: "#FEFAE0", textShadow: "0 0 30px rgba(201,136,42,0.3)" }}>
          {TITLE.split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={i < charIndex ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={char === " " ? { width: "0.3em" } : {}}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
          {charIndex < TITLE.length && (
            <span className="inline-block w-[3px] h-[0.8em] bg-gold ml-1 align-middle" style={{ animation: "typewriter-cursor 0.8s infinite" }} />
          )}
        </h1>

        {/* Subtitle — word by word */}
        <p className="font-playfair italic text-lg md:text-2xl min-h-[2em] mb-12" style={{ color: "#C9882A" }}>
          {showQuote &&
            words.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.3em]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
              >
                {word}
              </motion.span>
            ))}
        </p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={showQuote ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <MagicButton type="primary" href="#tomos">
            Descubre los Cuentos
          </MagicButton>
          <MagicButton type="secondary" href="#quelina">
            Conoce a Quelina
          </MagicButton>
        </motion.div>
      </div>

      {/* Scroll indicator — mini Quelina floating down */}
      <motion.div
        className="absolute bottom-8 flex flex-col items-center z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <ellipse cx="14" cy="12" rx="8" ry="6" fill="#2D6A4F" />
          <ellipse cx="14" cy="11" rx="6" ry="4" fill="#1B4332" />
          <circle cx="18" cy="11" r="3" fill="#40916C" />
          <circle cx="18.5" cy="10.5" r="0.8" fill="#050d12" />
          <circle cx="19" cy="10" r="0.3" fill="white" />
          <path d="M8 16l-2 4M12 17l-1 3M16 17l1 3M20 16l2 4" stroke="#40916C" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-xs text-gray-500 mt-1 tracking-[0.2em] uppercase font-cinzel">Explora</span>
      </motion.div>
    </section>
  );
}
