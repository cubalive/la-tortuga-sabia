"use client";

import { motion } from "framer-motion";
import { FaTiktok, FaYoutube, FaSpotify, FaInstagram } from "react-icons/fa";

const links = [
  { Icon: FaTiktok, href: "https://tiktok.com/@latortugasabia_official" },
  { Icon: FaYoutube, href: "https://youtube.com/@LaTortugaSabia_official" },
  { Icon: FaSpotify, href: "https://open.spotify.com" },
  { Icon: FaInstagram, href: "https://instagram.com/latortugasabiaofficial" },
];

export default function Footer() {
  return (
    <footer className="relative py-16 px-4 overflow-hidden" style={{ background: "#050d12" }}>
      {/* Star field */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.4 + 0.05,
          }}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Mini Quelina */}
        <motion.svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          className="mx-auto mb-6"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="24" cy="22" rx="13" ry="11" fill="#2D6A4F" />
          <path d="M17 18 Q24 13 31 18" stroke="#C9882A" strokeWidth="0.8" fill="none" opacity="0.5" />
          <path d="M16 22 Q24 16 32 22" stroke="#C9882A" strokeWidth="0.8" fill="none" opacity="0.5" />
          <circle cx="35" cy="23" r="4" fill="#2D6A4F" />
          <circle cx="36" cy="22" r="1" fill="#C9882A" />
          <path d="M17 30l-2 6M22 31l-1 5M26 31l1 5M31 30l2 6" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>

        <p className="font-playfair italic text-gray-500 text-sm mb-6">
          Iluminando corazones, un cuento a la vez
        </p>

        {/* Social links */}
        <div className="flex justify-center gap-4 mb-8">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-cream transition-colors"
            >
              <link.Icon size={18} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-gold/40 text-xs tracking-wider">
          © 2025 PASSKAL
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
