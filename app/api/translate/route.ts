import { NextResponse } from "next/server";
import { chinesePhraseSystemPrompt } from "@/lib/agent/prompts";
import { generateJsonWithFallback } from "@/lib/llm/client";

type ChinesePhrasePayload = {
  targetRole?: string;
  phraseCn?: string;
  phraseEn?: string;
  usageContext?: string;
  toneNote?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      scenario?: unknown;
      targetRole?: unknown;
      text?: unknown;
      interfaceLanguage?: unknown;
    };
    const scenario = cleanString(body.scenario, 240);
    const targetRole = cleanString(body.targetRole, 120) ?? "For staff";
    const text = cleanString(body.text, 700);
    const interfaceLanguage = cleanString(body.interfaceLanguage, 20) ?? "en";

    if (!text) {
      return NextResponse.json(
        { error: "Text to translate is required." },
        { status: 400 },
      );
    }

    const result = await generateJsonWithFallback<ChinesePhrasePayload>({
      messages: [
        { role: "system", content: chinesePhraseSystemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            scenario,
            targetRole,
            userNeed: text,
            interfaceLanguage,
          }),
        },
      ],
    });
    const normalized = normalizePhrase(result.data, {
      targetRole,
      text,
    });

    return NextResponse.json({
      ...normalized,
      translatedText: normalized.phraseCn,
      provider: result.model,
    });
  } catch (error) {
    console.error("[POST /api/translate]", error);
    return NextResponse.json(
      { error: "ChinaMate could not generate Chinese. Please try again." },
      { status: 500 },
    );
  }
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : undefined;
}

function normalizePhrase(
  payload: ChinesePhrasePayload,
  fallback: { targetRole: string; text: string },
) {
  const phraseCn =
    typeof payload.phraseCn === "string" ? payload.phraseCn.trim() : "";
  return {
    targetRole:
      typeof payload.targetRole === "string" && payload.targetRole.trim()
        ? payload.targetRole.trim()
        : fallback.targetRole,
    phraseCn: phraseCn || "您好，可以请您帮我确认一下应该怎么做吗？",
    phraseEn:
      typeof payload.phraseEn === "string" && payload.phraseEn.trim()
        ? payload.phraseEn.trim()
        : fallback.text,
    usageContext:
      typeof payload.usageContext === "string" && payload.usageContext.trim()
        ? payload.usageContext.trim()
        : "Show this to local staff when asking for help.",
    toneNote:
      typeof payload.toneNote === "string" && payload.toneNote.trim()
        ? payload.toneNote.trim()
        : null,
  };
}
