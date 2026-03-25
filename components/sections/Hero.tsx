"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import Button3D from "@/components/ui/Button3D";
import MagicParticles from "@/components/effects/MagicParticles";

const HERO_BG = "/images/hero-bg.jpg";

const QuellinaUniverse = dynamic(() => import("@/components/QuellinaUniverse"), { ssr: false });
const ShapeBlur = dynamic(() => import("@/components/effects/ShapeBlur"), { ssr: false });

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  dur: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

export default function Hero() {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowButtons(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Layer 0: WebGL ShapeBlur fluid */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <ShapeBlur
          shapeSize={0.8}
          roundness={0.5}
          borderSize={0.05}
          circleSize={0.3}
          color1="#2D6A4F"
          color2="#C9882A"
          color3="#050d12"
        />
      </div>

      {/* Layer 1: DALL-E hero background */}
      <div className="absolute inset-0">
        <Image
          src={HERO_BG}
          alt="Magical cosmic forest"
          fill
          className="object-cover"
          priority
          style={{ opacity: 0.4 }}
        />
      </div>

      {/* Layer 2: nebulas */}
      <div className="absolute inset-0 nebula-bg pointer-events-none" />

      {/* Layer 3: 3D scene floating over the image */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60vh] md:h-[70vh] opacity-50">
        <QuellinaUniverse />
      </div>

      {/* Layer 4: tsParticles */}
      <MagicParticles preset="gold" />

      {/* Layer 5: golden particles (motion) */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: "#C9882A" }}
          animate={{ y: [0, -25, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Quelina character floating */}
      <motion.div
        className="absolute z-10 pointer-events-none"
        style={{ top: "15%", left: "50%", transform: "translateX(-50%)" }}
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/images/quelina-normal.png"
          alt="Quelina"
          width={300}
          height={300}
          style={{ filter: "drop-shadow(0 0 30px rgba(201,136,42,0.5))" }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center justify-center mt-40 md:mt-48">
        {/* Title — 3D wood texture white */}
        <motion.h1
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6"
          style={{
            fontFamily: "var(--font-playfair)",
            fontWeight: 900,
            fontSize: "clamp(3rem, 8vw, 7rem)",
            color: "transparent",
            backgroundImage: `repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.95) 0px,
              rgba(240,235,220,0.9) 2px,
              rgba(255,255,255,0.95) 3px,
              rgba(230,220,200,0.85) 5px,
              rgba(255,255,255,0.9) 7px,
              rgba(245,238,225,0.95) 10px,
              rgba(255,255,255,0.85) 13px,
              rgba(235,228,215,0.9) 16px,
              rgba(255,255,255,0.95) 20px
            )`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            backgroundSize: "20px 100%",
            textShadow: `
              3px 3px 0px rgba(180,140,80,0.4),
              6px 6px 0px rgba(150,110,60,0.3),
              9px 9px 0px rgba(120,85,40,0.2),
              12px 12px 15px rgba(0,0,0,0.4),
              -1px -1px 0px rgba(255,255,255,0.8),
              0px 0px 30px rgba(255,220,120,0.3)
            `,
            letterSpacing: "0.05em",
            lineHeight: 1.1,
            filter: "drop-shadow(0 0 20px rgba(201,136,42,0.4))",
            textAlign: "center",
          }}
        >
          La Tortuga Sabia
        </motion.h1>

        {/* Subtitle — italic gold gradient */}
        <motion.p
          className="min-h-[2em] mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={showButtons ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontFamily: "var(--font-playfair)",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            color: "transparent",
            backgroundImage: "linear-gradient(135deg, #C9882A, #FFD700, #C9882A)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            filter: "drop-shadow(0 0 10px rgba(201,136,42,0.6))",
          }}
        >
          Cada cuento es una estrella que ilumina el corazón de un niño
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={showButtons ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <Button3D variant="jade" href="#tomos" size="lg">
            Descubre los Cuentos
          </Button3D>
          <Button3D variant="gold" href="/susurro" size="lg">
            ✒️ Habla con Quelina
          </Button3D>
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
