import { notFound } from "next/navigation";
import BookReaderWrapper from "@/components/BookReaderWrapper";

interface PageProps {
  params: Promise<{ id: string; num: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id, num } = await params;
  return {
    title: `Cuento ${num} — Tomo ${id} | La Tortuga Sabia`,
  };
}

export default async function CuentoPage({ params }: PageProps) {
  const { id, num } = await params;
  const tomo = parseInt(id, 10);
  const numero = parseInt(num, 10);

  if (isNaN(tomo) || isNaN(numero) || tomo < 1 || tomo > 7 || numero < 1) {
    notFound();
  }

  return <BookReaderWrapper tomo={tomo} num={numero} />;
}
