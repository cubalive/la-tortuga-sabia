"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Inicio", href: "#" },
  { label: "Tomos", href: "#tomos" },
  { label: "Quelina", href: "#quelina" },
  { label: "Cuentos", href: "#cuentos" },
  { label: "Planes", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(5,13,18,0.92)" : "rgba(5,13,18,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "rgba(201,136,42,0.2)" : "transparent"}`,
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <ellipse cx="14" cy="13" rx="9" ry="7" fill="#2D6A4F" />
            <ellipse cx="14" cy="12" rx="7" ry="5" fill="#1B4332" />
            <circle cx="20" cy="12" r="3.5" fill="#40916C" />
            <circle cx="21" cy="11" r="1" fill="#050d12" />
            <circle cx="21.3" cy="10.7" r="0.4" fill="white" />
          </svg>
          <span className="font-cinzel text-sm text-cream font-bold tracking-wider group-hover:text-gold transition-colors">
            La Tortuga Sabia
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm text-gray-300 hover:text-cream transition-colors font-cinzel tracking-wider group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 w-7 h-7 justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <motion.span
            className="w-full h-[2px] bg-cream block origin-center"
            animate={isOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-full h-[2px] bg-cream block"
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="w-full h-[2px] bg-cream block origin-center"
            animate={isOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden border-t border-white/5"
            style={{ background: "rgba(5,13,18,0.95)", backdropFilter: "blur(20px)" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {links.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-gray-300 hover:text-cream font-cinzel text-sm tracking-wider py-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
