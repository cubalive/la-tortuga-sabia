"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

const stats = [
  {
    value: 200,
    suffix: "",
    label: "Cuentos Escritos",
    effect: "matrix",
    color: "#2D6A4F",
  },
  {
    value: 4,
    suffix: "",
    label: "Tomos Publicados",
    effect: "stars",
    color: "#C9882A",
  },
  {
    value: 1000,
    suffix: "+",
    label: "Niños Inspirados",
    effect: "confetti",
    color: "#7B68EE",
  },
];

function MatrixBg() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-jade font-mono text-xs"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
        >
          {Math.floor(Math.random() * 10)}
        </motion.span>
      ))}
    </div>
  );
}

function StarBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold rounded-full"
          style={{ left: "50%", top: "50%" }}
          initial={{ scale: 0 }}
          animate={{ x: Math.cos((i * Math.PI) / 3) * 40, y: Math.sin((i * Math.PI) / 3) * 40, scale: [0, 1, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.8, delay: 0.1 * i }}
        />
      ))}
    </>
  );
}

function ConfettiPieces({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ left: "50%", top: "50%", background: ["#C9882A", "#2D6A4F", "#7B68EE", "#E0A840"][i % 4] }}
          initial={{ y: 0, x: 0, opacity: 1 }}
          animate={{ y: -60 - Math.random() * 40, x: (Math.random() - 0.5) * 80, opacity: 0, rotate: 360 }}
          transition={{ duration: 1.2, delay: Math.random() * 0.3 }}
        />
      ))}
    </>
  );
}

export default function Stats() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setDone(true), 2200);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <section ref={ref} className="py-24 px-4" style={{ background: "linear-gradient(180deg, #0a2a1a, #050d12)" }}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="relative text-center p-8 rounded-2xl border border-white/5 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.2, duration: 0.6 }}
          >
            {stat.effect === "matrix" && <MatrixBg />}
            <div className="relative z-10">
              <div className="font-cinzel text-5xl md:text-6xl font-bold mb-2" style={{ color: stat.color }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                {stat.effect === "stars" && <StarBurst active={done} />}
                {stat.effect === "confetti" && <ConfettiPieces active={done} />}
              </div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
