"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  duracionSegundos?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AudioPlayer({ audioUrl, duracionSegundos }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(duracionSegundos ?? 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("ended", () => { setPlaying(false); setCurrentTime(0); });
    audio.addEventListener("waiting", () => setLoading(true));
    audio.addEventListener("playing", () => setLoading(false));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      await audio.play();
      setPlaying(true);
    }
  }, [playing]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  }, [duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-5 py-4"
      style={{ background: "rgba(45,106,79,0.12)", border: "1px solid rgba(45,106,79,0.3)" }}
    >
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        disabled={loading}
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
        style={{
          background: "linear-gradient(135deg, #40916C, #2D6A4F)",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
        aria-label={playing ? "Pausar" : "Reproducir"}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
            <rect x="2" y="1" width="4" height="12" rx="1" />
            <rect x="8" y="1" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
            <polygon points="2,1 12,7 2,13" />
          </svg>
        )}
      </button>

      {/* Progress bar */}
      <div className="flex-1 min-w-0">
        <div
          className="h-1.5 rounded-full overflow-hidden cursor-pointer"
          style={{ background: "rgba(255,255,255,0.1)" }}
          onClick={seek}
          role="slider"
          aria-label="Progreso del audio"
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #40916C, #C9882A)" }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs" style={{ color: "rgba(254,250,224,0.4)" }}>
          <span>{formatTime(currentTime)}</span>
          {duration > 0 && <span>{formatTime(duration)}</span>}
        </div>
      </div>

      {/* Quelina icon */}
      <span className="text-lg shrink-0" aria-hidden>🐢</span>
    </div>
  );
}
