"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BookReader from "@/components/BookReader";
import { supabase } from "@/lib/supabase";

interface Props {
  tomo: number;
  num: number;
}

type State =
  | { status: "loading" }
  | { status: "locked"; upgradeUrl: string; reason: string }
  | { status: "error"; message: string }
  | { status: "ready"; story: Record<string, unknown>; audio: Record<string, unknown> | null; total: number };

export default function BookReaderWrapper({ tomo, num }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id ?? null;

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (userId) headers["x-user-id"] = userId;

        const [storyRes, tomoRes] = await Promise.all([
          fetch(`/api/stories/${tomo}/${num}`, { headers }),
          fetch(`/api/stories/${tomo}`, { headers }),
        ]);

        if (storyRes.status === 403) {
          const body = await storyRes.json();
          setState({
            status: "locked",
            upgradeUrl: body.upgrade_url ?? "/planes",
            reason: body.reason ?? "no_plan",
          });
          return;
        }

        if (!storyRes.ok) {
          const body = await storyRes.json().catch(() => ({}));
          setState({ status: "error", message: body.error ?? "Error cargando el cuento" });
          return;
        }

        const { story, audio } = await storyRes.json();
        const tomoData = tomoRes.ok ? await tomoRes.json() : null;
        const total = tomoData?.tomo?.total_cuentos ?? story.tomo === 7 ? 30 : 33;

        setState({ status: "ready", story, audio, total });
      } catch (err) {
        console.error(err);
        setState({ status: "error", message: "No se pudo cargar el cuento" });
      }
    }

    load();
  }, [tomo, num]);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050d12" }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🐢</div>
          <p className="text-sm font-cinzel tracking-widest" style={{ color: "rgba(254,250,224,0.4)" }}>
            Cargando cuento...
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#050d12" }}>
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">😔</p>
          <p className="font-cinzel text-cream mb-2">Cuento no encontrado</p>
          <p className="text-sm text-gray-500 mb-6">{state.message}</p>
          <Link
            href={`/biblioteca/tomo/${tomo}`}
            className="text-xs font-cinzel tracking-wider text-jade hover:text-jade-light"
          >
            ← Volver al tomo
          </Link>
        </div>
      </div>
    );
  }

  if (state.status === "locked") {
    const isUnauthenticated = state.reason === "unauthenticated";

    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#050d12" }}>
        <div
          className="text-center max-w-sm w-full rounded-3xl p-8"
          style={{ background: "#0a1a24", border: "1px solid rgba(201,136,42,0.2)" }}
        >
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="font-cinzel text-cream text-xl font-bold mb-2">
            {isUnauthenticated ? "Inicia sesión" : "Contenido Premium"}
          </h2>
          <p className="text-sm text-gray-400 mb-6 font-playfair">
            {isUnauthenticated
              ? "Crea una cuenta para acceder a todos los cuentos de Quelina."
              : `Este cuento forma parte del Tomo ${tomo}. Desblócalo para continuar la historia.`}
          </p>

          <Link
            href={state.upgradeUrl}
            className="inline-block w-full py-3 rounded-2xl font-cinzel text-sm text-cream tracking-wider mb-3 transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(180deg, #4a8f6a 0%, #2D6A4F 40%, #1a4a35 100%)",
              borderBottom: "3px solid #0d2e1f",
            }}
          >
            {isUnauthenticated ? "Crear cuenta gratis" : "Ver planes"}
          </Link>

          <Link
            href={`/biblioteca/tomo/${tomo}`}
            className="text-xs font-cinzel tracking-wider"
            style={{ color: "rgba(254,250,224,0.3)" }}
          >
            ← Volver al tomo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <BookReader
      story={state.story as Parameters<typeof BookReader>[0]["story"]}
      audio={state.audio as Parameters<typeof BookReader>[0]["audio"]}
      totalCuentos={state.total}
    />
  );
}
