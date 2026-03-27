import { NextRequest } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BOOK_FILES: Record<string, string> = {
  "tomo-1": "la-tortuga-sabia-tomo-1-v9.pdf",
  "tomo-2": "la-tortuga-sabia-tomo-2-v9.pdf",
  "tomo-3": "la-tortuga-sabia-tomo-3-v9.pdf",
  "tomo-4": "la-tortuga-sabia-tomo-4-v9.pdf",
};

export async function POST(request: NextRequest) {
  try {
    const { product, sessionId } = await request.json();

    if (!BOOK_FILES[product]) {
      return Response.json({ error: "Invalid product" }, { status: 400 });
    }

    // Verify purchase if sessionId provided
    // For now, generate signed URL directly
    // In production: verify Stripe session or check purchases table

    if (!process.env.CF_R2_ACCOUNT_ID || !process.env.CF_R2_ACCESS_KEY_ID) {
      // Fallback to Supabase URLs if R2 not configured
      const supabaseUrl = `https://ebkwgrvqavutbfxkwore.supabase.co/storage/v1/object/public/tortuga-downloads/${product}-premium-v5.pdf`;
      return Response.json({
        url: supabaseUrl,
        fileName: BOOK_FILES[product],
        source: "supabase",
      });
    }

    const r2 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CF_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.CF_R2_BUCKET_NAME || "latortugasabia-books",
      Key: BOOK_FILES[product],
      ResponseContentDisposition: `attachment; filename="${BOOK_FILES[product]}"`,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    return Response.json({
      url: signedUrl,
      fileName: BOOK_FILES[product],
      expiresIn: 3600,
      source: "r2",
    });
  } catch (error: unknown) {
    console.error("Download error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
