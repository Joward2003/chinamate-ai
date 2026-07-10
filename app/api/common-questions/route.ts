import { NextResponse } from "next/server";
import { helpCards } from "@/data/helpCards";

export async function GET() {
  return NextResponse.json(
    helpCards.map((card) => ({
      label: card.title,
      cardId: card.id,
      intent: card.category,
    })),
  );
}
