"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const QUOTE =
  "La sabiduría no está en los años que vivimos, sino en las historias que compartimos. Cada niño lleva una estrella dentro, y cada cuento la hace brillar más fuerte.";

export default function Quote() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const words = QUOTE.split(" ");

  return (
    <section
      id="quelina"
      ref={ref}
      className="relative py-32 px-4 overflow-hidden flex items-center justify-center min-h-[70vh]"
      style={{ background: "#050d12" }}
    >
      {/* Star field */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
          }}
        />
      ))}

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Quelina with halo */}
        <motion.div
          className="mx-auto mb-10 w-28 h-28 rounded-full flex items-center justify-center halo-pulse"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <ellipse cx="40" cy="36" rx="22" ry="18" fill="#2D6A4F" />
            <ellipse cx="40" cy="36" rx="22" ry="18" stroke="#C9882A" strokeWidth="1" opacity="0.5" />
            <path d="M28 28 Q40 20 52 28" stroke="#C9882A" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M26 36 Q40 26 54 36" stroke="#C9882A" strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="58" cy="38" r="7" fill="#2D6A4F" />
            <circle cx="60" cy="36" r="1.5" fill="#C9882A" />
            <path d="M28 50l-3 10M36 52l-2 9M44 52l2 9M52 50l3 10" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="font-cinzel text-sm uppercase tracking-[0.3em] text-jade-light mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          Palabras de Quelina
        </motion.h2>

        {/* Quote word by word */}
        <blockquote className="font-playfair italic text-xl md:text-3xl leading-relaxed text-gold">
          &ldquo;
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
            >
              {word}
            </motion.span>
          ))}
          &rdquo;
        </blockquote>

        <motion.p
          className="mt-8 text-gray-400 text-sm font-playfair italic"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 2.5 }}
        >
          — Quelina, La Tortuga Sabia
        </motion.p>
      </div>
    </section>
  );
}
