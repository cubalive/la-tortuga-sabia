import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const metadata = {
  title: "Blog — La Tortuga Sabia",
  description: "Artículos sobre crianza, cuentos terapéuticos y desarrollo emocional infantil en español.",
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export default async function BlogPage() {
  let posts: any[] = [];
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    posts = data || [];
  } catch {}

  return (
    <main className="min-h-screen px-4 py-20" style={{ background: "#050d12" }}>
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-cream text-sm font-cinzel mb-8 inline-block">
          ← Volver al bosque
        </Link>
        <h1 className="font-cinzel text-4xl md:text-5xl text-center mb-4" style={{ color: "#C9882A" }}>
          El Rincón de Quelina
        </h1>
        <p className="font-playfair italic text-cream text-center text-lg mb-16">
          Consejos, cuentos y sabiduría para padres e hijos
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block rounded-2xl p-8 border border-white/5 transition-all hover:border-gold/20 hover:bg-white/[0.02]"
              style={{ background: "rgba(45,106,79,0.08)" }}
            >
              <p className="text-xs text-jade uppercase tracking-widest mb-3">
                {post.reading_time} · Crianza
              </p>
              <h2 className="font-cinzel text-cream text-lg font-bold mb-4 leading-tight">
                {post.title}
              </h2>
              <p className="text-gray-400 font-playfair text-sm leading-relaxed mb-4">
                {post.excerpt?.substring(0, 150)}...
              </p>
              <span className="text-gold font-cinzel text-sm">Leer artículo →</span>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <p className="text-center text-gray-500 font-playfair italic py-20">
            Pronto habrá artículos aquí... las estrellas los están escribiendo 🌿
          </p>
        )}
      </div>
    </main>
  );
}
