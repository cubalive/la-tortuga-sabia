"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmailCapture() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!email.trim() || !name.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gold font-playfair italic text-lg">
              ✨ ¡Bienvenido al bosque, {name.split(" ")[0]}!
            </p>
            <p className="text-gray-400 text-sm mt-2">Quelina te escribirá pronto 🌙</p>
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-3">
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-full px-5 py-3 text-sm text-cream placeholder:text-gray-600 focus:outline-none focus:border-gold/30 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,136,42,0.3)" }}
            />
            <input
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full rounded-full px-5 py-3 text-sm text-cream placeholder:text-gray-600 focus:outline-none focus:border-gold/30 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,136,42,0.3)" }}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading" || !email.trim() || !name.trim()}
              className="w-full rounded-full px-5 py-3 text-sm font-cinzel tracking-wider text-cream disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)", borderBottom: "3px solid #0d2e1f" }}
            >
              {status === "loading" ? "Enviando..." : "🌿 Suscribirme"}
            </button>
            {status === "error" && (
              <p className="text-red-400 text-xs">Algo salió mal, intenta de nuevo.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
