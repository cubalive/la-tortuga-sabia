"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import { useInView } from "react-intersection-observer";

const tomos = [
  {
    num: "I",
    title: "El Bosque Encantado",
    desc: "Quelina descubre un bosque donde las luciérnagas guardan secretos antiguos y los árboles susurran canciones de cuna.",
    age: "2-4 años",
    bg: "linear-gradient(160deg, #0a2a1a 0%, #050d12 60%)",
    cover: "/images/tomo-1.jpg",
    color: "#40916C",
    effect: "fireflies" as const,
  },
  {
    num: "II",
    title: "Los Amigos del Camino",
    desc: "Nuevos amigos se unen a la aventura. Cada animal tiene una canción única y una lección especial para los niños.",
    age: "3-5 años",
    bg: "linear-gradient(160deg, #1a2a0a 0%, #050d12 60%)",
    cover: "/images/tomo-2.jpg",
    color: "#7B68EE",
    effect: "particles" as const,
  },
  {
    num: "III",
    title: "El Río de los Sueños",
    desc: "Un río mágico lleva a Quelina por paisajes de ensueño donde la música cobra vida y los sueños se hacen realidad.",
    age: "4-6 años",
    bg: "linear-gradient(160deg, #0a1a2a 0%, #050d12 60%)",
    cover: "/images/tomo-3.jpg",
    color: "#4682B4",
    effect: "waves" as const,
  },
  {
    num: "IV",
    title: "La Montaña de la Sabiduría",
    desc: "La aventura más grande: escalar la montaña donde vive la aurora boreal y descubrir el secreto de la verdadera sabiduría.",
    age: "5-8 años",
    bg: "linear-gradient(160deg, #1a0a2a 0%, #050d12 60%)",
    cover: "/images/tomo-4.jpg",
    color: "#C9882A",
    effect: "aurora" as const,
  },
];

/* ═══ Background effects ═══ */
function Fireflies() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 60}%`,
            background: "#E0A840",
            boxShadow: "0 0 6px #E0A840",
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -20, 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </>
  );
}

function Particles() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 70}%`,
            background: ["#7B68EE", "#C9882A", "#40916C", "#DB7093"][i % 4],
            opacity: 0.4,
          }}
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </>
  );
}

function WavesEffect() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full opacity-20 pointer-events-none"
      style={{ height: 80 }}
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,40 Q300,15 600,40 T1200,40 V80 H0Z"
        fill="#4682B4"
        animate={{
          d: [
            "M0,40 Q300,15 600,40 T1200,40 V80 H0Z",
            "M0,40 Q300,65 600,40 T1200,40 V80 H0Z",
            "M0,40 Q300,15 600,40 T1200,40 V80 H0Z",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function AuroraEffect() {
  return (
    <motion.div
      className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, rgba(123,104,238,0.15), rgba(64,145,108,0.1), transparent)",
        filter: "blur(30px)",
      }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const effectMap = {
  fireflies: Fireflies,
  particles: Particles,
  waves: WavesEffect,
  aurora: AuroraEffect,
};

export default function Tomos() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

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
        {tomos.map((tomo, i) => {
          const Effect = effectMap[tomo.effect];
          return (
            <Tilt
              key={tomo.num}
              tiltMaxAngleX={10}
              tiltMaxAngleY={10}
              glareEnable={true}
              glareMaxOpacity={0.2}
              glareColor={tomo.color}
              glareBorderRadius="16px"
              className="rounded-2xl"
            >
            <motion.div
              className="relative rounded-2xl overflow-hidden border border-white/5 group"
              style={{ height: 400, background: tomo.bg }}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
            >
              {/* DALL-E cover image */}
              <Image
                src={tomo.cover}
                alt={`Tomo ${tomo.num} — ${tomo.title}`}
                fill
                className="object-cover"
              />

              {/* Animated background effect */}
              <Effect />

              {/* Hover glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 50%, ${tomo.color}15, transparent 70%)`,
                }}
              />

              {/* Text content — SINGLE block, no duplicates */}
              <div
                className="absolute bottom-0 left-0 right-0 p-6 z-10"
                style={{
                  background: "linear-gradient(transparent, rgba(5,13,18,0.85) 30%)",
                }}
              >
                {/* Roman numeral */}
                <span
                  className="font-cinzel text-6xl font-bold block mb-1"
                  style={{ color: tomo.color, opacity: 0.25 }}
                >
                  {tomo.num}
                </span>

                {/* Title */}
                <h3 className="font-cinzel text-xl text-cream font-bold mb-1">
                  Tomo {tomo.num} — {tomo.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-xs leading-relaxed mb-2" style={{ maxWidth: "90%" }}>
                  {tomo.desc}
                </p>

                {/* Age range badge */}
                <span
                  className="inline-block text-xs px-3 py-1 rounded-full"
                  style={{
                    background: `${tomo.color}20`,
                    color: tomo.color,
                    border: `1px solid ${tomo.color}40`,
                  }}
                >
                  {tomo.age}
                </span>
              </div>
            </motion.div>
            </Tilt>
          );
        })}
      </div>
    </section>
  );
}
