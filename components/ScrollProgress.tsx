"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress((scrollTop / docHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 h-full w-1">
      <div
        className="w-full rounded-b-full transition-all duration-150 ease-out"
        style={{
          height: `${progress}%`,
          background:
            "linear-gradient(to bottom, #2D6A4F, #40916C, #C9882A)",
          boxShadow: "0 0 8px rgba(45, 106, 79, 0.6)",
        }}
      />
    </div>
  );
}
