"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Trail {
  x: number;
  y: number;
  id: number;
}

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isMobile, setIsMobile] = useState(true);
  const trailId = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      trailId.current += 1;
      const newTrail: Trail = {
        x: e.clientX,
        y: e.clientY,
        id: trailId.current,
      };
      setTrails((prev) => [...prev.slice(-4), newTrail]);
    },
    []
  );

  useEffect(() => {
    if (isMobile) return;

    window.addEventListener("mousemove", handleMouseMove);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        setIsHovering(true);
      }
    };

    const handleOut = () => setIsHovering(false);

    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mouseout", handleOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mouseout", handleOut);
    };
  }, [isMobile, handleMouseMove]);

  // Clean up old trails
  useEffect(() => {
    if (trails.length === 0) return;
    const timeout = setTimeout(() => {
      setTrails((prev) => prev.slice(1));
    }, 300);
    return () => clearTimeout(timeout);
  }, [trails]);

  if (isMobile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Trail particles */}
      {trails.map((trail, i) => (
        <div
          key={trail.id}
          className="absolute rounded-full"
          style={{
            left: trail.x - 3,
            top: trail.y - 3,
            width: 6,
            height: 6,
            background: `rgba(201, 136, 42, ${0.2 + i * 0.15})`,
            transform: `scale(${0.5 + i * 0.1})`,
            transition: "opacity 0.3s ease-out",
          }}
        />
      ))}

      {/* Main cursor */}
      <div
        className="absolute"
        style={{
          left: position.x - (isHovering ? 16 : 12),
          top: position.y - (isHovering ? 16 : 12),
          transition: "transform 0.1s ease-out",
        }}
      >
        {isHovering ? (
          /* Star shape on hover */
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 2L19.5 12.5L30 16L19.5 19.5L16 30L12.5 19.5L2 16L12.5 12.5L16 2Z"
              fill="#C9882A"
              opacity="0.9"
            />
            <path
              d="M16 6L18.5 13.5L26 16L18.5 18.5L16 26L13.5 18.5L6 16L13.5 13.5L16 6Z"
              fill="#E0A840"
            />
          </svg>
        ) : (
          /* Turtle footprint */
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main pad */}
            <ellipse cx="12" cy="14" rx="4" ry="5" fill="#C9882A" opacity="0.9" />
            {/* Toes */}
            <circle cx="7" cy="8" r="2.2" fill="#C9882A" opacity="0.8" />
            <circle cx="17" cy="8" r="2.2" fill="#C9882A" opacity="0.8" />
            <circle cx="5" cy="13" r="1.8" fill="#C9882A" opacity="0.7" />
            <circle cx="19" cy="13" r="1.8" fill="#C9882A" opacity="0.7" />
          </svg>
        )}
      </div>
    </div>
  );
}
