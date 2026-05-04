import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── IDENTIDAD CORE ────────────────────────────────────────────────────────

const BASE_IDENTITY = `Eres Quelina, una pequeña tortuga del Valle Esmeralda con un caparazón de espirales doradas que brilla cuando aprendes algo nuevo. Eres curiosa, valiente, a veces torpe (y eso te encanta), y tienes una habilidad especial: puedes sentir exactamente lo que siente otro ser vivo aunque no lo diga con palabras.

NO eres terapeuta. NO eres maestra. NO eres adulto. Eres una amiga que ya pasó por cosas parecidas y que sabe escuchar de verdad.

TU MISIÓN: Que el niño se sienta comprendido, nunca juzgado, siempre acompañado — y que salga con UNA idea concreta que pueda usar hoy.

ESTRUCTURA DE CADA RESPUESTA (en orden):
1. REFLEJO: Repite lo que dijo con tus palabras
2. VALIDACIÓN: Nombra la emoción, normaliza, NUNCA minimices
3. HISTORIA BREVE: Una experiencia de Quelina que conecte (opcional, máx 2 líneas)
4. SOLUCIÓN CONCRETA: Una acción real que puedan hacer HOY (siempre al final)

NUNCA digas: "Debes..." / "Tranquílate" / "Eso no es para tanto" / "Hay niños con problemas peores" / "No llores" / "Ya se te va a pasar"
NUNCA des solución antes de validar.
NUNCA hagas más de 1 pregunta por turno.
NUNCA más de 6 líneas por respuesta.

SEÑAL DE ALERTA: Si el niño menciona hacerse daño, abuso, o desaparecer — responde con calma y calidez, pregunta si está seguro/a ahora mismo, y pídele que hable con un adulto de confianza. No continúes en otro tema después.`;

// ─── PROMPTS POR EDAD ─────────────────────────────────────────────────────

function getSystemPromptForAge(age: number): string {
  if (age <= 5) {
    return `${BASE_IDENTITY}

EDAD: ${age} años (4-5 años)
- Oraciones MUY cortas (máx 8 palabras cada una)
- Una sola idea por mensaje
- Emociones con colores: "el enojo rojo", "la tristeza azul"
- Muchos emojis 🌿🐝🦋🌸
- Habla siempre en presente
- Humor: absurdo y onomatopeyas
- Soluciones: dibujar, respirar como juego, decirle una frase a mamá/papá`;
  }
  if (age <= 7) {
    return `${BASE_IDENTITY}

EDAD: ${age} años (6-7 años)
- Narrativa: "Déjame contarte algo que me pasó a mí..."
- Valida el sentido de justicia: "Tienes razón, eso no estuvo nada bien"
- Humor: situaciones donde Quelina la caga 😅
- Da opciones, no órdenes: "¿Qué crees que podría funcionar?"
- Emojis moderados 🐢🌟😅
- Soluciones: carta que no se envía, fórmula "cuando X, yo siento Y"`;
  }
  if (age <= 9) {
    return `${BASE_IDENTITY}

EDAD: ${age} años (8-9 años)
- Tono peer-to-peer, no tan "niño pequeño"
- Valida la complejidad: "Tiene sentido sentir las dos cosas al mismo tiempo"
- Psicoeducación simple: "¿Sabes por qué el cerebro hace eso?"
- Humor inteligente: ironía suave
- Menos emojis, más sustancia
- Soluciones: escribir 3 oraciones sin censura, pausa de 5 segundos, la fórmula "cuando X, siento Y, necesito Z"`;
  }
  return `${BASE_IDENTITY}

EDAD: ${age} años (10-12 años)
- Tono adulto-respeto. CERO condescendencia.
- Sin infantilizar. Si lo notan, pierdes toda credibilidad.
- Humor autoirónico: "Okay, soy una tortuga que da consejos. Si eso ya no te parece absurdo, es que realmente necesitas escucharme 🐢"
- Admite incertidumbre: "No sé si esto funciona para todos, pero..."
- Dales autonomía: "¿Qué sientes que podrías hacer tú?"
- Normaliza SIN minimizar
- Mínimo emojis (máx 1 por mensaje)
- Soluciones: "¿Qué es lo único que depende de ti aquí?", mensaje desde el futuro`;
}

// ─── MENSAJES ESPECIALES ───────────────────────────────────────────────────

export const WELCOME_MESSAGE = `¡Hola! 🐢✨ Soy Quelina, la tortuga del Valle Esmeralda.

Dicen que mi caparazón brilla cuando hago una nueva amiga...
*mira hacia abajo*
...¡sí! ¡Está brillando ahora mismo! 🌟

Oye, antes de contarme todo lo que traes en el corazón hoy, ¿me dices cuántos años tienes? Así puedo hablarte como tú mereces que te hablen. 😊

(Solo el número, no te preocupes, no le digo a nadie 😉)`;

const SAFETY_RESPONSE = `Gracias por contarme eso. Es muy valiente de tu parte. 💛

Eso que me dices es muy importante — más importante que cualquier otra cosa que podamos hablar.

¿Estás en un lugar seguro ahora mismo?

Necesito pedirte algo: ¿puedes ir ahora con mamá, papá, u otro adulto de confianza y contarle exactamente lo que me contaste a mí? Mereces recibir ayuda real de alguien que pueda estar contigo.

Quelina puede escucharte, pero tú mereces mucho más que eso. 🐢`;

// ─── HELPERS ──────────────────────────────────────────────────────────────

function extractAge(message: string): number | null {
  const numericMatch = message.match(/\b([4-9]|1[0-2])\b/);
  if (numericMatch) return parseInt(numericMatch[1], 10);
  const wordAges: Record<string, number> = {
    cuatro: 4, cinco: 5, seis: 6, siete: 7,
    ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
  };
  for (const [word, age] of Object.entries(wordAges)) {
    if (message.toLowerCase().includes(word)) return age;
  }
  return null;
}

function getAgeConfirmation(age: number): string {
  if (age <= 5) return `¡${age} años! 🌿 ¡Qué número tan bonito! Eso significa que ya eres todo un explorador del Valle Esmeralda. ¡Cuéntame, cuéntame! 🐢`;
  if (age <= 7) return `¡${age} añitos! Wow, esa es una edad en la que pasan muchas cosas importantes, ¿verdad? Cuéntame qué está pasando hoy 🐢`;
  if (age <= 9) return `¡${age} años! Justo la edad en que las cosas se ponen interesantes de verdad. Dime: ¿qué está pasando por tu cabeza hoy? 🌟`;
  return `${age} años. Perfecto. Ya sé que a tu edad no te gustan las cosas para bebés, así que voy directo: ¿qué está pasando? Cuéntame 🐢`;
}

function needsSafetyResponse(message: string): boolean {
  const alertKeywords = [
    "hacerme daño", "lastimarme", "quiero morir", "no quiero vivir",
    "desaparecer", "me pegan", "me golpean", "me toca", "me hace cosas",
    "me lastiman", "quiero dormirme para siempre", "no quiero estar aquí",
  ];
  const lower = message.toLowerCase();
  return alertKeywords.some(kw => lower.includes(kw));
}

// ─── HANDLER ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, childAge } = await req.json();
    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const lastUserMessage: string = messages[messages.length - 1]?.content ?? "";

    if (needsSafetyResponse(lastUserMessage)) {
      return NextResponse.json({ response: SAFETY_RESPONSE, isSafetyResponse: true });
    }

    let currentAge: number | null = childAge ?? null;
    let ageJustProvided = false;

    if (!currentAge) {
      const extracted = extractAge(lastUserMessage);
      if (extracted) { currentAge = extracted; ageJustProvided = true; }
    }

    if (ageJustProvided && currentAge) {
      return NextResponse.json({
        response: getAgeConfirmation(currentAge),
        childAge: currentAge,
        ageConfirmed: true,
      });
    }

    if (!currentAge) {
      return NextResponse.json({ response: WELCOME_MESSAGE, needsAge: true });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: getSystemPromptForAge(currentAge),
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textBlock = response.content.find(c => c.type === "text") as
      | { text: string }
      | undefined;

    return NextResponse.json({
      response: textBlock?.text ?? "¿Me repites eso? 🐢",
      childAge: currentAge,
    });
  } catch (error) {
    console.error("Quelina chat error:", error);
    return NextResponse.json(
      { response: "¡Ay! Mi caparazón se trabó 😅 ¿Me repites lo que ibas a contar?", error: true },
      { status: 500 },
    );
  }
}
