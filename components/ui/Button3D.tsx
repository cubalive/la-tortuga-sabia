"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

function playPop() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

interface Button3DProps {
  children: React.ReactNode;
  variant?: "jade" | "gold" | "wood";
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const VARIANTS = {
  jade: {
    bg: "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)",
    border: "#0d2e1f",
    text: "#FEFAE0",
    glow: "rgba(45,106,79,0.4)",
  },
  gold: {
    bg: "linear-gradient(180deg, #e0a840 0%, #C9882A 40%, #8a5e1a 100%)",
    border: "#6a4510",
    text: "#050d12",
    glow: "rgba(201,136,42,0.4)",
  },
  wood: {
    bg: "linear-gradient(180deg, #8B7355 0%, #6B5340 40%, #4a3728 100%)",
    border: "#2d1f15",
    text: "#FEFAE0",
    glow: "rgba(139,115,85,0.4)",
  },
};

const SIZES = {
  sm: "px-5 py-2 text-xs",
  md: "px-8 py-3.5 text-sm",
  lg: "px-10 py-4 text-base",
};

export default function Button3D({
  children,
  variant = "jade",
  href,
  onClick,
  className = "",
  size = "md",
}: Button3DProps) {
  const [pressed, setPressed] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const v = VARIANTS[variant];

  const spawnParticles = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const newP = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 40,
    }));
    setParticles(newP);
    setTimeout(() => setParticles([]), 600);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    playPop();
    spawnParticles(e);
    onClick?.();
  };

  const content = (
    <motion.button
      className={`relative overflow-hidden font-cinzel tracking-[0.1em] uppercase rounded-2xl select-none cursor-pointer ${SIZES[size]} ${className}`}
      style={{
        background: v.bg,
        borderBottom: pressed ? `2px solid ${v.border}` : `6px solid ${v.border}`,
        color: v.text,
        boxShadow: pressed
          ? `0 2px 0 ${v.border}, 0 4px 10px rgba(0,0,0,0.3)`
          : `0 6px 0 ${v.border}, 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
        transform: pressed ? "translateY(4px)" : "translateY(0px)",
        transition: "all 0.1s ease",
      }}
      whileHover={{ scale: 1.05 }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={handleClick}
    >
      {/* Top highlight */}
      <span
        className="absolute inset-x-0 top-0 h-[40%] rounded-t-2xl pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)" }}
      />
      {/* Click particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ left: p.x, top: p.y, background: "#FFD700" }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0, y: -30 - Math.random() * 20, x: (Math.random() - 0.5) * 40 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );

  if (href) {
    return <a href={href} className="inline-block">{content}</a>;
  }
  return content;
}
