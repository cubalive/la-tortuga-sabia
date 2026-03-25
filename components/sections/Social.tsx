"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaTiktok, FaYoutube, FaSpotify, FaInstagram } from "react-icons/fa";

const socials = [
  {
    name: "TikTok",
    handle: "@latortugasabia_official",
    Icon: FaTiktok,
    href: "https://tiktok.com/@latortugasabia_official",
    color: "#ffffff",
    hoverColor: "#000000",
    hoverBg: "rgba(255,255,255,0.9)",
    glow: "rgba(255,255,255,0.4)",
    desc: "Videos mágicos",
  },
  {
    name: "YouTube",
    handle: "@LaTortugaSabia_official",
    Icon: FaYoutube,
    href: "https://youtube.com/@LaTortugaSabia_official",
    color: "#FF0000",
    hoverColor: "#cc0000",
    hoverBg: "transparent",
    glow: "rgba(255,0,0,0.4)",
    desc: "Cuentos en video",
  },
  {
    name: "Spotify",
    handle: "La Tortuga Sabia",
    Icon: FaSpotify,
    href: "https://open.spotify.com",
    color: "#1DB954",
    hoverColor: "#17a349",
    hoverBg: "transparent",
    glow: "rgba(29,185,84,0.4)",
    desc: "Cuentos en audio",
  },
  {
    name: "Instagram",
    handle: "@latortugasabiaofficial",
    Icon: FaInstagram,
    href: "https://instagram.com/latortugasabiaofficial",
    color: "#E1306C",
    hoverColor: "#c13584",
    hoverBg: "transparent",
    glow: "rgba(225,48,108,0.4)",
    desc: "Momentos mágicos",
  },
];

function SoundWaves() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 mx-0.5 rounded-full bg-jade"
          animate={{ scaleY: [0.3, 0.5 + Math.random() * 0.5, 0.3] }}
          transition={{ duration: 0.8 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
          style={{ height: 60 }}
        />
      ))}
    </div>
  );
}

function SocialCard({ social, index, inView }: { social: typeof socials[number]; index: number; inView: boolean }) {
  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="glass rounded-2xl p-6 flex flex-col items-center text-center group"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2 + index * 0.1 }}
      whileHover={{ y: -12, scale: 1.05, boxShadow: `0 0 30px ${social.glow}` }}
    >
      <motion.div
        className="mb-4 rounded-xl p-3 transition-all duration-300"
        whileHover={{ scale: 1.2 }}
      >
        <social.Icon
          size={64}
          style={{ color: social.color }}
        />
      </motion.div>
      <span className="font-semibold text-cream text-sm mb-1">{social.name}</span>
      <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{social.desc}</span>
      <span className="text-xs text-gold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {social.handle}
      </span>
    </motion.a>
  );
}

export default function Social() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="relative py-24 px-4 overflow-hidden" style={{ background: "#050d12" }}>
      <SoundWaves />

      <motion.h2
        className="font-cinzel text-4xl md:text-5xl text-center text-cream mb-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        Únete a la Aventura
      </motion.h2>
      <motion.p
        className="text-center text-gray-400 mb-16 text-lg relative z-10"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        Síguenos en redes sociales
      </motion.p>

      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        {socials.map((social, i) => (
          <SocialCard key={social.name} social={social} index={i} inView={inView} />
        ))}
      </div>
    </section>
  );
}
