"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function GraciasPage() {
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
        {/* Quelina happy */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <Image
            src="/images/quelina-happy.png"
            alt="Quelina feliz"
            width={200}
            height={200}
            style={{ filter: "drop-shadow(0 0 30px rgba(201,136,42,0.6))", margin: "0 auto" }}
          />
        </motion.div>

        <h1 className="font-cinzel text-3xl md:text-4xl text-cream mb-4">
          ¡Gracias por tu compra!
        </h1>
        <p className="font-playfair italic text-gold text-lg mb-2">
          Las estrellas de Quelina ya brillan por ti 🌟
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Revisa tu email para el recibo y el link de descarga.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/downloads/la-tortuga-sabia-tomo-1.pdf"
            download
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl font-cinzel text-sm tracking-wider text-cream"
            style={{
              background: "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)",
              borderBottom: "4px solid #0d2e1f",
            }}
          >
            📖 Descargar PDF
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl font-cinzel text-sm tracking-wider text-gold border border-gold/40"
          >
            ← Volver al bosque
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
