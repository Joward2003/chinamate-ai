import { NextResponse } from "next/server";
import { getPhraseCard } from "@/data/helpCards";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ phraseId: string }> },
) {
  const { phraseId } = await params;
  const phrase = getPhraseCard(phraseId);

  if (!phrase) {
    return NextResponse.json({ error: "Phrase Card not found." }, { status: 404 });
  }

  return NextResponse.json(phrase);
}
