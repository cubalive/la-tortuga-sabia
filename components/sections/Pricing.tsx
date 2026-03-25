"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import MagicButton from "@/components/ui/MagicButton";

const plans = [
  {
    name: "Explorador",
    price: "Gratis",
    period: "",
    features: ["3 cuentos de muestra", "Acceso a la comunidad", "Newsletter semanal"],
    cta: "Empezar Gratis",
    popular: false,
  },
  {
    name: "Aventurero",
    price: "$9.99",
    period: "/mes",
    features: ["Todos los cuentos", "Audiocuentos con música", "Contenido exclusivo", "Sin anuncios"],
    cta: "Suscribirse",
    popular: true,
  },
  {
    name: "Sabio",
    price: "$19.99",
    period: "/mes",
    features: ["Todo lo de Aventurero", "Cuentos personalizados", "Acceso anticipado", "Merchandise exclusivo", "Sesión con autores"],
    cta: "Ser Sabio",
    popular: false,
  },
];

function HoloCard({
  plan,
  index,
  inView,
}: {
  plan: (typeof plans)[number];
  index: number;
  inView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gradient, setGradient] = useState("transparent");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGradient(`radial-gradient(circle at ${x}% ${y}%, rgba(201,136,42,0.15), transparent 60%)`);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
      whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
      style={{ perspective: "800px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setGradient("transparent")}
    >
      {/* Shimmer border for popular */}
      {plan.popular && (
        <div className="absolute inset-0 rounded-2xl p-[2px] shimmer-border">
          <div className="absolute inset-[2px] rounded-[14px] bg-[#0a1a24]" />
        </div>
      )}

      <div
        className={`relative z-10 p-8 rounded-2xl border ${
          plan.popular ? "border-transparent" : "border-white/5"
        } bg-[#0a1a24]`}
        style={{ backgroundImage: gradient }}
      >
        {plan.popular && (
          <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-gold/20 text-gold font-semibold">
            Popular
          </span>
        )}

        <h3 className="font-cinzel text-xl text-cream font-bold mb-2">{plan.name}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gold">{plan.price}</span>
          <span className="text-gray-400 text-sm">{plan.period}</span>
        </div>

        <ul className="space-y-3 mb-8">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-jade">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <MagicButton type={plan.popular ? "primary" : "secondary"} className="w-full">
          {plan.cta}
        </MagicButton>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 px-4" style={{ background: "#050d12" }}>
      <motion.h2
        className="font-cinzel text-4xl md:text-5xl text-center text-cream mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        Planes Mágicos
      </motion.h2>
      <motion.p
        className="text-center text-gray-400 mb-16 text-lg"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        Elige tu aventura
      </motion.p>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <HoloCard key={plan.name} plan={plan} index={i} inView={inView} />
        ))}
      </div>
    </section>
  );
}
