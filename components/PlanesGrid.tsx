"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PLANES = [
  {
    id: "tomo_individual",
    nombre: "Tomo Individual",
    precio: "$4.99",
    descripcion: "Acceso completo a un tomo de tu elección",
    features: [
      "33 cuentos completos",
      "Audio narrado por Quelina",
      "Actividades terapéuticas",
      "Acceso permanente",
    ],
    popular: false,
    product: "tomo_individual",
    cta: "Elegir Tomo",
  },
  {
    id: "pack_6",
    nombre: "Pack 6 Tomos",
    precio: "$24.99",
    descripcion: "Los 6 primeros tomos — tomos 1 al 6",
    features: [
      "198 cuentos (6 × 33)",
      "Audio en todos los cuentos",
      "Edades 4-9 años completo",
      "Ahorra vs. tomos individuales",
    ],
    popular: true,
    product: "pack_6",
    cta: "Conseguir Pack",
  },
  {
    id: "pack_completo",
    nombre: "Colección Completa",
    precio: "$29.99",
    descripcion: "Los 7 tomos — 228 cuentos de Quelina",
    features: [
      "228 cuentos completos",
      "Tomos 1-7 (edades 4-12)",
      "Audio en todos los cuentos",
      "Acceso vitalicio",
    ],
    popular: false,
    product: "pack_completo",
    cta: "Colección Completa",
  },
];

const TOMOS = [
  { id: 1, titulo: "El Despertar de Quelina", edades: "4-5 años" },
  { id: 2, titulo: "El Jardín de los Sentimientos", edades: "4-5 años" },
  { id: 3, titulo: "La Montaña del Coraje", edades: "6-7 años" },
  { id: 4, titulo: "El Mar de los Secretos", edades: "6-7 años" },
  { id: 5, titulo: "El Bosque de los Miedos", edades: "8-9 años" },
  { id: 6, titulo: "La Ciudad de los Sueños", edades: "8-9 años" },
  { id: 7, titulo: "El Valle de los Cambios", edades: "10-12 años" },
];

interface PlanesGridProps {
  initialTomo?: number;
}

export default function PlanesGrid({ initialTomo }: PlanesGridProps) {
  const [selectedTomo, setSelectedTomo] = useState<number>(initialTomo ?? 1);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy(product: string) {
    setLoading(product);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          tomo: product === "tomo_individual" ? selectedTomo : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Error al procesar el pago");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {PLANES.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="relative rounded-2xl overflow-hidden"
          >
            {plan.popular && (
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ background: "linear-gradient(135deg, rgba(45,106,79,0.4), transparent)", pointerEvents: "none" }}
              />
            )}
            <div
              className="relative p-7 rounded-2xl h-full flex flex-col"
              style={{
                background: "#0a1a24",
                border: plan.popular
                  ? "1px solid rgba(45,106,79,0.5)"
                  : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {plan.popular && (
                <span
                  className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full font-cinzel tracking-wider"
                  style={{ background: "rgba(45,106,79,0.25)", color: "#40916C" }}
                >
                  Más Popular
                </span>
              )}

              <h3 className="font-cinzel text-lg text-cream font-bold mb-1">{plan.nombre}</h3>
              <p className="text-xs text-gray-400 mb-4 font-playfair">{plan.descripcion}</p>

              <div className="mb-5">
                <span className="text-4xl font-bold text-gold">{plan.precio}</span>
                <span className="text-xs text-gray-500 ml-2">pago único</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-jade mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Tomo selector for individual plan */}
              {plan.id === "tomo_individual" && (
                <select
                  value={selectedTomo}
                  onChange={(e) => setSelectedTomo(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 text-xs text-cream mb-3 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                  }}
                >
                  {TOMOS.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: "#0a1a24" }}>
                      Tomo {t.id}: {t.titulo} ({t.edades})
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => handleBuy(plan.product)}
                disabled={loading === plan.product}
                className="w-full py-3 rounded-2xl font-cinzel text-sm text-cream tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background: plan.popular
                    ? "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)"
                    : "rgba(255,255,255,0.07)",
                  borderBottom: plan.popular ? "3px solid #0d2e1f" : "none",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading === plan.product ? "Procesando..." : plan.cta}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Free tier info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-sm text-gray-400 mb-1">
          ¿Quieres probar primero?
        </p>
        <p className="text-cream font-playfair">
          El <strong>cuento #1 de cada tomo</strong> es gratuito para todos.
          <span className="text-gold"> Sin tarjeta requerida.</span>
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <p className="text-center text-red-400 text-sm mt-4 font-playfair">{error}</p>
      )}
    </div>
  );
}
