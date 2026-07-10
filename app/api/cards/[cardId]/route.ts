import { NextResponse } from "next/server";
import { getHelpCard } from "@/data/helpCards";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await params;
  const card = getHelpCard(cardId);

  if (!card) {
    return NextResponse.json({ error: "Help Card not found." }, { status: 404 });
  }

  return NextResponse.json(card);
}
