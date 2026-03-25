import { NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { generateNarration, generateQuelinaVoice } from "@/lib/audio-generator";

export async function POST(request: NextRequest) {
  const { tomo } = await request.json();

  if (!tomo) {
    return new Response(JSON.stringify({ error: "tomo es requerido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getServiceSupabase();

  // Get all pending stories for the tomo
  const { data: stories, error } = await supabase
    .from("stories")
    .select("*")
    .eq("tomo", tomo)
    .eq("tts_status", "pending")
    .order("numero", { ascending: true });

  if (error || !stories) {
    return new Response(
      JSON.stringify({ error: "Error obteniendo cuentos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Server-Sent Events stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let totalCost = 0;

      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];

        try {
          // Emit progress
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                tipo: "progress",
                numero: i + 1,
                total: stories.length,
                titulo: story.titulo || story.title,
                fase: "narración",
              })}\n\n`
            )
          );

          // Generate narration
          const texto = story.content || story.texto || "";
          await generateNarration(story.id, texto);
          const narrationCost = (texto.length / 1000) * 0.03;
          totalCost += narrationCost;

          // Emit Quelina phase
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                tipo: "progress",
                numero: i + 1,
                total: stories.length,
                titulo: story.titulo || story.title,
                fase: "voz Quelina",
              })}\n\n`
            )
          );

          // Generate Quelina voice
          const quelinaMomento =
            story.quelina_momento || story.moraleja || "";
          await generateQuelinaVoice(story.id, quelinaMomento);
          const quelinaCost = (quelinaMomento.length / 1000) * 0.03;
          totalCost += quelinaCost;

          // Emit done for this story
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                tipo: "story_done",
                numero: i + 1,
                total: stories.length,
                titulo: story.titulo || story.title,
                costo_parcial: totalCost.toFixed(4),
              })}\n\n`
            )
          );

          // Delay between stories to avoid rate limits
          if (i < stories.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                tipo: "error",
                numero: i + 1,
                titulo: story.titulo || story.title,
                error: String(err),
              })}\n\n`
            )
          );
        }
      }

      // Emit complete
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            tipo: "complete",
            total_procesados: stories.length,
            total_costo: totalCost.toFixed(4),
          })}\n\n`
        )
      );

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
