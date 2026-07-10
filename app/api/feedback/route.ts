import { NextResponse } from "next/server";

type FeedbackPayload = {
  cardId?: string;
  outcome?: "helped" | "stuck";
  reason?: string;
  details?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FeedbackPayload;
    if (
      typeof body.cardId !== "string" ||
      (body.outcome !== "helped" && body.outcome !== "stuck")
    ) {
      return NextResponse.json(
        { error: "cardId and a valid outcome are required." },
        { status: 400 },
      );
    }

    const feedback = {
      cardId: body.cardId.slice(0, 160),
      outcome: body.outcome,
      reason: body.reason?.slice(0, 160),
      details: body.details?.slice(0, 1000),
      createdAt: new Date().toISOString(),
    };

    // MVP storage adapter. Replace with a database insert without changing the API.
    console.info("[ChinaMate feedback]", feedback);

    return NextResponse.json({ accepted: true, feedback });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}
