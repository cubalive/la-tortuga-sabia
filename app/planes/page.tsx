import Link from "next/link";
import PlanesGrid from "@/components/PlanesGrid";

export const metadata = {
  title: "Planes | La Tortuga Sabia",
  description: "Desbloquea todos los cuentos de Quelina. Tomos individuales, Pack 6 o Colección Completa.",
};

interface PageProps {
  searchParams: Promise<{ tomo?: string }>;
}

export default async function PlanesPage({ searchParams }: PageProps) {
  const { tomo } = await searchParams;
  const initialTomo = tomo ? parseInt(tomo, 10) : undefined;

  return (
    <div className="min-h-screen" style={{ background: "#050d12" }}>
      <style>{`* { cursor: auto !important; }`}</style>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <Link
          href="/biblioteca"
          className="inline-block text-xs font-cinzel tracking-wider mb-8 transition-colors"
          style={{ color: "rgba(254,250,224,0.4)" }}
        >
          ← Biblioteca
        </Link>

        <div className="text-center mb-12">
          <p
            className="font-cinzel text-xs tracking-widest mb-3"
            style={{ color: "rgba(201,136,42,0.6)" }}
          >
            ACCESO COMPLETO
          </p>
          <h1 className="font-cinzel text-4xl md:text-5xl text-cream font-bold mb-4">
            Planes
          </h1>
          <p className="font-playfair italic text-base max-w-lg mx-auto" style={{ color: "rgba(254,250,224,0.5)" }}>
            Elige el plan que mejor se adapte a tu familia y desbloquea el universo completo de Quelina.
          </p>
        </div>

        {/* What's included */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { icon: "📖", label: "Cuentos completos", sub: "Texto íntegro" },
            { icon: "🔊", label: "Audio narrado", sub: "Voz de Quelina" },
            { icon: "🌱", label: "Actividades", sub: "Por cuento" },
            { icon: "♾️", label: "Acceso vitalicio", sub: "Sin suscripción" },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-2xl mb-2">{item.icon}</p>
              <p className="text-xs font-cinzel text-cream mb-0.5">{item.label}</p>
              <p className="text-xs text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>

        <PlanesGrid initialTomo={initialTomo} />

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="font-cinzel text-xl text-cream font-bold mb-6 text-center">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Es un pago único o una suscripción?",
                a: "Pago único. Acceso permanente sin cargos recurrentes.",
              },
              {
                q: "¿Puedo probar antes de comprar?",
                a: "Sí. El cuento #1 de cada tomo es completamente gratuito — sin necesidad de tarjeta.",
              },
              {
                q: "¿En qué idioma están los cuentos?",
                a: "En español neutro latinoamericano, accesible para niños de toda América Latina y España.",
              },
              {
                q: "¿Para qué edades son los cuentos?",
                a: "Los 7 tomos cubren de 4 a 12 años: Tomos 1-2 (4-5), Tomos 3-4 (6-7), Tomos 5-6 (8-9), Tomo 7 (10-12).",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl px-5 py-4"
                style={{ background: "#0a1a24", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-sm font-cinzel text-cream font-bold mb-1.5">{item.q}</p>
                <p className="text-sm text-gray-400 font-playfair">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
