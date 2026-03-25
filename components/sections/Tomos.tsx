"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const tomos = [
  {
    num: "I",
    title: "El Bosque Encantado",
    desc: "Quelina descubre un bosque donde las luciérnagas guardan secretos antiguos y los árboles susurran canciones de cuna.",
    bg: "radial-gradient(ellipse at 50% 80%, #0a2a1a 0%, #050d12 100%)",
    effect: "fireflies",
    color: "#40916C",
  },
  {
    num: "II",
    title: "Los Amigos del Camino",
    desc: "Nuevos amigos se unen a la aventura. Cada animal tiene una canción única y una lección especial para los niños.",
    bg: "radial-gradient(ellipse at 50% 80%, #1a2a0a 0%, #050d12 100%)",
    effect: "particles",
    color: "#7B68EE",
  },
  {
    num: "III",
    title: "El Río de los Sueños",
    desc: "Un río mágico lleva a Quelina por paisajes de ensueño donde la música cobra vida y los sueños se hacen realidad.",
    bg: "radial-gradient(ellipse at 50% 80%, #0a1a2a 0%, #050d12 100%)",
    effect: "waves",
    color: "#4682B4",
  },
  {
    num: "IV",
    title: "La Montaña de la Sabiduría",
    desc: "La aventura más grande: escalar la montaña donde vive la aurora boreal y descubrir el secreto de la verdadera sabiduría.",
    bg: "radial-gradient(ellipse at 50% 30%, #1a0a2a 0%, #050d12 100%)",
    effect: "aurora",
    color: "#C9882A",
  },
];

function Fireflies() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
          style={{ left: `${15 + Math.random() * 70}%`, top: `${20 + Math.random() * 60}%` }}
          animate={{ opacity: [0, 1, 0], y: [0, -20, 0], x: [0, (Math.random() - 0.5) * 30, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}
    </>
  );
}

function Waves() {
  return (
    <svg className="absolute bottom-0 left-0 w-full h-16 opacity-30" viewBox="0 0 1200 60" preserveAspectRatio="none">
      <motion.path
        d="M0,30 Q300,10 600,30 T1200,30 V60 H0Z"
        fill="#4682B4"
        animate={{ d: ["M0,30 Q300,10 600,30 T1200,30 V60 H0Z", "M0,30 Q300,50 600,30 T1200,30 V60 H0Z", "M0,30 Q300,10 600,30 T1200,30 V60 H0Z"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function Aurora() {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-1/2 opacity-20 pointer-events-none"
      style={{ background: "linear-gradient(180deg, #7B68EE, #40916C, transparent)", filter: "blur(40px)", animation: "aurora 8s ease-in-out infinite" }}
    />
  );
}

export default function Tomos() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="tomos" ref={ref} className="py-24 px-4" style={{ background: "#050d12" }}>
      <motion.h2
        className="font-cinzel text-4xl md:text-5xl text-center text-cream mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        Los 4 Tomos Mágicos
      </motion.h2>
      <motion.p
        className="text-center text-gray-400 mb-16 text-lg"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
      >
        Abre las puertas a mundos extraordinarios
      </motion.p>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {tomos.map((tomo, i) => (
          <motion.div
            key={tomo.num}
            className="relative rounded-2xl overflow-hidden cursor-pointer border border-white/5"
            style={{ perspective: "1000px", minHeight: 280 }}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Door front */}
            <motion.div
              className="absolute inset-0 z-10 flex flex-col justify-end p-6"
              style={{ background: `linear-gradient(135deg, ${tomo.color}22, #050d12)`, backfaceVisibility: "hidden" }}
              animate={{ rotateY: hovered === i ? -25 : 0, originX: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="font-cinzel text-5xl font-bold mb-2" style={{ color: tomo.color, opacity: 0.3 }}>
                {tomo.num}
              </span>
              <h3 className="font-cinzel text-xl text-cream font-bold">Tomo {tomo.num}</h3>
              <p className="font-playfair text-gold text-sm italic">{tomo.title}</p>
            </motion.div>

            {/* World behind door */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end" style={{ background: tomo.bg }}>
              {tomo.effect === "fireflies" && <Fireflies />}
              {tomo.effect === "waves" && <Waves />}
              {tomo.effect === "aurora" && <Aurora />}
              <p className="text-gray-300 text-sm leading-relaxed relative z-10">{tomo.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
