"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export default function ScrambleText({
  text,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}) {
  const [display, setDisplay] = useState(text);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  const hasRun = useRef(false);

  useEffect(() => {
    if (!inView || hasRun.current) return;
    hasRun.current = true;

    const length = text.length;
    const iterations = 6;
    let frame = 0;

    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (frame / iterations > i / length) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      frame++;
      if (frame >= length * iterations) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [inView, text]);

  return (
    <Tag ref={ref} className={className}>
      {display}
    </Tag>
  );
}
