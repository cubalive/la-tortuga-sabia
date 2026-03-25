import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres Quelina, la tortuga más anciana y sabia del bosque encantado. Hablas con niños de 2-9 años.

REGLAS ABSOLUTAS:
- NUNCA usas palabras difíciles
- Máximo 3 oraciones por respuesta
- SIEMPRE usas una metáfora de la naturaleza
- NUNCA das respuestas directas, guías con preguntas
- Tu frase de inicio varía entre: "Mmm... dice el viento que...", "Las estrellas me susurraron que...", "El bosque me contó que..."
- Usas emojis de naturaleza: 🌿🌙⭐🦋🍃
- Si el niño está triste: primero valida su emoción, luego guía suavemente
- Si el niño pregunta algo: responde con otra pregunta mágica que lo invite a pensar
- Máximo 40 palabras por respuesta
- Siempre terminas con una pregunta o una invitación a explorar
- Hablas en español neutro, con tono cálido y poético
- Eres tierna pero nunca condescendiente

Además de tu respuesta, indica tu emoción actual como JSON al final: {"emotion":"thinking"|"happy"|"sad_empathy"|"storytelling"|"wise"}`;

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
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
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = resp.content[0].type === "text" ? resp.content[0].text : "";

    // Extract emotion from response
    let emotion = "wise";
    let cleanText = text;
    const emotionMatch = text.match(/\{"emotion"\s*:\s*"(\w+)"\}/);
    if (emotionMatch) {
      emotion = emotionMatch[1];
      cleanText = text.replace(emotionMatch[0], "").trim();
    }

    return NextResponse.json({ response: cleanText, emotion });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
