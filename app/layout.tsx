import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Tortuga Sabia — Cuentos mágicos para niños",
  description:
    "Descubre el universo mágico de Quelina, la tortuga sabia. 50 cuentos terapéuticos para niños de 0-9 años. PDF, audiolibro y libro físico.",
  metadataBase: new URL("https://latortugasabia.vercel.app"),
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#050d12",
  openGraph: {
    title: "La Tortuga Sabia — 50 Cuentos Mágicos",
    description: "Cuentos terapéuticos para niños — El universo de Quelina",
    locale: "es_ES",
    type: "website",
    images: ["/images/portada-b.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Tortuga Sabia",
    description: "50 cuentos mágicos para niños de 0-9 años",
    images: ["/images/portada-b.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${playfair.variable} ${inter.variable}`}
    >
      <head>
        <meta charSet="UTF-8" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="La Tortuga Sabia" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "La Tortuga Sabia",
                url: "https://latortugasabia.vercel.app",
              },
              {
                "@context": "https://schema.org",
                "@type": "Book",
                name: "La Tortuga Sabia — El Bosque Encantado",
                author: { "@type": "Person", name: "CUBALIVE" },
                publisher: { "@type": "Organization", name: "PASSKAL LLC" },
                inLanguage: "es",
                genre: "Children's Literature",
                offers: { "@type": "Offer", price: "9.99", priceCurrency: "USD", availability: "https://schema.org/InStock" },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "PASSKAL LLC",
                url: "https://latortugasabia.vercel.app",
                logo: "https://latortugasabia.vercel.app/images/quelina-normal.png",
                sameAs: [
                  "https://tiktok.com/@latortugasabia_official",
                  "https://instagram.com/latortugasabiaofficial",
                  "https://youtube.com/@LaTortugaSabia_official",
                ],
              },
            ]),
          }}
        />
      </head>
      <body className={`${cinzel.variable} ${playfair.variable} min-h-screen bg-dark text-cream antialiased`}>
        {children}
      </body>
    </html>
  );
}
