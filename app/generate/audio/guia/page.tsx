import Link from "next/link";

const steps = [
  {
    number: 1,
    title: "Genera el prompt desde el dashboard",
    description:
      "Ve al Tab 2 (Música Suno) en el panel de audio. Selecciona un cuento y haz clic en \"Generar\". Claude creará un prompt musical y una letra de canción optimizados para Suno.",
    mockup: {
      type: "dashboard",
      content: [
        "Panel de Audio → Tab: Música Suno",
        "─────────────────────────────",
        "# | Título            | Prompt | Acciones",
        "1 | El Bosque Mágico  |   ⏳   | [Generar]",
        "2 | La Estrella       |   ✓    | [Ver prompt]",
      ],
    },
  },
  {
    number: 2,
    title: 'Ve a suno.com → "Create"',
    description:
      'Abre suno.com en tu navegador. Inicia sesión con tu cuenta. Haz clic en el botón "Create" en la barra lateral izquierda.',
    mockup: {
      type: "suno",
      content: [
        "┌──────────────────────────────┐",
        "│  🎵 SUNO                     │",
        "│                              │",
        "│  🏠 Home                     │",
        "│  🔍 Explore                  │",
        "│  ✨ Create  ← CLIC AQUÍ     │",
        "│  📚 Library                  │",
        "│                              │",
        "└──────────────────────────────┘",
      ],
    },
  },
  {
    number: 3,
    title: 'Activa "Custom Mode"',
    description:
      'En la página de creación, busca el toggle "Custom" y actívalo. Esto te permitirá pegar el prompt y la letra que generamos.',
    mockup: {
      type: "suno",
      content: [
        "┌──────────────────────────────┐",
        "│  Create                      │",
        "│                              │",
        "│  ○ Auto   ● Custom ← ACTIVA │",
        "│                              │",
        "│  Style of Music: _________   │",
        "│  Lyrics: ________________    │",
        "│          ________________    │",
        "│                              │",
        "└──────────────────────────────┘",
      ],
    },
  },
  {
    number: 4,
    title: 'Pega el prompt en "Style of Music"',
    description:
      'Vuelve al dashboard, haz clic en "Ver prompt" y copia el prompt musical. Pégalo en el campo "Style of Music" de Suno.',
    mockup: {
      type: "suno",
      content: [
        "Style of Music:",
        "┌──────────────────────────────┐",
        "│ Gentle lullaby, soft piano,  │",
        "│ warm strings, 55 BPM, no     │",
        "│ percussion, sleep music,     │",
        "│ children's folk              │",
        "└──────────────────────────────┘",
      ],
    },
  },
  {
    number: 5,
    title: 'Pega la letra en "Lyrics"',
    description:
      "Copia la letra de canción desde el dashboard y pégala en el campo de Lyrics. La letra ya está optimizada en español neutro para niños.",
    mockup: {
      type: "suno",
      content: [
        "Lyrics:",
        "┌──────────────────────────────┐",
        "│ En el bosque encantado       │",
        "│ donde brilla la luna         │",
        "│ una tortuga sabia           │",
        "│ canta esta canción de cuna   │",
        "│                              │",
        "│ [Coro]                       │",
        "│ Quelina, Quelina...          │",
        "└──────────────────────────────┘",
      ],
    },
  },
  {
    number: 6,
    title: 'Haz clic en "Create" → espera 30 segundos',
    description:
      "Suno generará 2 versiones de la canción. Escucha ambas y elige la que más te guste. La generación toma aproximadamente 30 segundos.",
    mockup: {
      type: "suno",
      content: [
        "┌──────────────────────────────┐",
        "│       [ 🎵 Create ]          │",
        "│                              │",
        "│  Generando...  ████░░░ 60%   │",
        "│                              │",
        "│  ♪ Versión 1  ▶ 0:00/2:15   │",
        "│  ♪ Versión 2  ▶ 0:00/2:08   │",
        "│                              │",
        "└──────────────────────────────┘",
      ],
    },
  },
  {
    number: 7,
    title: "Descarga el MP3",
    description:
      'Haz clic en los tres puntos (...) junto a la versión que elegiste y selecciona "Download" → "Audio". Se descargará un archivo .mp3.',
    mockup: {
      type: "suno",
      content: [
        "♪ El Bosque Encantado  ▶  2:15",
        "                          ...",
        "┌──────────────────┐",
        "│  Share            │",
        "│  Download         │",
        "│    → Audio  ← ✓  │",
        "│    → Video        │",
        "│  Add to Playlist  │",
        "└──────────────────┘",
      ],
    },
  },
  {
    number: 8,
    title: "Súbelo en el dashboard",
    description:
      'Vuelve al Tab 2 del dashboard, haz clic en "Ver prompt" del cuento correspondiente y arrastra el MP3 a la zona de upload. ¡Listo!',
    mockup: {
      type: "dashboard",
      content: [
        "┌──────────────────────────────┐",
        "│  ¿Ya tienes el MP3?          │",
        "│                              │",
        "│  ┌────────────────────────┐  │",
        "│  │                        │  │",
        "│  │  Arrastra tu MP3 aquí  │  │",
        "│  │  o haz clic            │  │",
        "│  │                        │  │",
        "│  └────────────────────────┘  │",
        "│                              │",
        "│  ✓ MP3 guardado: El Bosque   │",
        "└──────────────────────────────┘",
      ],
    },
  },
];

export default function SunoGuiaPage() {
  return (
    <div className="min-h-screen bg-dark text-cream">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/generate/audio"
            className="text-sm text-jade-light hover:text-jade transition-colors"
          >
            ← Volver al Panel de Audio
          </Link>
          <h1 className="text-3xl font-bold text-gold mt-4">
            Guía: Cómo usar Suno AI
          </h1>
          <p className="text-gray-400 mt-2">
            Paso a paso para generar música para los cuentos de La Tortuga
            Sabia
          </p>
        </div>

        {/* Info box */}
        <div className="bg-jade/10 border border-jade/30 rounded-xl p-4 mb-8">
          <p className="text-sm text-jade-light">
            <strong>Nota:</strong> Suno ofrece 50 créditos gratuitos al día (10
            canciones). Para el proyecto completo, considera el plan Pro ($10/mes
            = 500 canciones/mes).
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Step header */}
              <div className="flex items-center gap-4 p-4 bg-white/5">
                <div className="w-10 h-10 rounded-full bg-jade flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {step.number}
                </div>
                <h2 className="text-lg font-semibold">{step.title}</h2>
              </div>

              {/* Step content */}
              <div className="p-4">
                <p className="text-gray-300 text-sm mb-4">
                  {step.description}
                </p>

                {/* Mockup */}
                <div
                  className={`rounded-lg p-4 font-mono text-xs leading-relaxed ${
                    step.mockup.type === "suno"
                      ? "bg-[#1a1a2e] border border-purple-500/20 text-purple-200"
                      : "bg-[#0a1a24] border border-jade/20 text-jade-light"
                  }`}
                >
                  {step.mockup.content.map((line, i) => (
                    <div key={i} className="whitespace-pre">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DistroKid section */}
        <div className="mt-12 border border-gold/20 rounded-xl p-6 bg-gold/5">
          <h2 className="text-xl font-bold text-gold mb-4">
            Publicar en Spotify via DistroKid
          </h2>
          <p className="text-gray-300 text-sm mb-4">
            Una vez que tengas todos los MP3 de un tomo, puedes publicarlos
            como álbum en Spotify, Apple Music, y más.
          </p>
          <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside mb-4">
            <li>Descarga todos los MP3 de Suno</li>
            <li>Súbelos en el Tab 2 del dashboard</li>
            <li>
              Crea una cuenta en DistroKid ($22.99/año)
            </li>
            <li>
              Sube como álbum: &quot;La Tortuga Sabia — Tomo I&quot;
            </li>
            <li>Completa metadatos: artista, portada, género</li>
            <li>Elige las plataformas (Spotify, Apple Music, etc.)</li>
            <li>En 1-3 días estará disponible</li>
          </ol>
          <p className="text-xs text-gray-500">
            Tip: Usa las portadas generadas con DALL-E como artwork del álbum.
          </p>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/generate/audio"
            className="inline-block px-6 py-3 rounded-xl bg-jade hover:bg-jade-light text-white font-medium transition-colors"
          >
            Volver al Panel de Audio
          </Link>
        </div>
      </div>
    </div>
  );
}
