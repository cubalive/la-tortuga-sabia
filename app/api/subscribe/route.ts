import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }

    // Save to Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      await supabase.from("leads").upsert(
        { email, name, source: "web_capture" },
        { onConflict: "email", ignoreDuplicates: true }
      );
    }

    // Send personalized welcome email
    if (process.env.RESEND_API_KEY) {
      await sendWelcomeEmail(email, name || "Querido padre");
    }

    // Track event
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      await supabase.from("analytics").insert({ event: "email_captured", page: "/subscribe" });
    }

    return Response.json({ ok: true });
  } catch (error: unknown) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
