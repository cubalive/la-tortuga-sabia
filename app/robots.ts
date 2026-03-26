export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: "https://latortugasabia.vercel.app/sitemap.xml",
  };
}
