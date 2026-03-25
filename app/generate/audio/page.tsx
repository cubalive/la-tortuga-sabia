"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════
   Types
   ═══════════════════════════════════════ */

interface Story {
  id: string;
  numero: number;
  titulo: string;
  title?: string;
  tomo: number;
  content?: string;
  texto?: string;
  narration_url?: string;
  quelina_audio_url?: string;
  suno_prompt?: string;
  suno_lyrics?: string;
  suno_audio_url?: string;
  suno_status?: string;
  tts_status?: string;
}

interface CostEntry {
  service: string;
  operation: string;
  cost_usd: number;
}

/* ═══════════════════════════════════════
   Mini Audio Player
   ═══════════════════════════════════════ */

function MiniPlayer({ src, label }: { src: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-jade/20 hover:bg-jade/40 flex items-center justify-center text-sm transition-colors"
        title={label}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   Confirm Modal
   ═══════════════════════════════════════ */

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0a1a24] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gold mb-3">{title}</h3>
        <p className="text-gray-300 text-sm mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-jade hover:bg-jade-light text-white transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Suno Prompt Modal
   ═══════════════════════════════════════ */

function SunoPromptModal({
  story,
  open,
  onClose,
  onUpload,
}: {
  story: Story | null;
  open: boolean;
  onClose: () => void;
  onUpload: (storyId: string, file: File) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open || !story) return null;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(story.id, file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto">
      <div className="bg-[#0a1a24] border border-white/10 rounded-xl p-6 max-w-lg w-full mx-4 my-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gold">
            {story.titulo || story.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {story.suno_prompt ? (
          <>
            {/* Prompt section */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">
                Prompt para Suno:
              </label>
              <div className="bg-black/40 rounded-lg p-3 text-sm text-cream border border-white/5">
                {story.suno_prompt}
              </div>
              <button
                onClick={() => copyText(story.suno_prompt!, "prompt")}
                className="mt-2 text-xs px-3 py-1 rounded bg-jade/20 hover:bg-jade/40 text-jade-light transition-colors"
              >
                {copied === "prompt" ? "✓ Copiado" : "Copiar prompt"}
              </button>
            </div>

            {/* Lyrics section */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">
                Letra:
              </label>
              <div className="bg-black/40 rounded-lg p-3 text-sm text-cream border border-white/5 max-h-48 overflow-y-auto whitespace-pre-line">
                {story.suno_lyrics}
              </div>
              <button
                onClick={() => copyText(story.suno_lyrics!, "lyrics")}
                className="mt-2 text-xs px-3 py-1 rounded bg-jade/20 hover:bg-jade/40 text-jade-light transition-colors"
              >
                {copied === "lyrics" ? "✓ Copiado" : "Copiar letra"}
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm mb-4">
            Prompt aún no generado para este cuento.
          </p>
        )}

        {/* Upload section */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm text-gray-300 mb-2">
            ¿Ya tienes el MP3 de Suno?
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={handleFile}
            className="hidden"
          />
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) onUpload(story.id, file);
            }}
            className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-jade/50 transition-colors"
          >
            <p className="text-gray-400 text-sm">
              Arrastra tu MP3 aquí o haz clic para seleccionar
            </p>
            <p className="text-gray-500 text-xs mt-1">Solo archivos .mp3</p>
          </div>

          {story.suno_audio_url && (
            <div className="mt-3">
              <MiniPlayer src={story.suno_audio_url} label="Suno MP3" />
              <p className="text-xs text-green-400 mt-1">
                ✓ MP3 guardado para: {story.titulo || story.title}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Full Audio Preview Player (Web Audio API mix)
   ═══════════════════════════════════════ */

function FullPreviewPlayer({ story }: { story: Story }) {
  const [playing, setPlaying] = useState(false);
  const [withMusic, setWithMusic] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const narrationRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const connectedRef = useRef(false);

  const setupAudioContext = useCallback(() => {
    if (connectedRef.current || !narrationRef.current) return;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const narrationSource = ctx.createMediaElementSource(
      narrationRef.current
    );
    narrationSource.connect(ctx.destination);

    if (musicRef.current) {
      const musicSource = ctx.createMediaElementSource(musicRef.current);
      const musicGain = ctx.createGain();
      musicGain.gain.value = 0.15;
      musicGainRef.current = musicGain;
      musicSource.connect(musicGain);
      musicGain.connect(ctx.destination);
    }

    connectedRef.current = true;
  }, []);

  const togglePlay = () => {
    setupAudioContext();
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (playing) {
      narrationRef.current?.pause();
      musicRef.current?.pause();
    } else {
      narrationRef.current?.play();
      if (withMusic) musicRef.current?.play();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    if (musicGainRef.current) {
      musicGainRef.current.gain.value = withMusic ? 0.15 : 0;
    }
    if (!withMusic) {
      musicRef.current?.pause();
    } else if (playing) {
      musicRef.current?.play();
    }
  }, [withMusic, playing]);

  useEffect(() => {
    const narration = narrationRef.current;
    if (!narration) return;
    const onTime = () => {
      if (narration.duration) {
        setProgress((narration.currentTime / narration.duration) * 100);
      }
    };
    const onEnd = () => {
      setPlaying(false);
      musicRef.current?.pause();
    };
    narration.addEventListener("timeupdate", onTime);
    narration.addEventListener("ended", onEnd);
    return () => {
      narration.removeEventListener("timeupdate", onTime);
      narration.removeEventListener("ended", onEnd);
    };
  }, []);

  return (
    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
      <audio ref={narrationRef} src={story.narration_url} preload="none" />
      {story.suno_audio_url && (
        <audio ref={musicRef} src={story.suno_audio_url} preload="none" loop />
      )}

      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-sm font-semibold text-cream flex-1">
          {story.titulo || story.title}
        </h4>
        <span className="text-xs text-gray-500">Tomo {story.tomo}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-3 cursor-pointer"
        onClick={(e) => {
          if (!narrationRef.current?.duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          narrationRef.current.currentTime = pct * narrationRef.current.duration;
        }}
      >
        <div
          className="h-full bg-jade rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-jade hover:bg-jade-light flex items-center justify-center text-white transition-colors"
        >
          {playing ? "⏸" : "▶"}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-gray-400">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (narrationRef.current) narrationRef.current.volume = v;
            }}
            className="flex-1 h-1 accent-jade"
          />
        </div>

        {/* Music toggle */}
        {story.suno_audio_url && (
          <button
            onClick={() => setWithMusic(!withMusic)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              withMusic
                ? "border-jade text-jade bg-jade/10"
                : "border-white/20 text-gray-400"
            }`}
          >
            {withMusic ? "♪ Con música" : "Sin música"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════ */

export default function AudioDashboard() {
  const [tab, setTab] = useState<"tts" | "suno" | "preview">("tts");
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedTomo, setSelectedTomo] = useState(1);
  const [loading, setLoading] = useState(true);
  const [costs, setCosts] = useState<CostEntry[]>([]);

  // Modal states
  const [confirmModal, setConfirmModal] = useState(false);
  const [sunoModal, setSunoModal] = useState<Story | null>(null);

  // SSE progress
  const [sseProgress, setSseProgress] = useState<{
    active: boolean;
    current: number;
    total: number;
    titulo: string;
    fase: string;
  } | null>(null);

  // Load stories
  useEffect(() => {
    loadStories();
    loadCosts();
  }, [selectedTomo]);

  async function loadStories() {
    setLoading(true);
    const { data } = await supabase
      .from("stories")
      .select("*")
      .eq("tomo", selectedTomo)
      .order("numero", { ascending: true });
    setStories(data || []);
    setLoading(false);
  }

  async function loadCosts() {
    const { data } = await supabase
      .from("api_costs")
      .select("service, operation, cost_usd");
    setCosts(data || []);
  }

  // Generate single TTS
  async function generateSingleTTS(storyId: string) {
    try {
      const res = await fetch("/api/audio/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId }),
      });
      if (res.ok) {
        await loadStories();
        await loadCosts();
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  // Generate all TTS via SSE
  async function generateAllTTS() {
    setConfirmModal(false);
    setSseProgress({
      active: true,
      current: 0,
      total: 0,
      titulo: "",
      fase: "",
    });

    try {
      const res = await fetch("/api/audio/generate-all-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tomo: selectedTomo }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.tipo === "progress" || data.tipo === "story_done") {
                setSseProgress({
                  active: true,
                  current: data.numero,
                  total: data.total,
                  titulo: data.titulo,
                  fase: data.fase || "completado",
                });
              } else if (data.tipo === "complete") {
                setSseProgress(null);
                await loadStories();
                await loadCosts();
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      console.error("SSE Error:", err);
      setSseProgress(null);
    }
  }

  // Generate single Suno prompt
  async function generateSingleSunoPrompt(storyId: string) {
    try {
      const res = await fetch("/api/audio/generate-suno-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId }),
      });
      if (res.ok) {
        await loadStories();
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  // Upload Suno MP3
  async function uploadSunoMp3(storyId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storyId", storyId);

    try {
      const res = await fetch("/api/audio/upload-suno", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSunoModal(null);
        await loadStories();
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  }

  // Stats calculations
  const totalStories = stories.length;
  const narrationDone = stories.filter(
    (s) => s.tts_status === "narration_done" || s.tts_status === "complete"
  ).length;
  const quelinaDone = stories.filter(
    (s) => s.tts_status === "complete"
  ).length;
  const promptsReady = stories.filter(
    (s) => s.suno_status === "prompt_ready" || s.suno_status === "uploaded"
  ).length;
  const sunoUploaded = stories.filter(
    (s) => s.suno_status === "uploaded"
  ).length;

  // Cost breakdown
  const costByCategory = costs.reduce(
    (acc, c) => {
      if (c.service === "openai-tts" && c.operation === "narration") {
        acc.ttsNarrator += c.cost_usd;
      } else if (c.service === "openai-tts" && c.operation === "quelina-voice") {
        acc.ttsQuelina += c.cost_usd;
      } else if (c.service === "openai-dalle") {
        acc.dalle += c.cost_usd;
      } else {
        acc.other += c.cost_usd;
      }
      return acc;
    },
    { dalle: 0, ttsNarrator: 0, ttsQuelina: 0, other: 0 }
  );
  const totalCost =
    costByCategory.dalle +
    costByCategory.ttsNarrator +
    costByCategory.ttsQuelina +
    costByCategory.other;
  const budget = 100;

  // Full preview stories (have all 3 audios)
  const previewStories = stories.filter(
    (s) => s.narration_url && s.quelina_audio_url
  );

  return (
    <div className="min-h-screen bg-dark text-cream">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="text-2xl font-bold text-gold">
          Panel de Audio
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Generación de narración TTS + Música Suno
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { key: "tts" as const, label: "Narración (TTS)" },
          { key: "suno" as const, label: "Música Suno" },
          { key: "preview" as const, label: "Preview Final" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "text-gold border-b-2 border-gold bg-white/5"
                : "text-gray-400 hover:text-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tomo Selector */}
      <div className="px-6 py-4 flex gap-2">
        {[1, 2, 3, 4].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTomo(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTomo === t
                ? "bg-jade text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Tomo {t}
          </button>
        ))}
      </div>

      <div className="px-6 pb-8">
        {/* ═══ TAB 1: TTS Narración ═══ */}
        {tab === "tts" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total cuentos" value={totalStories} />
              <StatCard
                label="Narración generada"
                value={`${narrationDone} / ${totalStories}`}
              />
              <StatCard
                label="Voz Quelina"
                value={`${quelinaDone} / ${totalStories}`}
              />
              <StatCard
                label="Costo TTS"
                value={`$${(costByCategory.ttsNarrator + costByCategory.ttsQuelina).toFixed(2)} / $25.00`}
              />
            </div>

            {/* Batch generate button */}
            <button
              onClick={() => setConfirmModal(true)}
              disabled={sseProgress?.active}
              className="mb-4 px-6 py-3 rounded-xl bg-jade hover:bg-jade-light text-white font-medium transition-colors disabled:opacity-50"
            >
              {sseProgress?.active
                ? "Generando..."
                : `Generar TTS para todos los cuentos del Tomo ${selectedTomo}`}
            </button>

            {/* SSE Progress */}
            {sseProgress?.active && (
              <div className="mb-4 bg-black/30 rounded-xl p-4 border border-jade/30">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-cream">
                    {sseProgress.titulo} — {sseProgress.fase}
                  </span>
                  <span className="text-gold">
                    {sseProgress.current} / {sseProgress.total}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-jade rounded-full transition-all duration-500"
                    style={{
                      width: sseProgress.total
                        ? `${(sseProgress.current / sseProgress.total) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Stories Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="text-left py-3 px-2">#</th>
                    <th className="text-left py-3 px-2">Título</th>
                    <th className="text-left py-3 px-2">Narración</th>
                    <th className="text-left py-3 px-2">Quelina</th>
                    <th className="text-left py-3 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        Cargando...
                      </td>
                    </tr>
                  ) : stories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No hay cuentos en el Tomo {selectedTomo}
                      </td>
                    </tr>
                  ) : (
                    stories.map((story) => (
                      <tr
                        key={story.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-3 px-2 text-gray-400">
                          {story.numero}
                        </td>
                        <td className="py-3 px-2">
                          {story.titulo || story.title}
                        </td>
                        <td className="py-3 px-2">
                          {story.narration_url ? (
                            <MiniPlayer
                              src={story.narration_url}
                              label="Narración"
                            />
                          ) : (
                            <span className="text-gray-500">⏳ pending</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {story.quelina_audio_url ? (
                            <MiniPlayer
                              src={story.quelina_audio_url}
                              label="Quelina"
                            />
                          ) : (
                            <span className="text-gray-500">⏳ pending</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {story.tts_status === "complete" ? (
                            <button
                              onClick={() => generateSingleTTS(story.id)}
                              className="text-xs px-3 py-1 rounded bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
                            >
                              Regenerar
                            </button>
                          ) : (
                            <button
                              onClick={() => generateSingleTTS(story.id)}
                              className="text-xs px-3 py-1 rounded bg-jade/20 text-jade-light hover:bg-jade/30 transition-colors"
                            >
                              Generar TTS
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: Música Suno ═══ */}
        {tab === "suno" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                label="Prompts generados"
                value={`${promptsReady} / ${totalStories}`}
              />
              <StatCard
                label="MP3 subidos"
                value={`${sunoUploaded} / ${totalStories}`}
              />
            </div>

            {/* Batch generate prompts */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={async () => {
                  const pending = stories.filter(
                    (s) => !s.suno_prompt
                  );
                  for (const story of pending) {
                    await generateSingleSunoPrompt(story.id);
                  }
                  await loadStories();
                }}
                className="px-6 py-3 rounded-xl bg-jade hover:bg-jade-light text-white font-medium transition-colors"
              >
                Generar prompts para Tomo {selectedTomo}
              </button>
              <a
                href="/generate/audio/guia"
                className="px-6 py-3 rounded-xl border border-gold/30 text-gold hover:bg-gold/10 font-medium transition-colors"
              >
                Guía de Suno →
              </a>
            </div>

            {/* Stories Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="text-left py-3 px-2">#</th>
                    <th className="text-left py-3 px-2">Título</th>
                    <th className="text-left py-3 px-2">Prompt</th>
                    <th className="text-left py-3 px-2">Letra</th>
                    <th className="text-left py-3 px-2">MP3</th>
                    <th className="text-left py-3 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Cargando...
                      </td>
                    </tr>
                  ) : (
                    stories.map((story) => (
                      <tr
                        key={story.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-3 px-2 text-gray-400">
                          {story.numero}
                        </td>
                        <td className="py-3 px-2">
                          {story.titulo || story.title}
                        </td>
                        <td className="py-3 px-2">
                          {story.suno_prompt ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="text-gray-500">⏳</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {story.suno_lyrics ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="text-gray-500">⏳</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {story.suno_audio_url ? (
                            <MiniPlayer
                              src={story.suno_audio_url}
                              label="Suno"
                            />
                          ) : (
                            <span className="text-gray-500">⏳</span>
                          )}
                        </td>
                        <td className="py-3 px-2 flex gap-2">
                          {story.suno_prompt ? (
                            <button
                              onClick={() => setSunoModal(story)}
                              className="text-xs px-3 py-1 rounded bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
                            >
                              Ver prompt
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                generateSingleSunoPrompt(story.id)
                              }
                              className="text-xs px-3 py-1 rounded bg-jade/20 text-jade-light hover:bg-jade/30 transition-colors"
                            >
                              Generar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: Preview Final ═══ */}
        {tab === "preview" && (
          <div>
            {/* Preview players */}
            <div className="space-y-4 mb-8">
              {previewStories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">
                    No hay cuentos con audio completo todavía
                  </p>
                  <p className="text-sm">
                    Genera narración en el Tab 1 primero
                  </p>
                </div>
              ) : (
                previewStories.map((story) => (
                  <FullPreviewPlayer key={story.id} story={story} />
                ))
              )}
            </div>

            {/* Distribution Card */}
            <div className="bg-black/30 rounded-xl p-6 border border-white/10 mb-8 max-w-md">
              <h3 className="text-lg font-bold text-gold mb-4">
                Distribuir en Spotify
              </h3>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside mb-4">
                <li>Descarga MP3s de suno.com</li>
                <li>Súbelos en el Tab 2</li>
                <li>Ve a DistroKid</li>
                <li>Crea álbum del Tomo</li>
                <li>En 1-3 días en Spotify</li>
              </ol>
              <div className="flex gap-3">
                <a
                  href="/generate/audio/guia"
                  className="text-sm px-4 py-2 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  Ver guía completa →
                </a>
              </div>
            </div>

            {/* Cost Tracker */}
            <div className="bg-black/30 rounded-xl p-6 border border-white/10 max-w-md">
              <h3 className="text-lg font-bold text-gold mb-4">
                Budget OpenAI: ${budget.toFixed(2)}
              </h3>

              {/* Progress bar */}
              <div className="w-full h-3 bg-white/10 rounded-full mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((totalCost / budget) * 100, 100)}%`,
                    background:
                      totalCost / budget > 0.8
                        ? "#ef4444"
                        : totalCost / budget > 0.5
                          ? "#eab308"
                          : "#2D6A4F",
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {((totalCost / budget) * 100).toFixed(0)}% usado
              </p>

              <div className="space-y-2 text-sm">
                <CostRow
                  label="DALL-E 3"
                  value={costByCategory.dalle}
                />
                <CostRow
                  label="TTS Narrador"
                  value={costByCategory.ttsNarrator}
                />
                <CostRow
                  label="TTS Quelina"
                  value={costByCategory.ttsQuelina}
                />
                <CostRow label="Otros" value={costByCategory.other} />
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-gold">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Restante</span>
                  <span>${(budget - totalCost).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={generateAllTTS}
        title={`Generar TTS — Tomo ${selectedTomo}`}
        message={`Esto generará ${totalStories} narraciones + ${totalStories} voces de Quelina.\n\nCosto estimado: ~$${(totalStories * 0.04).toFixed(2)}\n\n¿Continuar?`}
      />

      <SunoPromptModal
        story={sunoModal}
        open={!!sunoModal}
        onClose={() => setSunoModal(null)}
        onUpload={uploadSunoMp3}
      />
    </div>
  );
}

/* ═══ Helper Components ═══ */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-cream">{value}</p>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-gray-300">
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
