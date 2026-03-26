import Stripe from "stripe";
import { NextRequest } from "next/server";
import { sendPurchaseEmail } from "@/lib/email-service";
import { createClient } from "@supabase/supabase-js";

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
      const fullName = session.customer_details?.name || "Querido padre";
      const firstName = fullName.split(" ")[0];
      const product = session.metadata?.product || "digital";
      const downloadUrl = "https://latortugasabia.vercel.app/downloads/la-tortuga-sabia-tomo-1.pdf";

      // Send personalized purchase email
      if (email && process.env.RESEND_API_KEY) {
        await sendPurchaseEmail(email, firstName, product, downloadUrl);
      }

      // Save sale to Supabase
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        await supabase.from("sales").insert({
          stripe_session_id: session.id,
          product,
          amount_usd: (session.amount_total || 0) / 100,
          customer_email: email,
          country: "US",
        });
        await supabase.from("orders").upsert({
          stripe_id: session.id,
          customer_email: email || "",
          product_type: product,
          tomo: 1,
          amount_usd: (session.amount_total || 0) / 100,
          status: "completed",
          download_url: downloadUrl,
        }, { onConflict: "stripe_id" });
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
