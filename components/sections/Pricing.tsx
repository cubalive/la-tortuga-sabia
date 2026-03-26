"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import MagicButton from "@/components/ui/MagicButton";

const formats = [
  {
    name: "Digital",
    price: "$9.99",
    description: "Descarga instantánea",
    features: [
      "50 cuentos del Tomo I",
      "250 ilustraciones a color",
      "Formato PDF de alta calidad",
      "Acceso inmediato",
    ],
    cta: "Descargar Ahora",
    popular: false,
    buttonType: "secondary" as const,
  },
  {
    name: "Premium",
    price: "$19.99",
    description: "La experiencia completa",
    features: [
      "Todo lo del PDF Digital",
      "Audiolibro narrado (50 MP3)",
      "Voz especial de Quelina",
      "Música original Suno",
      "QR en cada cuento → audio",
    ],
    cta: "Conseguir Ahora",
    popular: true,
    buttonType: "primary" as const,
  },
  {
    name: "Libro Físico",
    price: "$24.99",
    description: "Impreso y enviado a tu puerta",
    features: [
      "Libro impreso tapa dura",
      "108 páginas a color",
      "QR codes para el audio",
      "📦 Envío gratis en USA (5-7 días)",
      "Solo envíos dentro de USA",
      "PDF digital incluido",
    ],
    cta: "Ordenar Ahora",
    popular: false,
    buttonType: "secondary" as const,
  },
];

function FormatCard({
  format,
  index,
  inView,
}: {
  format: (typeof formats)[number];
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
      {format.popular && (
        <div className="absolute inset-0 rounded-2xl p-[2px]" style={{ background: "var(--jade)", }} />
      )}

      <div
        className={`relative z-10 p-8 rounded-2xl ${
          format.popular ? "border-2 border-jade" : "border border-white/5"
        } bg-[#0a1a24] h-full flex flex-col`}
        style={{ backgroundImage: gradient }}
      >
        {format.popular && (
          <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-gold/20 text-gold font-semibold">
            Más Popular
          </span>
        )}

        <h3 className="font-cinzel text-xl text-cream font-bold mb-1">{format.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{format.description}</p>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gold">{format.price}</span>
          <span className="text-sm text-gray-500 ml-2">pago único</span>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {format.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-jade">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <MagicButton type={format.buttonType} className="w-full" onClick={async () => {
          try {
            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ product: format.name === "Digital" ? "digital" : format.name === "Premium" ? "premium" : "fisico" }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
          } catch {}
        }}>
          {format.cta}
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
        El Libro
      </motion.h2>
      <motion.p
        className="text-center text-gray-400 mb-16 text-lg font-playfair italic"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        Elige tu forma de leer con Quelina
      </motion.p>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {formats.map((format, i) => (
          <FormatCard key={format.name} format={format} index={i} inView={inView} />
        ))}
      </div>

      {/* Colección Completa */}
      <motion.div
        className="max-w-2xl mx-auto mt-16 text-center rounded-2xl border border-gold/20 bg-[#0a1a24] p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <p className="text-gray-400 mb-2 text-sm">¿Quieres los 4 tomos?</p>
        <h3 className="font-cinzel text-2xl text-cream font-bold mb-1">Colección Completa</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold text-gold">$49.99</span>
        </div>
        <p className="text-sm text-gray-400 mb-6">Todos los formatos de los 4 tomos</p>
        <MagicButton type="secondary" className="mx-auto">
          Ver Colección
        </MagicButton>
      </motion.div>
    </section>
  );
}
