import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({
        totalStories: 50,
        totalVisits: 0,
        topCountries: [],
        recentEvents: [],
        salesTotal: 0,
        salesCount: 0,
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const [storiesRes, analyticsRes, countriesRes, salesRes] = await Promise.all([
      supabase.from("stories").select("id", { count: "exact", head: true }),
      supabase.from("analytics").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("analytics").select("country").not("country", "is", null),
      supabase.from("sales").select("amount_usd"),
    ]);

    // Count by country
    const countryMap: Record<string, number> = {};
    (countriesRes.data || []).forEach((r: any) => {
      countryMap[r.country] = (countryMap[r.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const salesTotal = (salesRes.data || []).reduce((sum: number, s: any) => sum + (parseFloat(s.amount_usd) || 0), 0);

    return Response.json({
      totalStories: storiesRes.count || 0,
      totalVisits: (countriesRes.data || []).length,
      topCountries,
      recentEvents: analyticsRes.data || [],
      salesTotal,
      salesCount: (salesRes.data || []).length,
    });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
