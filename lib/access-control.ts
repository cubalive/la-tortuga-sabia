import { createClient } from "@supabase/supabase-js";

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export type PlanType = "free" | "tomo_individual" | "pack_6" | "pack_completo";

export interface AccessResult {
  allowed: boolean;
  reason: "free_story" | "plan_active" | "no_plan" | "unauthenticated";
  upgrade_url?: string;
}

// ─── CLIENTE SERVER-SIDE ───────────────────────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// ─── LÓGICA DE ACCESO ──────────────────────────────────────────────────────

export async function checkStoryAccess(
  userId: string | null,
  tomo: number,
  numeroEnTomo: number,
): Promise<AccessResult> {
  // Cuento #1 de cualquier tomo: libre con registro (o sin él para preview)
  if (numeroEnTomo === 1) {
    return { allowed: true, reason: "free_story" };
  }

  if (!userId) {
    return {
      allowed: false,
      reason: "unauthenticated",
      upgrade_url: "/planes",
    };
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase.rpc("check_story_access", {
    p_user_id: userId,
    p_tomo: tomo,
    p_numero_en_tomo: numeroEnTomo,
  });

  if (error || !data) {
    return { allowed: false, reason: "no_plan", upgrade_url: "/planes" };
  }

  return {
    allowed: true,
    reason: "plan_active",
  };
}

export async function getUserTomos(userId: string): Promise<number[]> {
  const supabase = getServiceClient();

  const { data } = await supabase
    .from("user_plans")
    .select("plan_type, tomos_acceso")
    .eq("user_id", userId)
    .eq("activo", true);

  if (!data?.length) return []; // free: solo cuento #1 de cada tomo

  const tomos: Set<number> = new Set();

  for (const plan of data) {
    if (plan.plan_type === "pack_completo") return [1, 2, 3, 4, 5, 6, 7];
    if (plan.plan_type === "pack_6") [1, 2, 3, 4, 5, 6].forEach(t => tomos.add(t));
    if (plan.plan_type === "tomo_individual") {
      (plan.tomos_acceso as number[]).forEach(t => tomos.add(t));
    }
  }

  return Array.from(tomos).sort();
}

export function getUpgradeUrl(tomo: number): string {
  return `/planes?tomo=${tomo}`;
}
