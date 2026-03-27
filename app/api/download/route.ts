import { NextRequest } from "next/server";

const R2_PUBLIC = "https://pub-f853fa89d0774696ba2924b6df56123b.r2.dev";

const BOOK_FILES: Record<string, string> = {
  "tomo-1": "la-tortuga-sabia-tomo-1-v9.pdf",
  "tomo-2": "la-tortuga-sabia-tomo-2-v9.pdf",
  "tomo-3": "la-tortuga-sabia-tomo-3-v9.pdf",
  "tomo-4": "la-tortuga-sabia-tomo-4-v9.pdf",
};

export async function POST(request: NextRequest) {
  try {
    const { product } = await request.json();

    if (!product || !BOOK_FILES[product]) {
      return Response.json({ error: "Invalid product" }, { status: 400 });
    }

    const fileName = BOOK_FILES[product];
    const url = `${R2_PUBLIC}/${fileName}`;

    return Response.json({ url, fileName, source: "r2" });
  } catch (error: unknown) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
