import { createClient } from "@supabase/supabase-js";

export default async function sitemap() {
  const base = "https://latortugasabia.vercel.app";
  const pages = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/susurro`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/cuentos`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ];

  // Add story pages
  for (let i = 1; i <= 50; i++) {
    pages.push({
      url: `${base}/cuentos/${i}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    });
  }

  // Add blog pages from Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
    const { data: blogs } = await supabase
      .from("blog_posts")
      .select("slug, created_at")
      .eq("published", true);
    (blogs || []).forEach((b) => {
      pages.push({
        url: `${base}/blog/${b.slug}`,
        lastModified: new Date(b.created_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      });
    });
  } catch {}

  return pages;
}
