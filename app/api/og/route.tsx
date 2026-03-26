import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "La Tortuga Sabia";
  const subtitle = searchParams.get("subtitle") || "Cuentos terapéuticos para niños";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #050d12 0%, #0a2a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div style={{ position: "absolute", top: 40, left: 40, fontSize: 24, color: "#2D6A4F", letterSpacing: "4px" }}>
          LATORTUGASABIA.COM
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, color: "#C9882A", textAlign: "center", marginBottom: 24, lineHeight: 1.2, maxWidth: "900px" }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#FEFAE0", fontStyle: "italic", textAlign: "center", maxWidth: "700px" }}>
          {subtitle}
        </div>
        <div style={{ position: "absolute", bottom: 40, fontSize: 20, color: "rgba(254,250,224,0.4)" }}>
          por CUBALIVE · PASSKAL LLC
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
