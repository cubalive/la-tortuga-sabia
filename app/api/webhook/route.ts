import Stripe from "stripe";
import { Resend } from "resend";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return Response.json({ error: "Not configured" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await request.text();
    const sig = request.headers.get("stripe-signature")!;

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const name = session.customer_details?.name || "amigo/a";
      const product = session.metadata?.product || "digital";

      if (email && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "Quelina <quelina@latortugasabia.com>",
          to: email,
          subject: "🐢 Tu libro de La Tortuga Sabia está listo",
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #050d12; color: #FEFAE0;">
              <h1 style="color: #C9882A; font-size: 24px; text-align: center;">¡Bienvenido al mundo de Quelina!</h1>
              <p style="font-size: 16px;">Hola ${name},</p>
              <p>Las estrellas me avisaron que vendrías... y aquí está tu libro. 🌙</p>
              ${product === "digital" || product === "premium" ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://latortugasabia.vercel.app/downloads/la-tortuga-sabia-tomo-1.pdf"
                     style="background: #2D6A4F; color: #FEFAE0; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-size: 16px;">
                    📖 Descargar tu PDF
                  </a>
                </div>
              ` : ""}
              <p style="font-style: italic; color: #C9882A;">
                "Detente un momento... y escucha lo que el viento tiene que decirle a tu corazón."
              </p>
              <p style="color: #888; font-size: 12px; margin-top: 40px;">
                © 2025 CUBALIVE · PASSKAL LLC · Las Vegas, Nevada
              </p>
            </div>
          `,
        });
      }
    }

    return Response.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown" },
      { status: 400 }
    );
  }
}
