import { NextResponse } from "next/server";
import { runHelpCardAgent } from "@/lib/agent/help-card-agent";
import type { HelpAgentInput } from "@/lib/agent/types";
import type { UserProfileContext } from "@/lib/profile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<HelpAgentInput>;
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (message.length < 3 || message.length > 1200) {
      return NextResponse.json(
        { error: "Message must contain between 3 and 1200 characters." },
        { status: 400 },
      );
    }

    const result = await runHelpCardAgent({
      message,
      city: cleanOptionalString(body.city, 80),
      language: cleanOptionalString(body.language, 20) ?? "en",
      selectedScenario: cleanOptionalString(body.selectedScenario, 80),
      currentCardId: cleanOptionalString(body.currentCardId, 120),
      userProfileContext: cleanUserProfileContext(body.userProfileContext),
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[POST /api/agent/help]", error);
    return NextResponse.json(
      { error: "ChinaMate could not build a Help Card. Please try again." },
      { status: 500 },
    );
  }
}

function cleanOptionalString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : undefined;
}

function cleanUserProfileContext(value: unknown): UserProfileContext | undefined {
  if (!value || typeof value !== "object") return undefined;
  const context = value as Partial<UserProfileContext>;
  return {
    city: cleanOptionalString(context.city, 80) ?? "Shanghai",
    interfaceLanguage: cleanInterfaceLanguage(context.interfaceLanguage),
    chineseAssistanceEnabled: Boolean(context.chineseAssistanceEnabled),
    translationMode: cleanTranslationMode(context.translationMode),
    simplifiedInstructions: Boolean(context.simplifiedInstructions),
    travelStyle:
      cleanOptionalString(context.travelStyle, 40) ?? "First-time visitor",
    transportPreference:
      cleanOptionalString(context.transportPreference, 40) ?? "Metro",
    budgetPreference: cleanOptionalString(context.budgetPreference, 40) ?? "Comfort",
    paymentPreferences: cleanStringArray(context.paymentPreferences, 6, 40),
    commonNeeds: cleanStringArray(context.commonNeeds, 10, 40),
    safetyPreferences: cleanSafetyPreferences(context.safetyPreferences),
  };
}

function cleanInterfaceLanguage(
  value: unknown,
): UserProfileContext["interfaceLanguage"] {
  return value === "Simplified Chinese" ? "Simplified Chinese" : "English";
}

function cleanTranslationMode(
  value: unknown,
): UserProfileContext["translationMode"] {
  if (value === "English only" || value === "Chinese on demand") return value;
  return "English + Chinese";
}

function cleanStringArray(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanOptionalString(item, maxLength))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems);
}

function cleanSafetyPreferences(value: unknown): UserProfileContext["safetyPreferences"] {
  const source =
    value && typeof value === "object"
      ? (value as Partial<UserProfileContext["safetyPreferences"]>)
      : {};
  return {
    emergencyCards: Boolean(source.emergencyCards),
    scamWarnings: Boolean(source.scamWarnings),
    hospitalPhrases: Boolean(source.hospitalPhrases),
    policePhrases: Boolean(source.policePhrases),
    lostPassportInstructions: Boolean(source.lostPassportInstructions),
  };
}
