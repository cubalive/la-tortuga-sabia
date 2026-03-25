export type Locale = "es" | "en";

export const translations = {
  es: {
    // Nav
    nav: {
      home: "Inicio",
      tomos: "Los Tomos",
      cuentos: "Cuentos",
      pricing: "Planes",
      contact: "Contacto",
    },

    // Hero
    hero: {
      title: "La Tortuga Sabia",
      subtitle: "El universo mágico de Quelina",
      quote:
        "Cada cuento es una estrella que ilumina el corazón de un niño",
      cta1: "Descubre los Cuentos",
      cta2: "Conoce a Quelina",
      scrollHint: "Desliza para explorar",
    },

    // Tomos
    tomos: {
      sectionTitle: "Los 4 Tomos Mágicos",
      sectionSubtitle: "Abre las puertas a mundos extraordinarios",
      tomo1: {
        title: "Tomo I — El Bosque Encantado",
        description:
          "Quelina descubre un bosque donde las luciérnagas guardan secretos antiguos y los árboles susurran canciones de cuna.",
        world: "Bosque Nocturno",
      },
      tomo2: {
        title: "Tomo II — Los Amigos del Camino",
        description:
          "Nuevos amigos se unen a la aventura. Cada animal tiene una canción única y una lección especial para los niños.",
        world: "Bosque Colorido",
      },
      tomo3: {
        title: "Tomo III — El Río de los Sueños",
        description:
          "Un río mágico lleva a Quelina por paisajes de ensueño donde la música cobra vida y los sueños se hacen realidad.",
        world: "Río Mágico",
      },
      tomo4: {
        title: "Tomo IV — La Montaña de la Sabiduría",
        description:
          "La aventura más grande: escalar la montaña donde vive la aurora boreal y descubrir el secreto de la verdadera sabiduría.",
        world: "Montañas Místicas",
      },
    },

    // Quelina Quote
    quelinaQuote: {
      title: "Palabras de Quelina",
      quote:
        "La sabiduría no está en los años que vivimos, sino en las historias que compartimos. Cada niño lleva una estrella dentro, y cada cuento la hace brillar más fuerte.",
      author: "— Quelina, La Tortuga Sabia",
    },

    // Cuentos
    cuentos: {
      sectionTitle: "Cuentos que Inspiran",
      sectionSubtitle: "Historias mágicas para soñar despiertos",
      stories: [
        {
          title: "El Vuelo de las Luciérnagas",
          description: "Una noche especial donde la música ilumina el bosque",
          tag: "Tomo I",
        },
        {
          title: "La Canción del Corazón",
          description: "Quelina enseña que la música vive dentro de cada niño",
          tag: "Tomo I",
        },
        {
          title: "El Amigo Invisible",
          description: "A veces los mejores amigos están más cerca de lo que pensamos",
          tag: "Tomo II",
        },
        {
          title: "El Río que Cantaba",
          description: "Un río mágico que lleva melodías a todos los rincones",
          tag: "Tomo III",
        },
        {
          title: "La Estrella Perdida",
          description: "Una aventura para devolver una estrella al cielo",
          tag: "Tomo IV",
        },
      ],
    },

    // Stats
    stats: {
      stories: "Cuentos Escritos",
      tomos: "Tomos Publicados",
      children: "Niños Inspirados",
    },

    // Social
    social: {
      sectionTitle: "Únete a la Aventura",
      sectionSubtitle: "Síguenos en redes sociales",
      tiktok: "Videos mágicos",
      youtube: "Cuentos en video",
      spotify: "Cuentos en audio",
      instagram: "Momentos mágicos",
    },

    // Pricing
    pricing: {
      sectionTitle: "Planes Mágicos",
      sectionSubtitle: "Elige tu aventura",
      plans: [
        {
          name: "Explorador",
          price: "Gratis",
          period: "",
          features: [
            "3 cuentos de muestra",
            "Acceso a la comunidad",
            "Newsletter semanal",
          ],
          cta: "Empezar Gratis",
          popular: false,
        },
        {
          name: "Aventurero",
          price: "$9.99",
          period: "/mes",
          features: [
            "Todos los cuentos",
            "Audiocuentos con música",
            "Contenido exclusivo",
            "Sin anuncios",
          ],
          cta: "Suscribirse",
          popular: true,
        },
        {
          name: "Sabio",
          price: "$19.99",
          period: "/mes",
          features: [
            "Todo lo de Aventurero",
            "Cuentos personalizados",
            "Acceso anticipado",
            "Merchandise exclusivo",
            "Sesión con autores",
          ],
          cta: "Ser Sabio",
          popular: false,
        },
      ],
    },

    // Footer
    footer: {
      tagline: "Iluminando corazones, un cuento a la vez",
      copyright: "© 2025 PASSKAL",
      rights: "Todos los derechos reservados",
    },

    // Loading
    loading: {
      text: "Preparando la magia...",
    },
  },

  en: {
    nav: {
      home: "Home",
      tomos: "The Tomes",
      cuentos: "Stories",
      pricing: "Plans",
      contact: "Contact",
    },

    hero: {
      title: "La Tortuga Sabia",
      subtitle: "Quelina's magical universe",
      quote:
        "Every story is a star that lights up a child's heart",
      cta1: "Discover the Stories",
      cta2: "Meet Quelina",
      scrollHint: "Scroll to explore",
    },

    tomos: {
      sectionTitle: "The 4 Magical Tomes",
      sectionSubtitle: "Open the doors to extraordinary worlds",
      tomo1: {
        title: "Tome I — The Enchanted Forest",
        description:
          "Quelina discovers a forest where fireflies keep ancient secrets and trees whisper lullabies.",
        world: "Night Forest",
      },
      tomo2: {
        title: "Tome II — Friends Along the Way",
        description:
          "New friends join the adventure. Each animal has a unique song and a special lesson for children.",
        world: "Colorful Forest",
      },
      tomo3: {
        title: "Tome III — The River of Dreams",
        description:
          "A magical river takes Quelina through dreamscapes where music comes alive and dreams come true.",
        world: "Magical River",
      },
      tomo4: {
        title: "Tome IV — The Mountain of Wisdom",
        description:
          "The greatest adventure: climbing the mountain where the northern lights live and discovering the secret of true wisdom.",
        world: "Mystic Mountains",
      },
    },

    quelinaQuote: {
      title: "Words from Quelina",
      quote:
        "Wisdom is not in the years we live, but in the stories we share. Every child carries a star inside, and every story makes it shine brighter.",
      author: "— Quelina, The Wise Turtle",
    },

    cuentos: {
      sectionTitle: "Stories that Inspire",
      sectionSubtitle: "Magical stories to dream wide awake",
      stories: [
        {
          title: "The Flight of the Fireflies",
          description: "A special night where music lights up the forest",
          tag: "Tome I",
        },
        {
          title: "The Song of the Heart",
          description: "Quelina teaches that music lives inside every child",
          tag: "Tome I",
        },
        {
          title: "The Invisible Friend",
          description: "Sometimes the best friends are closer than we think",
          tag: "Tome II",
        },
        {
          title: "The River that Sang",
          description: "A magical river carrying melodies to every corner",
          tag: "Tome III",
        },
        {
          title: "The Lost Star",
          description: "An adventure to return a star to the sky",
          tag: "Tome IV",
        },
      ],
    },

    stats: {
      stories: "Stories Written",
      tomos: "Published Tomes",
      children: "Children Inspired",
    },

    social: {
      sectionTitle: "Join the Adventure",
      sectionSubtitle: "Follow us on social media",
      tiktok: "Magical videos",
      youtube: "Video stories",
      spotify: "Audio stories",
      instagram: "Magical moments",
    },

    pricing: {
      sectionTitle: "Magical Plans",
      sectionSubtitle: "Choose your adventure",
      plans: [
        {
          name: "Explorer",
          price: "Free",
          period: "",
          features: [
            "3 sample stories",
            "Community access",
            "Weekly newsletter",
          ],
          cta: "Start Free",
          popular: false,
        },
        {
          name: "Adventurer",
          price: "$9.99",
          period: "/mo",
          features: [
            "All stories",
            "Audio stories with music",
            "Exclusive content",
            "Ad-free",
          ],
          cta: "Subscribe",
          popular: true,
        },
        {
          name: "Wise",
          price: "$19.99",
          period: "/mo",
          features: [
            "Everything in Adventurer",
            "Personalized stories",
            "Early access",
            "Exclusive merchandise",
            "Author sessions",
          ],
          cta: "Be Wise",
          popular: false,
        },
      ],
    },

    footer: {
      tagline: "Lighting up hearts, one story at a time",
      copyright: "© 2025 PASSKAL",
      rights: "All rights reserved",
    },

    loading: {
      text: "Preparing the magic...",
    },
  },
};

export type Translations = typeof translations.es;

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
