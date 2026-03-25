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
  weight: ["400", "700"],
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
    "Descubre el universo mágico de Quelina, la tortuga sabia. Cuentos, música y aventuras para niños.",
  metadataBase: new URL("https://latortugasabia.com"),
  openGraph: {
    title: "La Tortuga Sabia",
    description: "Cuentos mágicos para niños — El universo de Quelina",
    locale: "es_ES",
    type: "website",
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
      </head>
      <body className="min-h-screen bg-dark text-cream antialiased">
        {children}
      </body>
    </html>
  );
}
