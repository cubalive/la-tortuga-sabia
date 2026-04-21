"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #050d12 0%, #0a2a1a 50%, #050d12 100%)" }}
    >
      <motion.div
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <Image
            src="/images/quelina-listening.png"
            alt="Quelina escuchando el bosque"
            width={200}
            height={200}
            priority
            style={{ filter: "drop-shadow(0 0 30px rgba(201,136,42,0.6))", margin: "0 auto" }}
          />
        </motion.div>

        <h1 className="font-cinzel text-6xl md:text-7xl text-gold mb-2 tracking-widest">
          404
        </h1>
        <p className="font-playfair italic text-cream text-xl md:text-2xl mb-3">
          &ldquo;Mmm... dice el viento que este camino no existe en el bosque...&rdquo;
        </p>
        <p className="text-gray-400 text-sm mb-10">
          Quelina no encuentra esta página. Pero hay muchos senderos mágicos esperándote.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl font-cinzel text-sm tracking-wider text-cream"
            style={{
              background: "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)",
              borderBottom: "4px solid #0d2e1f",
            }}
          >
            🐢 Volver al bosque
          </Link>
          <Link
            href="/cuentos"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl font-cinzel text-sm tracking-wider text-gold border border-gold/40"
          >
            📖 Ver cuentos
          </Link>
          <Link
            href="/susurro"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl font-cinzel text-sm tracking-wider text-gold border border-gold/40"
          >
            ✨ Hablar con Quelina
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
