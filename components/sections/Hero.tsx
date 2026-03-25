"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const QuellinaUniverse = dynamic(
  () => import("@/components/QuellinaUniverse"),
  { ssr: false }
);

function useTypewriter(text: string, speed = 80) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

const QUOTE = "Cada cuento es una estrella que ilumina el corazón de un niño";
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  dur: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

export default function Hero() {
  const title = useTypewriter("La Tortuga Sabia", 100);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowQuote(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const words = QUOTE.split(" ");

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden nebula-bg" style={{ background: "#050d12" }}>
      {/* 3D Scene */}
      <div className="absolute inset-0 opacity-60">
        <QuellinaUniverse />
      </div>

      {/* Golden particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: "#C9882A" }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl">
        {/* Typewriter title */}
        <h1 className="font-cinzel text-5xl md:text-7xl font-bold text-cream mb-4 min-h-[1.2em]">
          {title}
          <span className="inline-block w-[3px] h-[1em] bg-gold ml-1 align-middle" style={{ animation: "typewriter-cursor 1s infinite" }} />
        </h1>

        {/* Quote word by word */}
        <p className="font-playfair italic text-lg md:text-2xl text-gold min-h-[2em] mb-10">
          {showQuote &&
            words.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.3em]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.18, duration: 0.4 }}
              >
                {word}
              </motion.span>
            ))}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a
            href="#tomos"
            className="px-8 py-3 rounded-full bg-jade text-cream font-semibold text-lg hover:bg-jade-light transition-colors glow-jade"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Descubre los Cuentos
          </motion.a>
          <motion.a
            href="#quelina"
            className="px-8 py-3 rounded-full border border-gold/40 text-gold font-semibold text-lg hover:bg-gold/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Conoce a Quelina
          </motion.a>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 flex flex-col items-center z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <ellipse cx="14" cy="12" rx="8" ry="7" stroke="#2D6A4F" strokeWidth="1.5" />
          <circle cx="14" cy="7" r="1" fill="#C9882A" />
          <path d="M8 18l-2 4M12 19l-1 3M16 19l1 3M20 18l2 4" stroke="#2D6A4F" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Explora</span>
      </motion.div>
    </section>
  );
}
