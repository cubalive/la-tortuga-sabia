"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type QuelinaState = "idle" | "listening" | "happy" | "sleeping";

const QUELINA_IMAGES: Record<QuelinaState, string> = {
  idle: "/images/quelina-normal.png",
  listening: "/images/quelina-listening.png",
  happy: "/images/quelina-happy.png",
  sleeping: "/images/quelina-sleeping.png",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MSG = "Las estrellas me avisaron que vendrías... ¿qué tiene tu corazón que contarme hoy? 🌙";

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

/* ═══ Typewriter ═══ */
function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        if (i % 3 === 0) playWriteSound();
        i++;
      } else {
        clearInterval(timer);
      }
    }, 35);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-middle"
          style={{ background: "#C9882A", animation: "typewriter-cursor 0.7s infinite" }}
        />
      )}
    </span>
  );
}

/* ═══ Quelina Image (state-based poses) ═══ */
function QuelinaImage({ state, talking }: { state: QuelinaState; talking: boolean }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={talking ? "quelina-talking" : ""}
    >
      <Image
        src={QUELINA_IMAGES[state]}
        alt="Quelina"
        width={250}
        height={250}
        style={{ filter: "drop-shadow(0 0 20px rgba(201,136,42,0.5))" }}
        priority
      />
    </motion.div>
  );
}

/* ═══ Fireflies ═══ */
function Fireflies() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3 + Math.random() * 4, height: 3 + Math.random() * 4,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            background: "#C9882A", boxShadow: "0 0 6px #C9882A",
          }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -25, 0], x: [0, (Math.random() - 0.5) * 30, 0] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
        />
      ))}
    </div>
  );
}

/* ═══ Main Page ═══ */
export default function SusurroPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_MSG },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [talking, setTalking] = useState(true);
  const [quelinaState, setQuelinaState] = useState<QuelinaState>("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isNight = typeof window !== "undefined"
    ? new Date().getHours() >= 19 || new Date().getHours() < 7
    : false;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Welcome animation: stop talking after typewriter finishes
  useEffect(() => {
    const t = setTimeout(() => setTalking(false), WELCOME_MSG.length * 35 + 500);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setLoading(true);
    setTalking(false);
    setQuelinaState("listening");

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    // Magic words
    if (userMsg.toLowerCase().includes("magia")) {
      document.getElementById("magic-stars")?.classList.add("active");
      setTimeout(() => document.getElementById("magic-stars")?.classList.remove("active"), 3000);
    }

    try {
      const res = await fetch("/api/quelina-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (data.response) {
        setTalking(true);
        setQuelinaState("happy");
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        // Return to idle after typewriter finishes
        setTimeout(() => {
          setTalking(false);
          setQuelinaState("idle");
        }, data.response.length * 35 + 2000);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "🌿 El bosque susurra... inténtalo de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: isNight
          ? "linear-gradient(180deg, #020810 0%, #050d12 40%, #0a1a24 100%)"
          : "linear-gradient(180deg, #050d12 0%, #0a2a1a 40%, #050d12 100%)",
      }}
    >
      <style>{`
        * { cursor: auto !important; }
        .quelina-talking {
          animation: quelina-glow 0.5s ease-in-out infinite alternate;
        }
        @keyframes quelina-glow {
          from { filter: drop-shadow(0 0 8px rgba(201,136,42,0.4)); }
          to { filter: drop-shadow(0 0 20px rgba(201,136,42,0.8)); }
        }
      `}</style>

      {/* Nav */}
      <div className="p-4">
        <Link href="/" className="text-gray-400 hover:text-cream transition-colors text-sm font-cinzel">
          ← Volver al bosque
        </Link>
      </div>

      {/* Header */}
      <div className="text-center px-4 pt-2 pb-4">
        <h1 className="font-cinzel text-2xl md:text-3xl text-cream mb-1">El Susurro de Quelina</h1>
        <p className="font-playfair italic text-gold text-sm">
          Cuéntale algo a Quelina... ella siempre tiene una palabra mágica
        </p>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full px-4 gap-4 min-h-0">
        {/* Quelina */}
        <div className="relative flex-shrink-0 flex flex-col items-center justify-center md:w-56">
          <Fireflies />
          <QuelinaImage state={quelinaState} talking={talking} />
          <p className="text-xs text-gray-500 mt-2 font-cinzel">
            {loading ? "🐢 Pensando..." : talking ? "✨ Hablando..." : ""}
          </p>
        </div>

        {/* Chat */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0 rounded-2xl border border-white/5 overflow-hidden" style={{ background: "rgba(5,13,18,0.8)", backdropFilter: "blur(20px)" }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 300, maxHeight: "60vh" }}>
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && <span className="text-lg mr-2 mt-1">🐢</span>}
                  <div
                    className="max-w-[80%] px-4 py-3 text-sm"
                    style={
                      msg.role === "user"
                        ? {
                            background: "rgba(45,106,79,0.5)",
                            color: "#FEFAE0",
                            borderRadius: "18px 18px 4px 18px",
                            border: "1px solid rgba(45,106,79,0.3)",
                          }
                        : {
                            background: "rgba(201,136,42,0.12)",
                            color: "#FEFAE0",
                            borderRadius: "18px 18px 18px 4px",
                            border: "1px solid rgba(201,136,42,0.35)",
                            fontFamily: "var(--font-playfair)",
                            fontStyle: "italic",
                          }
                    }
                  >
                    {msg.role === "assistant" && i === messages.length - 1 ? (
                      <TypewriterText text={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center">
                <span className="text-lg mr-2">🐢</span>
                <div
                  className="px-4 py-3 text-sm"
                  style={{
                    background: "rgba(201,136,42,0.12)",
                    borderRadius: "18px 18px 18px 4px",
                    border: "1px solid rgba(201,136,42,0.25)",
                  }}
                >
                  <motion.span
                    className="text-gold font-playfair italic"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    🐢 ...
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
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.length > 0 && !loading) setQuelinaState("listening");
                  else if (!loading && !talking) setQuelinaState("idle");
                }}
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

      {/* Magic stars */}
      <div id="magic-stars" className="fixed inset-0 pointer-events-none z-50 opacity-0 transition-opacity duration-300 [&.active]:opacity-100">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-lg"
            style={{ left: `${Math.random() * 100}%`, top: "-5%" }}
            animate={{ y: ["0vh", "110vh"], rotate: [0, 360], opacity: [1, 0.5, 0] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      <div className="p-4 text-center">
        <p className="text-xs text-gray-600">Quelina usa inteligencia artificial para responder con amor 🌿</p>
      </div>
    </div>
  );
}
