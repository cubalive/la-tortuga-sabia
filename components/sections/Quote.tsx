"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const QUOTE =
  "La sabiduría no está en los años que vivimos, sino en las historias que compartimos. Cada niño lleva una estrella dentro, y cada cuento la hace brillar más fuerte.";

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  opacity: Math.random() * 0.5 + 0.1,
  dur: 3 + Math.random() * 4,
}));

export default function Quote() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const words = QUOTE.split(" ");

  return (
    <section
      id="quelina"
      ref={ref}
      className="relative py-32 px-4 overflow-hidden flex items-center justify-center min-h-[80vh]"
      style={{ background: "#050d12" }}
    >
      {/* Star field */}
      {STARS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
          animate={{ opacity: [s.opacity * 0.3, s.opacity, s.opacity * 0.3] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Big Quelina with golden halo */}
        <motion.div
          className="mx-auto mb-12 relative"
          style={{ width: 160, height: 160 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        >
          {/* Pulsing halo rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid rgba(201,136,42,0.3)",
              boxShadow:
                "0 0 40px rgba(201,136,42,0.2), inset 0 0 40px rgba(201,136,42,0.1)",
            }}
            animate={{
              boxShadow: [
                "0 0 30px rgba(201,136,42,0.2), inset 0 0 30px rgba(201,136,42,0.1)",
                "0 0 60px rgba(201,136,42,0.4), inset 0 0 60px rgba(201,136,42,0.2)",
                "0 0 30px rgba(201,136,42,0.2), inset 0 0 30px rgba(201,136,42,0.1)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: -12,
              border: "1px solid rgba(201,136,42,0.15)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Quelina SVG — big and detailed */}
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            className="relative z-10"
          >
            {/* Body */}
            <ellipse cx="80" cy="85" rx="42" ry="30" fill="#2D6A4F" />
            {/* Shell */}
            <ellipse cx="80" cy="75" rx="35" ry="28" fill="#1B4332" />
            {/* Shell pattern — hex lines */}
            <path d="M55 60 Q80 48 105 60" stroke="#C9882A" strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M50 72 Q80 58 110 72" stroke="#C9882A" strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M53 84 Q80 70 107 84" stroke="#C9882A" strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M80 50 L80 95" stroke="#C9882A" strokeWidth="0.8" opacity="0.3" />
            <path d="M65 52 L72 92" stroke="#C9882A" strokeWidth="0.8" opacity="0.3" />
            <path d="M95 52 L88 92" stroke="#C9882A" strokeWidth="0.8" opacity="0.3" />
            {/* Constellation dots on shell */}
            {[
              [70, 58],
              [90, 58],
              [60, 70],
              [80, 65],
              [100, 70],
              [66, 82],
              [94, 82],
              [80, 78],
            ].map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="1.5"
                fill="#C9882A"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
            {/* Head */}
            <circle cx="118" cy="82" r="14" fill="#40916C" />
            {/* Eyes */}
            <circle cx="124" cy="78" r="3" fill="#050d12" />
            <circle cx="125.5" cy="76.5" r="1.2" fill="white" />
            <circle cx="124" cy="86" r="2.5" fill="#050d12" />
            <circle cx="125" cy="84.5" r="1" fill="white" />
            {/* Smile */}
            <path
              d="M120 90 Q124 94 128 90"
              stroke="#1B4332"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Legs */}
            <ellipse cx="55" cy="108" rx="8" ry="10" fill="#40916C" />
            <ellipse cx="105" cy="108" rx="8" ry="10" fill="#40916C" />
            <ellipse cx="65" cy="112" rx="7" ry="9" fill="#40916C" />
            <ellipse cx="95" cy="112" rx="7" ry="9" fill="#40916C" />
            {/* Tail */}
            <ellipse cx="38" cy="88" rx="6" ry="4" fill="#40916C" transform="rotate(-20 38 88)" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="font-cinzel text-xs uppercase tracking-[0.35em] mb-8"
          style={{ color: "#40916C" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          Palabras de Quelina
        </motion.h2>

        {/* Quote — word by word */}
        <blockquote className="font-playfair italic text-xl md:text-3xl leading-relaxed" style={{ color: "#C9882A" }}>
          &ldquo;
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.35 }}
            >
              {word}
            </motion.span>
          ))}
          &rdquo;
        </blockquote>

        <motion.p
          className="mt-8 text-sm font-playfair italic"
          style={{ color: "rgba(201,136,42,0.5)" }}
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
