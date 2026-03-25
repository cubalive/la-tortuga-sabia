"use client";

import { useEffect } from "react";

function createRipple(x: number, y: number) {
  const rings = 3;
  for (let i = 0; i < rings; i++) {
    const el = document.createElement("div");
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      border: 1px solid rgba(201, 136, 42, 0.3);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      animation: ripple-expand 600ms ${i * 100}ms ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700 + i * 100);
  }
}

export default function RippleEffect() {
  useEffect(() => {
    // Inject animation keyframes
    if (!document.getElementById("ripple-styles")) {
      const style = document.createElement("style");
      style.id = "ripple-styles";
      style.textContent = `
        @keyframes ripple-expand {
          0% { width: 0; height: 0; opacity: 0.6; }
          100% { width: 200px; height: 200px; opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const handleClick = (e: MouseEvent) => {
      createRipple(e.clientX, e.clientY);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return null;
}
