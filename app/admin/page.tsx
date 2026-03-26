"use client";

import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "quelina2025";

interface Stats {
  totalStories: number;
  totalVisits: number;
  topCountries: { country: string; count: number }[];
  recentEvents: { event: string; page: string; country: string; created_at: string }[];
  salesTotal: number;
  salesCount: number;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true);
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050d12" }}>
        <div className="text-center">
          <h1 className="font-cinzel text-2xl text-cream mb-4">🐢 Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-cream mb-4 block w-64"
          />
          <button
            onClick={login}
            className="px-6 py-2 rounded-xl text-sm font-cinzel text-cream"
            style={{ background: "#2D6A4F" }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: "#050d12" }}>
      <style>{`* { cursor: auto !important; }`}</style>
      <h1 className="font-cinzel text-3xl text-cream mb-8">Dashboard — La Tortuga Sabia</h1>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Cuentos" value={stats.totalStories} icon="📖" />
          <StatCard label="Visitas" value={stats.totalVisits} icon="👀" />
          <StatCard label="Ventas" value={stats.salesCount} icon="💰" />
          <StatCard label="Revenue" value={`$${stats.salesTotal.toFixed(2)}`} icon="💵" />

          {/* Top Countries */}
          <div className="md:col-span-2 rounded-2xl border border-white/5 p-6" style={{ background: "rgba(10,26,36,0.8)" }}>
            <h3 className="font-cinzel text-sm text-cream mb-4">Top Países</h3>
            {stats.topCountries.length > 0 ? (
              stats.topCountries.map((c) => (
                <div key={c.country} className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{c.country}</span>
                  <span className="text-gold">{c.count} visitas</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs">Sin datos aún</p>
            )}
          </div>

          {/* Recent Events */}
          <div className="md:col-span-3 rounded-2xl border border-white/5 p-6" style={{ background: "rgba(10,26,36,0.8)" }}>
            <h3 className="font-cinzel text-sm text-cream mb-4">Eventos Recientes</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {stats.recentEvents.length > 0 ? (
                stats.recentEvents.map((e, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-400">
                    <span>{e.event} — {e.page}</span>
                    <span>{e.country} · {new Date(e.created_at).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-xs">Sin eventos aún</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">No se pudo cargar</p>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-2xl border border-white/5 p-6" style={{ background: "rgba(10,26,36,0.8)" }}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-3xl font-bold text-cream">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
