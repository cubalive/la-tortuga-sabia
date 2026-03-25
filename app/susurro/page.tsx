"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Emotion = "thinking" | "happy" | "sad_empathy" | "storytelling" | "wise";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function playWriteSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch {}
}

/* ═══ Animated Quelina SVG ═══ */
function QuelinaSVG({ emotion, listening }: { emotion: Emotion; listening: boolean }) {
  const scaleAnim = emotion === "thinking" ? "animate-pulse" : "";
  const tiltHead = listening ? "rotate(-8deg)" : "rotate(0deg)";

  return (
    <motion.svg
      width="180"
      height="180"
      viewBox="0 0 100 100"
      className={scaleAnim}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Body */}
      <ellipse cx="50" cy="58" rx="28" ry="20" fill="#2D6A4F" />
      {/* Shell */}
      <ellipse cx="50" cy="50" rx="22" ry="18" fill="#1B4332" />
      {/* Shell pattern — constellations */}
      {[
        [42, 44], [50, 40], [58, 44], [46, 50], [54, 50], [50, 56],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="1.5"
          fill="#C9882A"
          animate={{
            opacity: emotion === "storytelling" || emotion === "wise"
              ? [0.3, 1, 0.3]
              : [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      {/* Shell lines */}
      <line x1="42" y1="44" x2="50" y2="40" stroke="#C9882A" strokeWidth="0.5" opacity="0.4" />
      <line x1="50" y1="40" x2="58" y2="44" stroke="#C9882A" strokeWidth="0.5" opacity="0.4" />
      <line x1="46" y1="50" x2="54" y2="50" stroke="#C9882A" strokeWidth="0.5" opacity="0.4" />
      {/* Head */}
      <g style={{ transform: tiltHead, transformOrigin: "65px 52px", transition: "transform 0.5s ease" }}>
        <circle cx="72" cy="52" r="10" fill="#40916C" />
        {/* Eyes */}
        <motion.ellipse
          cx="75" cy="50" rx="2" ry={emotion === "thinking" ? 1 : 2.5}
          fill="#050d12"
          animate={emotion === "thinking" ? { ry: [2.5, 0.5, 2.5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <circle cx="76" cy="49" r="0.8" fill="white" />
        <motion.ellipse
          cx="75" cy="50" rx="2" ry={emotion === "thinking" ? 1 : 2.5}
          fill="#050d12"
          transform="translate(-6, 0)"
        />
        <circle cx="70" cy="49" r="0.8" fill="white" />
        {/* Smile */}
        <path
          d={emotion === "happy" || emotion === "storytelling"
            ? "M68,55 Q72,59 76,55"
            : "M69,55 Q72,57 75,55"}
          fill="none"
          stroke="#1B4332"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
      {/* Legs */}
      <ellipse cx="32" cy="68" rx="6" ry="4" fill="#40916C" />
      <ellipse cx="68" cy="68" rx="6" ry="4" fill="#40916C" />
      <ellipse cx="30" cy="48" rx="5" ry="3.5" fill="#40916C" />
      <ellipse cx="70" cy="70" rx="5" ry="3.5" fill="#40916C" />
      {/* Tail */}
      <motion.ellipse
        cx="23"
        cy="58"
        rx="4"
        ry="2"
        fill="#40916C"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: "27px 58px" }}
      />
    </motion.svg>
  );
}

/* ═══ Typewriter text ═══ */
function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        if (i % 3 === 0) playWriteSound();
        i++;
      } else {
        setDone(true);
        onDone?.();
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text, onDone]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1em] bg-gold ml-0.5 align-middle" style={{ animation: "typewriter-cursor 0.6s infinite" }} />}
    </span>
  );
}

/* ═══ Fireflies background ═══ */
function Fireflies() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3 + Math.random() * 4,
            height: 3 + Math.random() * 4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: "#C9882A",
            boxShadow: "0 0 6px #C9882A",
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -20 - Math.random() * 30, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
}

/* ═══ Main Chat Page ═══ */
export default function SusurroPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState<Emotion>("wise");
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isNight = typeof window !== "undefined"
    ? new Date().getHours() >= 19 || new Date().getHours() < 7
    : false;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setListening(input.length > 0);
  }, [input]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setEmotion("thinking");

    // Check for magic words
    if (userMsg.toLowerCase().includes("magia")) {
      document.getElementById("magic-stars")?.classList.add("active");
      setTimeout(() => document.getElementById("magic-stars")?.classList.remove("active"), 3000);
    }

    try {
      const resp = await fetch("/api/quelina-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setEmotion(data.emotion || "wise");
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Las estrellas están un poquito cansadas ahora... ¿puedes intentar de nuevo? 🌙" },
      ]);
      setEmotion("sad_empathy");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: isNight
          ? "linear-gradient(180deg, #020810 0%, #050d12 40%, #0a1a24 100%)"
          : "linear-gradient(180deg, #050d12 0%, #0a2a1a 40%, #050d12 100%)",
      }}
    >
      {/* BUG 1 FIX: Force visible cursor on this page */}
      <style>{`* { cursor: auto !important; }`}</style>
      {/* Nav back */}
      <div className="p-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-cream transition-colors text-sm font-cinzel flex items-center gap-2">
          ← Volver al bosque
        </Link>
      </div>

      {/* Header */}
      <div className="text-center px-4 pt-2 pb-4">
        <h1 className="font-cinzel text-2xl md:text-3xl text-cream mb-1">
          El Susurro de Quelina
        </h1>
        <p className="font-playfair italic text-gold text-sm">
          Cuéntale algo a Quelina... ella siempre tiene una palabra mágica
        </p>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full px-4 gap-4 min-h-0">
        {/* Quelina */}
        <div className="relative flex-shrink-0 flex flex-col items-center justify-center md:w-56">
          <Fireflies />
          <QuelinaSVG emotion={emotion} listening={listening} />
          <p className="text-xs text-gray-500 mt-2 font-cinzel">
            {emotion === "thinking" ? "Pensando..." : emotion === "happy" ? "😊" : emotion === "storytelling" ? "Contando..." : ""}
          </p>
        </div>

        {/* Chat */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0 rounded-2xl border border-white/5 overflow-hidden" style={{ background: "rgba(5,13,18,0.8)", backdropFilter: "blur(20px)" }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 300 }}>
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm font-playfair italic">
                  Quelina te espera... escríbele algo 🌿
                </p>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-blue-900/30 text-cream border border-blue-800/30 rounded-br-sm"
                        : "border border-gold/20 rounded-bl-sm"
                    }`}
                    style={
                      msg.role === "assistant"
                        ? {
                            background: "linear-gradient(135deg, rgba(30,20,10,0.9), rgba(20,15,8,0.95))",
                            color: "#FEFAE0",
                          }
                        : {}
                    }
                  >
                    {msg.role === "assistant" && i === messages.length - 1 && !loading ? (
                      <TypewriterText text={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-dark-lighter border border-gold/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gold">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    ✨ Quelina piensa...
                  </motion.span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="relative z-50 p-3 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Cuéntale algo a Quelina..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-cream placeholder:text-gray-600 focus:outline-none focus:border-gold/30 transition-colors"
                style={{ zIndex: 50, cursor: "text", position: "relative" }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-3 rounded-xl font-cinzel text-xs tracking-wider transition-all disabled:opacity-30"
                style={{
                  background: "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)",
                  borderBottom: "3px solid #0d2e1f",
                  color: "#FEFAE0",
                  zIndex: 50,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                ✒️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Magic stars overlay */}
      <div id="magic-stars" className="fixed inset-0 pointer-events-none z-50 opacity-0 transition-opacity duration-300 [&.active]:opacity-100">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-lg"
            style={{ left: `${Math.random() * 100}%`, top: `-5%` }}
            animate={{ y: ["0vh", "110vh"], rotate: [0, 360], opacity: [1, 0.5, 0] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      <div className="p-4 text-center">
        <p className="text-xs text-gray-600">
          Quelina usa inteligencia artificial para responder con amor 🌿
        </p>
      </div>
    </div>
  );
}
