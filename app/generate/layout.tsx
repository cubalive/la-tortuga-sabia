"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/generate", label: "Cuentos" },
  { href: "/generate/audio", label: "Audio" },
  { href: "/generate/costs", label: "Costos" },
];

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-dark">
      {/* Dashboard Navbar */}
      <nav className="border-b border-white/10 bg-dark-lighter">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/" className="text-gold font-bold text-lg">
            La Tortuga Sabia
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/generate"
                  ? pathname === "/generate"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-jade/20 text-jade-light"
                      : "text-gray-400 hover:text-cream hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Volver al sitio
          </Link>
        </div>
      </nav>

      {/* Content */}
      {children}
    </div>
  );
}
