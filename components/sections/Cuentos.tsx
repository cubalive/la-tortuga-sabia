"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

const stories = [
  { title: "El Vuelo de las Luciérnagas", desc: "Una noche especial donde la música ilumina el bosque", tag: "Tomo I", hue: 140 },
  { title: "La Canción del Corazón", desc: "Quelina enseña que la música vive dentro de cada niño", tag: "Tomo I", hue: 160 },
  { title: "El Amigo Invisible", desc: "A veces los mejores amigos están más cerca de lo que pensamos", tag: "Tomo II", hue: 260 },
  { title: "El Río que Cantaba", desc: "Un río mágico que lleva melodías a todos los rincones", tag: "Tomo III", hue: 210 },
  { title: "La Estrella Perdida", desc: "Una aventura para devolver una estrella al cielo", tag: "Tomo IV", hue: 35 },
];

export default function Cuentos() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [active, setActive] = useState(2);

  const prev = () => setActive((a) => (a - 1 + stories.length) % stories.length);
  const next = () => setActive((a) => (a + 1) % stories.length);

  return (
    <section ref={ref} className="py-24 px-4 overflow-hidden" style={{ background: "#050d12" }}>
      <motion.h2
        className="font-cinzel text-4xl md:text-5xl text-center text-cream mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        Cuentos que Inspiran
      </motion.h2>
      <motion.p
        className="text-center text-gray-400 mb-16 text-lg"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        Historias mágicas para soñar despiertos
      </motion.p>

      {/* Carousel */}
      <div className="relative max-w-5xl mx-auto flex items-center justify-center" style={{ perspective: "1200px", minHeight: 320 }}>
        {/* Nav arrows */}
        <button onClick={prev} className="absolute left-0 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream text-xl transition-colors">
          ‹
        </button>
        <button onClick={next} className="absolute right-0 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream text-xl transition-colors">
          ›
        </button>

        <div className="relative w-full flex items-center justify-center h-72">
          <AnimatePresence mode="popLayout">
            {stories.map((story, i) => {
              const offset = ((i - active + stories.length) % stories.length) - Math.floor(stories.length / 2);
              const isCenter = offset === 0;
              const absOff = Math.abs(offset);

              if (absOff > 2) return null;

              return (
                <motion.div
                  key={story.title}
                  className="absolute rounded-2xl p-6 flex flex-col justify-end border border-white/5"
                  style={{
                    width: isCenter ? 320 : 240,
                    height: isCenter ? 260 : 200,
                    background: `linear-gradient(135deg, hsla(${story.hue},40%,20%,0.8), hsla(${story.hue},30%,8%,0.9))`,
                    filter: isCenter ? "none" : `blur(${absOff}px)`,
                    zIndex: 10 - absOff,
                  }}
                  animate={{
                    x: offset * 200,
                    scale: isCenter ? 1 : 0.8 - absOff * 0.05,
                    opacity: isCenter ? 1 : 0.5 - absOff * 0.15,
                    rotateY: offset * -8,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  onClick={() => setActive(i)}
                >
                  {/* Watercolor effect */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 30% 70%, hsla(${story.hue},60%,50%,0.4), transparent 60%), radial-gradient(circle at 70% 30%, hsla(${story.hue + 30},60%,50%,0.3), transparent 50%)`,
                    }}
                  />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 w-fit mb-2 relative z-10">
                    {story.tag}
                  </span>
                  <h3 className="font-cinzel text-lg text-cream font-bold relative z-10">{story.title}</h3>
                  {isCenter && (
                    <motion.p
                      className="text-gray-300 text-sm mt-2 relative z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {story.desc}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {stories.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === active ? "bg-gold w-6" : "bg-white/20"}`}
          />
        ))}
      </div>
    </section>
  );
}
