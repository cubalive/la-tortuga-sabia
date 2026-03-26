import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("blog_posts")
      .select("title, meta_description")
      .eq("slug", slug)
      .single();
    if (!data) return { title: "Not Found" };
    return {
      title: `${data.title} | La Tortuga Sabia`,
      description: data.meta_description,
      openGraph: {
        title: data.title,
        description: data.meta_description,
        images: [`/api/og?title=${encodeURIComponent(data.title)}`],
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  // Increment views
  await supabase
    .from("blog_posts")
    .update({ views: (post.views || 0) + 1 })
    .eq("id", post.id);

  return (
    <main className="min-h-screen px-4 py-20" style={{ background: "#050d12" }}>
      <article className="max-w-3xl mx-auto">
        <Link href="/blog" className="text-jade text-sm mb-8 inline-block hover:text-cream">
          ← Volver al blog
        </Link>
        <p className="text-xs text-jade uppercase tracking-widest mb-2">
          {post.reading_time} · CUBALIVE
        </p>
        <h1
          className="font-cinzel font-bold mb-8 leading-tight"
          style={{ color: "#C9882A", fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
        >
          {post.title}
        </h1>
        <div
          className="font-playfair text-cream leading-loose"
          style={{ fontSize: "1.1rem" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div
          className="mt-16 p-10 rounded-2xl text-center"
          style={{ background: "rgba(45,106,79,0.12)", border: "1px solid rgba(201,136,42,0.25)" }}
        >
          <p className="font-cinzel text-gold text-2xl mb-4">Descubre La Tortuga Sabia 🐢</p>
          <p className="font-playfair italic text-cream mb-6">
            200 cuentos terapéuticos para niños de 0 a 9 años
          </p>
          <Link
            href="/#pricing"
            className="inline-block px-8 py-3 rounded-full font-cinzel text-cream"
            style={{ background: "#2D6A4F" }}
          >
            Ver el libro →
          </Link>
        </div>
      </article>
    </main>
  );
}
