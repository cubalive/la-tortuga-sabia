"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface RippleData {
  x: number;
  y: number;
  id: number;
}

interface MagicButtonProps {
  type?: "primary" | "secondary" | "gold";
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function MagicButton({
  type = "primary",
  children,
  href,
  onClick,
  className = "",
}: MagicButtonProps) {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const rippleId = useRef(0);

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    rippleId.current += 1;
    setRipples((prev) => [
      ...prev.slice(-3),
      { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current },
    ]);
    onClick?.();
  };

  const base =
    "relative overflow-hidden inline-flex items-center justify-center font-cinzel text-sm tracking-[0.1em] uppercase rounded-full px-8 py-3.5 transition-all duration-300 select-none";

  const variants = {
    primary:
      "text-cream border border-gold/30 shadow-[0_0_20px_rgba(45,106,79,0.5)]",
    secondary:
      "text-gold border-[1.5px] border-gold/60 bg-transparent hover:bg-gold/10",
    gold: "text-dark bg-gold hover:brightness-110 border border-gold-light/50",
  };

  const bgStyle =
    type === "primary"
      ? { background: "linear-gradient(135deg, #2D6A4F, #40916C)" }
      : type === "gold"
        ? { background: "#C9882A" }
        : {};

  const content = (
    <motion.span
      className={`${base} ${variants[type]} ${className}`}
      style={bgStyle}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95, y: 1 }}
      onClick={handleClick}
    >
      {/* Shimmer for secondary */}
      {type === "secondary" && (
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,136,42,0.3) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
          }}
        />
      )}

      {/* Ripple effects */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            background:
              type === "primary"
                ? "rgba(201,136,42,0.4)"
                : type === "gold"
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(201,136,42,0.3)",
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
          animate={{ width: 200, height: 200, x: -100, y: -100, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onAnimationComplete={() =>
            setRipples((prev) => prev.filter((rp) => rp.id !== r.id))
          }
        />
      ))}

      <span className="relative z-10">{children}</span>
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }

  return content;
}
