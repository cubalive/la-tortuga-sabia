"use client";

interface SectionDividerProps {
  variant?: "wave" | "fade";
  colorFrom?: string;
  colorTo?: string;
  flip?: boolean;
}

export default function SectionDivider({
  variant = "wave",
  colorFrom = "#050d12",
  colorTo = "#050d12",
  flip = false,
}: SectionDividerProps) {
  if (variant === "fade") {
    return (
      <div
        className="h-16 -mt-1 -mb-1"
        style={{
          background: `linear-gradient(${flip ? "0deg" : "180deg"}, ${colorFrom}, ${colorTo})`,
        }}
      />
    );
  }

  return (
    <div className="relative -mt-1 -mb-1" style={{ background: colorTo }}>
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="w-full block"
        style={{
          height: 60,
          transform: flip ? "scaleY(-1)" : undefined,
        }}
      >
        <path
          d="M0,0 C360,50 1080,50 1440,0 L1440,60 L0,60 Z"
          fill={colorFrom}
        />
        <path
          d="M0,20 C480,60 960,60 1440,20 L1440,60 L0,60 Z"
          fill={colorFrom}
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
