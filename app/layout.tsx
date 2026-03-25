import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        {/* Google Fonts loaded via CSS for Cinzel, Playfair Display, Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-dark text-cream antialiased">
        {children}
      </body>
    </html>
  );
}
