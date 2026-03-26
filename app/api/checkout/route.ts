import Stripe from "stripe";
import { NextRequest } from "next/server";

const PRICES: Record<string, number> = {
  digital: 999,
  premium: 1999,
  fisico: 2499,
  coleccion: 4999,
};

const DESCRIPTIONS: Record<string, string> = {
  digital: "50 cuentos terapéuticos en PDF",
  premium: "PDF + Audiolibro narrado + Música Suno",
  fisico: "Libro físico hardcover a color",
  coleccion: "Colección completa — 4 tomos todos los formatos",
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { product } = await request.json();

    const country = request.headers.get("x-vercel-ip-country") || request.headers.get("x-country");
    if (country && country !== "US") {
      return Response.json(
        { error: "Solo vendemos en USA por ahora", available_soon: true },
        { status: 403 }
      );
    }

    if (!PRICES[product]) {
      return Response.json({ error: "Invalid product" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `La Tortuga Sabia — Tomo I`,
              description: DESCRIPTIONS[product],
              images: ["https://latortugasabia.vercel.app/images/portada-b.jpg"],
            },
            unit_amount: PRICES[product],
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://latortugasabia.vercel.app"}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://latortugasabia.vercel.app"}/#pricing`,
      metadata: { product, tomo: "1" },
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
