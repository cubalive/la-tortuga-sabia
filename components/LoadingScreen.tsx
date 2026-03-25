"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
          style={{ background: "#050d12" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Quelina SVG with stroke animation */}
          <motion.svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Shell */}
            <motion.ellipse
              cx="60"
              cy="55"
              rx="35"
              ry="30"
              stroke="#2D6A4F"
              strokeWidth="2.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Shell pattern */}
            <motion.path
              d="M40 40 Q60 30 80 40"
              stroke="#C9882A"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
            <motion.path
              d="M35 50 Q60 38 85 50"
              stroke="#C9882A"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
            <motion.path
              d="M38 60 Q60 48 82 60"
              stroke="#C9882A"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.7 }}
            />
            {/* Head */}
            <motion.circle
              cx="95"
              cy="58"
              r="10"
              stroke="#2D6A4F"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            />
            {/* Eye */}
            <motion.circle
              cx="98"
              cy="55"
              r="2"
              fill="#C9882A"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            />
            {/* Legs */}
            <motion.path
              d="M40 75 L35 90 M55 78 L52 92 M65 78 L68 92 M80 75 L85 90"
              stroke="#2D6A4F"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
            {/* Tail */}
            <motion.path
              d="M25 58 Q18 55 20 50"
              stroke="#2D6A4F"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            />
            {/* Stars around */}
            <motion.path
              d="M15 20 L17 26 L23 26 L18 30 L20 36 L15 32 L10 36 L12 30 L7 26 L13 26Z"
              fill="#C9882A"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 }}
            />
            <motion.path
              d="M100 15 L101.5 19 L106 19 L102.5 21.5 L103.5 25.5 L100 23 L96.5 25.5 L97.5 21.5 L94 19 L98.5 19Z"
              fill="#C9882A"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 }}
            />
          </motion.svg>

          {/* Progress bar */}
          <div className="mt-8 w-48 h-1 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #2D6A4F, #40916C)",
                boxShadow: "0 0 10px rgba(45, 106, 79, 0.5)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Text */}
          <motion.p
            className="mt-4 text-lg italic"
            style={{
              color: "#C9882A",
              fontFamily: "var(--font-playfair), serif",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Preparando la magia...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
