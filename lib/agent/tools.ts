import {
  getHelpCard as findHelpCardById,
  helpCards,
  phraseCards,
  type HelpCard,
} from "@/data/helpCards";
import type {
  CardAction,
  ProblemIntent,
  ReferenceItem,
  SuggestedQuestion,
  UnifiedCategory,
  UnifiedHelpCard,
} from "@/lib/agent/types";

export type HelpCardMatch = {
  cardId: string;
  title: string;
  confidence: number;
  reasons: string[];
};

const intentCardMap: Record<string, string> = {
  payment_failed: "payment_failed_restaurant",
  taxi_driver_called: "taxi_driver_called",
  qr_ordering: "qr_ordering",
  cannot_find_entrance: "cannot_find_entrance",
  app_in_chinese: "app_in_chinese",
};

export async function searchHelpCards(
  intent: ProblemIntent,
): Promise<HelpCardMatch[]> {
  return helpCards
    .map((card) => {
      const reasons: string[] = [];
      let score = 0;

      if (intentCardMap[intent.intent] === card.id) {
        score += 0.72;
        reasons.push("exact intent");
      }
      if (card.category === intent.category) {
        score += 0.16;
        reasons.push("same category");
      }

      const haystack = `${card.title} ${card.situation} ${card.tag}`.toLowerCase();
      const matchedKeywords = intent.keywords.filter((keyword) =>
        haystack.includes(keyword.toLowerCase()),
      );
      score += Math.min(0.12, matchedKeywords.length * 0.04);
      if (matchedKeywords.length) reasons.push("matching keywords");

      return {
        cardId: card.id,
        title: card.title,
        confidence: Number(Math.min(score, 0.99).toFixed(2)),
        reasons,
      };
    })
    .filter((match) => match.confidence > 0.15)
    .sort((a, b) => b.confidence - a.confidence);
}

export async function getHelpCard(cardId: string): Promise<HelpCard | undefined> {
  return findHelpCardById(cardId);
}

export async function getPhraseCards({
  targetRole,
  category,
}: {
  intent: string;
  targetRole?: string;
  category: UnifiedCategory;
}) {
  const role = targetRole?.toLowerCase();
  const categoryRoles: Partial<Record<UnifiedCategory, string[]>> = {
    payment: ["restaurant"],
    food: ["restaurant"],
    taxi: ["taxi"],
    attraction: ["attraction"],
    app: ["local person"],
    map: ["local person"],
    language: ["local person"],
  };
  const desired = role ? [role] : categoryRoles[category] ?? [];

  return phraseCards.filter((phrase) =>
    desired.some((item) => phrase.targetRole.toLowerCase().includes(item)),
  );
}

export async function getAppActions({
  category,
  city,
}: {
  category: UnifiedCategory;
  intent: string;
  city?: string;
}): Promise<CardAction[]> {
  const commonFallback = "If the app does not open, copy the text and ask staff.";

  const byCategory: Partial<Record<UnifiedCategory, CardAction[]>> = {
    payment: [
      {
        id: "open-alipay",
        type: "open_app",
        label: "Open Alipay",
        value: "alipays://",
        metadata: {
          appKey: "alipay",
          fallbackText: "Open Alipay manually and show this card to staff.",
        },
      },
    ],
    taxi: [
      {
        id: "open-didi",
        type: "open_app",
        label: "Open DiDi",
        value: "didi://",
        metadata: { appKey: "didi", fallbackText: commonFallback },
      },
      {
        id: "open-pickup-map",
        type: "open_map",
        label: "Open pickup map",
        value: `https://maps.apple.com/?q=${encodeURIComponent(city ?? "China")}`,
        metadata: { appKey: "apple_maps", fallbackText: commonFallback },
      },
    ],
    attraction: [
      {
        id: "open-attraction-map",
        type: "open_map",
        label: "Open map",
        value: `https://maps.apple.com/?q=${encodeURIComponent(
          `${city ?? ""} visitor service center`.trim(),
        )}`,
        metadata: { appKey: "apple_maps", fallbackText: commonFallback },
      },
    ],
    map: [
      {
        id: "open-map",
        type: "open_map",
        label: "Open map",
        value: `https://maps.apple.com/?q=${encodeURIComponent(city ?? "China")}`,
        metadata: { appKey: "apple_maps", fallbackText: commonFallback },
      },
    ],
  };

  return byCategory[category] ?? [];
}

export async function searchReferences({
  category,
}: {
  category: UnifiedCategory;
  intent: string;
  city?: string;
  keywords: string[];
}): Promise<ReferenceItem[]> {
  const references: ReferenceItem[] = [
    {
      type: "manual_knowledge",
      id: `manual-${category}`,
      title: `ChinaMate ${category} fallback guidelines`,
      excerpt:
        "Use short, reversible steps; confirm details with uniformed staff when local requirements are unclear.",
    },
  ];

  const related = helpCards.find((card) => card.category === category);
  if (related) {
    references.push({
      type: "internal_help_card",
      id: related.id,
      title: related.title,
      excerpt: related.situation,
    });
  }

  return references;
}

export async function getSuggestedQuestions({
  intent,
  category,
  currentCardId,
}: {
  intent: string;
  category: UnifiedCategory;
  currentCardId?: string;
}): Promise<SuggestedQuestion[]> {
  const relatedIntentMap: Record<string, string[]> = {
    payment_failed: ["qr_ordering", "app_in_chinese"],
    qr_ordering: ["payment_failed", "app_in_chinese"],
    taxi_driver_called: ["cannot_find_entrance"],
    cannot_find_entrance: ["app_in_chinese", "taxi_driver_called"],
    app_in_chinese: ["qr_ordering", "payment_failed"],
    metro_exit_problem: ["app_in_chinese", "lost_way"],
    lost_way: ["taxi_driver_called", "app_in_chinese"],
    passport_lost: [
      "contact_consulate",
      "lost_passport_documents",
      "lost_way",
    ],
  };

  const related = relatedIntentMap[intent] ?? [];
  const suggestions = related.flatMap<SuggestedQuestion>((relatedIntent) => {
    const cardId = intentCardMap[relatedIntent];
    const card = cardId ? findHelpCardById(cardId) : undefined;
    if (card && card.id !== currentCardId) {
      return [{ label: card.title, cardId: card.id, intent: relatedIntent }];
    }
    const generatedLabels: Record<string, string> = {
      lost_way: "I cannot find my way back",
      contact_consulate: "How do I contact my embassy or consulate?",
      lost_passport_documents:
        "What documents should I keep after reporting the loss?",
    };
    return generatedLabels[relatedIntent]
      ? [{ label: generatedLabels[relatedIntent], intent: relatedIntent, cardId: undefined }]
      : [];
  });

  const rankedFallbackCards = [
    ...helpCards.filter((card) => card.id !== currentCardId && card.category === category),
    ...helpCards.filter((card) => card.id !== currentCardId && card.category !== category),
  ];

  const fallbackSuggestions = rankedFallbackCards
    .map((card) => ({
      label: card.title,
      cardId: card.id,
      intent:
        Object.entries(intentCardMap).find(([, id]) => id === card.id)?.[0] ??
        card.category,
    }));

  return [...suggestions, ...fallbackSuggestions]
    .filter(
      (question, index, array) =>
        !question.cardId ||
        array.findIndex((item) => item.cardId === question.cardId) === index,
    )
    .slice(0, 3);
}

export function approvedCardToUnified({
  card,
  intent,
  language,
}: {
  card: HelpCard;
  intent: ProblemIntent;
  language: string;
}): UnifiedHelpCard {
  const phrase = phraseCards.find((item) => item.id === card.phraseId);
  const actions = buildPhraseActions(phrase);

  for (const action of card.appActions) {
    if (action.type === "copy") continue;
    actions.push({
      id: `${action.type}-${slug(action.label)}`,
      type: action.type === "open" ? "open_url" : "open_url",
      label: action.label,
      value: action.value,
      metadata: {
        fallbackText: "If this link does not open, return to the card and use the fallback steps.",
      },
    });
  }

  actions.push(
    { id: "save-card", type: "save_card", label: "Save card", value: card.id },
    { id: "feedback", type: "feedback", label: "Did this help?", value: card.id },
  );

  return {
    cardId: card.id,
    renderMode: "approved_card",
    title: card.title,
    category: card.category,
    intent: intent.intent,
    scenario: intent.scenario,
    status: {
      verified: true,
      sourceType: "approved_card",
      confidence: 0.98,
      sourceCoverage: "strong",
      requiresHumanReview: false,
    },
    content: {
      situation: card.situation,
      steps: card.steps,
      primaryPhrase: phrase
        ? {
            targetRole: phrase.targetRole,
            phraseCn: phrase.phraseCn,
            phraseEn: phrase.phraseEn,
          }
        : undefined,
      fallback: card.fallback,
      warnings: card.avoid,
    },
    actions,
    references: [
      {
        type: "internal_help_card",
        id: card.id,
        title: card.title,
        excerpt: "Reviewed ChinaMate Help Card.",
      },
      ...(phrase
        ? [
            {
              type: "internal_phrase_card" as const,
              id: phrase.id,
              title: phrase.targetRole,
            },
          ]
        : []),
    ],
    suggestedQuestions: [],
    metadata: {
      city: intent.city,
      language,
      generatedAt: new Date().toISOString(),
      toolsUsed: ["searchHelpCards", "getHelpCard", "getPhraseCards"],
      matchedExistingCardId: card.id,
    },
  };
}

export function buildPhraseActions(
  phrase:
    | {
        id: string;
        phraseCn: string;
      }
    | undefined,
): CardAction[] {
  if (!phrase) return [];
  const copyText = phrase.phraseCn.replaceAll("\n", "");
  return [
    {
      id: "show-phrase",
      type: "show_phrase",
      label: "Show this in Chinese",
      value: phrase.id,
      metadata: { copyText },
    },
    {
      id: "copy-chinese",
      type: "copy_text",
      label: "Copy Chinese",
      value: copyText,
      metadata: { copyText },
    },
    {
      id: "read-aloud",
      type: "read_aloud",
      label: "Read aloud",
      value: copyText,
    },
  ];
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
