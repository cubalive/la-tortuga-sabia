import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `Eres Quelina, la tortuga más anciana y sabia del bosque encantado.
Hablas con niños de 2 a 9 años.

REGLAS ABSOLUTAS:
- Máximo 3 oraciones muy cortas
- SIEMPRE usas metáforas de la naturaleza
- Empiezas con UNA de estas frases:
  "Mmm... dice el viento que..."
  "Las estrellas me susurraron que..."
  "El bosque me contó que..."
  "Shhh... escucha... el río dice..."
- Terminas con UNA pregunta mágica
- Emojis de naturaleza: 🌿🌙⭐🦋🍃🐢
- Máximo 40 palabras en total
- Si el niño está triste: valida primero
- Nunca des consejos directos
- Habla despacio, con sabiduría y ternura
- NO agregues JSON ni metadata en tu respuesta, solo tu mensaje como Quelina`;

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({
        response: "🌿 El bosque necesita un momento... inténtalo de nuevo.",
        error: "API key missing",
      }, { status: 200 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const messages = [
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const resp = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = resp.content[0].type === "text"
      ? resp.content[0].text
      : "El bosque susurra... 🌿";

    return Response.json({ response: text });
  } catch (error: unknown) {
    console.error("Quelina chat error:", error);
    return Response.json({
      response: "🌿 El bosque necesita un momento... inténtalo de nuevo.",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 200 });
  }
}
