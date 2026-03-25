"use client";

import { useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const PRESETS = {
  stars: {
    particles: {
      number: { value: 60 },
      color: { value: "#C0C0C0" },
      opacity: { value: { min: 0.2, max: 0.8 }, animation: { enable: true, speed: 0.5 } },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 0.3, direction: "none" as const, outModes: { default: "out" as const } },
    },
    detectRetina: true,
  },
  gold: {
    particles: {
      number: { value: 80 },
      color: { value: "#C9882A" },
      opacity: { value: { min: 0.3, max: 0.8 }, animation: { enable: true, speed: 0.8 } },
      size: { value: { min: 1, max: 4 } },
      move: { enable: true, speed: 0.5, direction: "none" as const, outModes: { default: "out" as const } },
    },
    detectRetina: true,
  },
  fireflies: {
    particles: {
      number: { value: 40 },
      color: { value: "#40916C" },
      opacity: { value: { min: 0, max: 1 }, animation: { enable: true, speed: 1.5 } },
      size: { value: { min: 2, max: 5 } },
      move: { enable: true, speed: 0.8, direction: "none" as const, outModes: { default: "out" as const }, random: true },
    },
    detectRetina: true,
  },
};

let engineReady = false;

export default function MagicParticles({ preset = "gold", className = "" }: { preset?: keyof typeof PRESETS; className?: string }) {
  const [ready, setReady] = useState(engineReady);

  useEffect(() => {
    if (engineReady) return;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      engineReady = true;
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <Particles
      className={`absolute inset-0 pointer-events-none ${className}`}
      options={PRESETS[preset] || PRESETS.gold}
    />
  );
}
