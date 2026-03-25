"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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

          {/* Quelina character image */}
          <Image
            src="/images/quelina-happy.png"
            alt="Quelina"
            width={200}
            height={200}
            className="relative z-10"
            style={{ filter: "drop-shadow(0 0 25px rgba(201,136,42,0.6))" }}
          />
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
