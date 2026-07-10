import "server-only";

import {
  DEFAULT_LLM_MODEL,
  LLM_FALLBACK_ORDER,
  LLM_MODELS,
  type LlmModelKey,
} from "@/config/llm";
import { generateJsonWithFallback } from "@/lib/llm/client";
import {
  assistedCardSystemPrompt,
  intentSystemPrompt,
  needToDoCardSystemPrompt,
  relatedCardsSystemPrompt,
  somethingWrongCardSystemPrompt,
} from "@/lib/agent/prompts";
import {
  approvedCardToUnified,
  buildPhraseActions,
  getAppActions,
  getHelpCard,
  getPhraseCards,
  getSuggestedQuestions,
  searchHelpCards,
  searchReferences,
} from "@/lib/agent/tools";
import type {
  HelpAgentInput,
  ProblemIntent,
  RelatedHelpCard,
  UnifiedCategory,
  UnifiedHelpCard,
} from "@/lib/agent/types";

type GeneratedActionHint = {
  type: "copy_text" | "open_map" | "open_url";
  label: string;
  value: string;
  fallbackText?: string;
};

type AssistedContent = UnifiedHelpCard["content"] & {
  title: string;
  actions?: GeneratedActionHint[];
  suggestedQuestions?: Array<{
    label: string;
    intent: string;
    cardId?: string;
  }>;
};

type ScenarioType = "need_to_do" | "something_wrong";

type GeneratedRelatedCard = AssistedContent & {
  category?: UnifiedCategory;
  intent?: string;
  relationReason?: string;
};

type GeneratedRelatedCardsPayload = {
  cards?: GeneratedRelatedCard[];
};

const validCategories = new Set<UnifiedCategory>([
  "payment",
  "taxi",
  "food",
  "attraction",
  "app",
  "map",
  "language",
  "other",
]);

export async function runHelpCardAgent(
  input: HelpAgentInput,
): Promise<UnifiedHelpCard> {
  const language = input.language ?? "en";
  const scenarioType = scenarioTypeFromInput(input);
  if (needsRequery(input.message)) {
    return createClarificationCard({ input, language, scenarioType });
  }
  const { intent, degradedMode, model: intentModel, modelKey: intentModelKey } =
    await deconstructProblem(input);
  const matches = await searchHelpCards(intent);
  const bestMatch = matches[0];

  if (bestMatch && bestMatch.confidence >= 0.72) {
    const card = await getHelpCard(bestMatch.cardId);
    if (card) {
      const result = approvedCardToUnified({ card, intent, language });
      result.status.confidence = bestMatch.confidence;
      result.metadata.degradedMode = degradedMode;
      result.metadata.model = intentModel ?? "deterministic-router";
      result.suggestedQuestions = await getSuggestedQuestions({
        intent: intent.intent,
        category: intent.category,
        currentCardId: card.id,
      });
      result.relatedCards = await generateRelatedCards({
        input,
        coreCard: result,
        suggestions: result.suggestedQuestions,
        intent,
        language,
        scenarioType,
      });
      return result;
    }
  }

  return createAssistedCard({
    input,
    intent,
    language,
    degradedMode,
    intentModel,
    intentModelKey,
    scenarioType,
  });
}

async function deconstructProblem(input: HelpAgentInput): Promise<{
  intent: ProblemIntent;
  degradedMode: boolean;
  model?: string;
  modelKey?: LlmModelKey;
}> {
  // High-confidence, common travel problems should never wait on a remote
  // model. Ambiguous inputs still use the LLM intent parser below.
  const fastIntent = inferIntent(input);
  const fastPathIntents = new Set([
    "qr_ordering",
    "payment_failed",
    "attraction_reservation",
    "taxi_driver_called",
    "cannot_find_entrance",
    "app_in_chinese",
    "lost_way",
  ]);
  if (fastPathIntents.has(fastIntent.intent)) {
    return { intent: fastIntent, degradedMode: true };
  }

  try {
    const result = await generateJsonWithFallback<Partial<ProblemIntent>>({
      messages: [
        { role: "system", content: intentSystemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            message: input.message,
            city: input.city,
            selectedScenario: input.selectedScenario,
            userProfileContext: input.userProfileContext,
          }),
        },
      ],
    });
    return {
      intent: enforceDomainConsistency(normalizeIntent(result.data, input), input),
      degradedMode: false,
      model: result.model,
      modelKey: result.modelKey,
    };
  } catch (error) {
    console.warn(
      "[ChinaMate Agent] Intent LLM unavailable; using deterministic fallback:",
      error instanceof Error ? error.message : "unknown error",
    );
    return { intent: inferIntent(input), degradedMode: true };
  }
}

async function createAssistedCard({
  input,
  intent,
  language,
  degradedMode,
  intentModel,
  intentModelKey,
  scenarioType,
}: {
  input: HelpAgentInput;
  intent: ProblemIntent;
  language: string;
  degradedMode: boolean;
  intentModel?: string;
  intentModelKey?: LlmModelKey;
  scenarioType: ScenarioType;
}): Promise<UnifiedHelpCard> {
  const [phrases, appActions, references, suggestions] = await Promise.all([
    getPhraseCards({
      intent: intent.intent,
      category: intent.category,
      targetRole: targetRoleFor(intent.category),
    }),
    getAppActions({
      intent: intent.intent,
      category: intent.category,
      city: intent.city,
    }),
    searchReferences({
      intent: intent.intent,
      category: intent.category,
      city: intent.city,
      keywords: intent.keywords,
    }),
    getSuggestedQuestions({
      intent: intent.intent,
      category: intent.category,
      currentCardId: input.currentCardId,
    }),
  ]);

  let content: AssistedContent;
  let generationDegraded = degradedMode;
  let modelUsed = intentModel;
  if (degradedMode) {
    content = safeFallbackContent(intent);
  } else {
    try {
      const result = await generateJsonWithFallback<AssistedContent>({
        modelKeys: intentModelKey
          ? [
              intentModelKey,
              ...LLM_FALLBACK_ORDER.filter((key) => key !== intentModelKey),
            ]
          : LLM_FALLBACK_ORDER,
        messages: [
          { role: "system", content: systemPromptForScenario(scenarioType) },
          {
            role: "user",
            content: JSON.stringify({
              travelerProblem: input.message,
              userProfileContext: input.userProfileContext,
              intent,
              internalReferences: references,
              availablePhrases: phrases,
              suggestionCandidates: suggestions,
            }),
          },
        ],
      });
      content = normalizeAssistedContent(result.data, intent);
      modelUsed = result.model;
    } catch (error) {
      console.warn(
        "[ChinaMate Agent] Card generation LLM unavailable; using safe fallback:",
        error instanceof Error ? error.message : "unknown error",
      );
      content = safeFallbackContent(intent);
      generationDegraded = true;
    }
  }

  const phrase = content.primaryPhrase;
  const phraseActions = phrase
    ? buildPhraseActions({
        id: `generated-${intent.intent}`,
        phraseCn: phrase.phraseCn,
      })
    : [];
  const generatedActions = buildGeneratedActions(
    content.actions,
    intent.city ?? input.city,
  );
  const selectedSuggestions = selectSuggestedQuestions(
    content.suggestedQuestions,
    suggestions,
  );

  const sourceCoverage = references.length >= 2 ? "partial" : references.length ? "weak" : "none";
  // The MVP only uses internal/manual references, so AI-assisted cards cannot
  // reach strong source coverage and always require confirmation.
  const requiresHumanReview = true;

  const card: UnifiedHelpCard = {
    cardId: `ai-${intent.intent}-${Date.now()}`,
    renderMode: "ai_assisted_card",
    title: content.title,
    category: intent.category,
    intent: intent.intent,
    scenario: intent.scenario,
    status: {
      verified: false,
      sourceType: "ai_generated_with_sources",
      confidence: sourceCoverage === "partial" ? 0.62 : 0.45,
      sourceCoverage,
      requiresHumanReview,
    },
    content: {
      situation: content.situation,
      steps: content.steps,
      primaryPhrase: content.primaryPhrase,
      fallback: content.fallback,
      warnings: content.warnings,
    },
    actions: [
      ...phraseActions,
      ...generatedActions,
      ...appActions,
      { id: "save-card", type: "save_card", label: "Save card", value: intent.intent },
      { id: "feedback", type: "feedback", label: "Did this help?", value: intent.intent },
    ],
    references,
    suggestedQuestions: selectedSuggestions,
    metadata: {
      city: intent.city,
      language,
      generatedAt: new Date().toISOString(),
      toolsUsed: [
        "searchHelpCards",
        "getPhraseCards",
        "getAppActions",
        "searchReferences",
        "getSuggestedQuestions",
      ],
      model: modelUsed ?? LLM_MODELS[DEFAULT_LLM_MODEL].model,
      degradedMode: generationDegraded,
    },
  };

  card.relatedCards = await buildRelatedCards({
    input,
    coreCard: card,
    suggestions: selectedSuggestions,
    intent,
    language,
    scenarioType,
  });

  return card;
}

async function buildRelatedCards({
  input,
  coreCard,
  suggestions,
  intent,
  language,
  scenarioType,
}: {
  input: HelpAgentInput;
  coreCard: UnifiedHelpCard;
  suggestions: UnifiedHelpCard["suggestedQuestions"];
  intent: ProblemIntent;
  language: string;
  scenarioType: ScenarioType;
}): Promise<RelatedHelpCard[]> {
  return generateRelatedCards({
    input,
    coreCard,
    suggestions,
    intent,
    language,
    scenarioType,
  });
}

async function generateRelatedCards({
  input,
  coreCard,
  suggestions,
  intent,
  language,
  scenarioType,
}: {
  input: HelpAgentInput;
  coreCard: UnifiedHelpCard;
  suggestions: UnifiedHelpCard["suggestedQuestions"];
  intent: ProblemIntent;
  language: string;
  scenarioType: ScenarioType;
}): Promise<RelatedHelpCard[]> {
  try {
    const result = await generateJsonWithFallback<GeneratedRelatedCardsPayload>({
      messages: [
        { role: "system", content: relatedCardsSystemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            scenario_type: scenarioType,
            user_query: input.message,
            user_location: input.city,
            interface_language: language,
            userProfileContext: input.userProfileContext,
            available_context: {
              selectedScenario: input.selectedScenario,
              coreCard: {
                title: coreCard.title,
                category: coreCard.category,
                intent: coreCard.intent,
                situation: coreCard.content.situation,
                steps: coreCard.content.steps,
              },
              suggestedQuestions: suggestions,
            },
          }),
        },
      ],
    });
    const generated = normalizeRelatedCardsPayload(result.data, {
      input,
      intent,
      language,
      model: result.model,
    });
    if (generated.length === 3) return generated;
  } catch (error) {
    console.warn(
      "[ChinaMate Agent] Related-card LLM unavailable; using generated fallback:",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  return fallbackGeneratedRelatedCards({ input, intent, language, scenarioType });
}

function scenarioTypeFromInput(input: HelpAgentInput): ScenarioType {
  if (input.selectedScenario === "task" || input.selectedScenario === "need_to_do") {
    return "need_to_do";
  }
  return "something_wrong";
}

function systemPromptForScenario(scenarioType: ScenarioType) {
  return scenarioType === "need_to_do"
    ? needToDoCardSystemPrompt
    : somethingWrongCardSystemPrompt;
}

function needsRequery(message: string) {
  const text = message.trim().toLowerCase();
  if (text.length < 10) return true;
  const genericPatterns = [
    /^help$/,
    /^help me$/,
    /^i need help$/,
    /^something went wrong$/,
    /^i need to do something$/,
    /^what should i do$/,
    /^it does not work$/,
    /^can't do it$/,
    /^cannot do it$/,
  ];
  return genericPatterns.some((pattern) => pattern.test(text));
}

function createClarificationCard({
  input,
  language,
  scenarioType,
}: {
  input: HelpAgentInput;
  language: string;
  scenarioType: ScenarioType;
}): UnifiedHelpCard {
  const needToDo = scenarioType === "need_to_do";
  return {
    cardId: `clarify-${Date.now()}`,
    renderMode: "clarification",
    title: needToDo ? "Tell us what you need to do" : "Tell us what went wrong",
    category: "other",
    intent: "needs_clarification",
    scenario: scenarioType,
    status: {
      verified: false,
      sourceType: "needs_clarification",
      confidence: 0.2,
      sourceCoverage: "none",
      requiresHumanReview: true,
    },
    content: {
      situation:
        "The request is too general to choose a reliable official entry, phone path, or Chinese phrase.",
      steps: needToDo
        ? [
            "Name the service or place you are trying to use.",
            "Describe the task you want to finish.",
            "Add your city and any account, ticket, reservation, payment, or document context.",
          ]
        : [
            "Name the service, app, place, booking, or payment that failed.",
            "Copy the exact error message or describe the failed step.",
            "Add what you already tried and whether money, identity documents, tickets, or time limits are involved.",
          ],
      primaryPhrase: {
        targetRole: "For hotel front desk or local staff",
        phraseCn: needToDo
          ? "您好，我想办理一件事，但不确定入口。可以帮我确认应该去哪里办理吗？"
          : "您好，我遇到了问题，但不确定原因。可以帮我看一下应该联系哪里吗？",
        phraseEn: needToDo
          ? "I want to handle a task but I am not sure where to start. Could you help me confirm the right place?"
          : "I have a problem but I am not sure what caused it. Could you help me check who I should contact?",
      },
      fallback: [
        "Use an official app, official website, ticket, receipt, hotel desk, or staffed service counter for contact details.",
        "Do not share passwords, verification codes, or full bank card numbers.",
      ],
      warnings: ["ChinaMate needs a more specific prompt before giving a reliable action card."],
    },
    actions: [
      {
        id: "copy-better-prompt",
        type: "copy_text",
        label: "Copy better prompt format",
        value: needToDo
          ? "I need to [task] in [city/place]. I have [documents/payment/account]. I already tried [step]."
          : "Something went wrong with [service/app/place]. The error says [message]. I already tried [step].",
        metadata: {
          copyText: needToDo
            ? "I need to [task] in [city/place]. I have [documents/payment/account]. I already tried [step]."
            : "Something went wrong with [service/app/place]. The error says [message]. I already tried [step].",
        },
      },
    ],
    references: [],
    suggestedQuestions: [
      {
        label: needToDo
          ? "I need to pay, book, register, or ask for help"
          : "A payment, booking, taxi, app, or entrance failed",
        intent: "rewrite_prompt",
      },
    ],
    metadata: {
      city: input.city,
      language,
      generatedAt: new Date().toISOString(),
      toolsUsed: ["requeryGuard"],
      degradedMode: true,
    },
  };
}

function normalizeRelatedCardsPayload(
  raw: GeneratedRelatedCardsPayload,
  context: {
    input: HelpAgentInput;
    intent: ProblemIntent;
    language: string;
    model?: string;
  },
): RelatedHelpCard[] {
  if (!Array.isArray(raw.cards)) return [];
  return raw.cards
    .slice(0, 3)
    .map((card, index) =>
      generatedRelatedCardToUnified({
        card,
        index,
        input: context.input,
        intent: context.intent,
        language: context.language,
        model: context.model,
      }),
    );
}

function generatedRelatedCardToUnified({
  card,
  index,
  input,
  intent,
  language,
  model,
}: {
  card: GeneratedRelatedCard;
  index: number;
  input: HelpAgentInput;
  intent: ProblemIntent;
  language: string;
  model?: string;
}): RelatedHelpCard {
  const category =
    card.category && validCategories.has(card.category)
      ? card.category
      : intent.category;
  const normalized = normalizeAssistedContent(
    {
      ...card,
      suggestedQuestions: [],
    },
    {
      ...intent,
      category,
      intent: card.intent ?? `related_${index + 1}`,
      userNeed: card.title ?? intent.userNeed,
    },
  );

  const phraseActions = normalized.primaryPhrase
    ? buildPhraseActions({
        id: `related-${index + 1}`,
        phraseCn: normalized.primaryPhrase.phraseCn,
      })
    : [];

  return {
    cardId: `related_${index + 1}`,
    renderMode: "ai_assisted_card",
    title: normalized.title,
    category,
    intent: card.intent ?? `related_${index + 1}`,
    scenario: card.relationReason,
    status: {
      verified: false,
      sourceType: "ai_generated_with_sources",
      confidence: 0.5,
      sourceCoverage: "weak",
      requiresHumanReview: true,
    },
    content: {
      situation: card.relationReason
        ? `${normalized.situation} ${card.relationReason}`
        : normalized.situation,
      steps: normalized.steps.slice(0, 4),
      primaryPhrase: normalized.primaryPhrase,
      fallback: normalized.fallback.slice(0, 2),
      warnings: normalized.warnings,
    },
    actions: [
      ...phraseActions,
      ...buildGeneratedActions(normalized.actions, intent.city ?? input.city),
    ],
    references: [],
    suggestedQuestions: [],
    metadata: {
      city: intent.city ?? input.city,
      language,
      generatedAt: new Date().toISOString(),
      toolsUsed: ["generateRelatedCards"],
      model,
    },
  };
}

function fallbackGeneratedRelatedCards({
  input,
  intent,
  language,
  scenarioType,
}: {
  input: HelpAgentInput;
  intent: ProblemIntent;
  language: string;
  scenarioType: ScenarioType;
}): RelatedHelpCard[] {
  const cards: GeneratedRelatedCard[] =
    scenarioType === "need_to_do"
      ? [
          {
            title: "Prepare the information before you start",
            category: intent.category,
            intent: "prepare_required_information",
            relationReason: "Most failed task flows are caused by missing identity, booking, payment, or contact details.",
            situation: "Check what the official page or staffed counter asks for before you begin.",
            steps: [
              "List the service name, city, and official entry you are using.",
              "Prepare passport, ticket, reservation, phone number, payment method, or account details if relevant.",
              "Keep screenshots of each confirmation page.",
            ],
            fallback: ["Ask hotel staff or the official service counter to confirm the required materials."],
          },
          {
            title: "Find the official support channel",
            category: "other",
            intent: "find_official_support",
            relationReason: "If the task cannot be completed online, the safest next step is official support.",
            situation: "Use the official app, official website, ticket, receipt, or service desk instead of third-party links.",
            steps: [
              "Open the official app or website for the service.",
              "Search for customer service, help center, service counter, or contact us.",
              "Describe the exact task and where the flow stopped.",
            ],
            fallback: ["Use the contact details printed on your ticket, receipt, or booking confirmation."],
          },
          {
            title: "Save a Chinese request for staff",
            category: "language",
            intent: "staff_phrase_for_task",
            relationReason: "A concise Chinese sentence helps staff understand the task faster.",
            situation: "Show this when asking a staff member to point you to the right entry.",
            steps: ["Show the Chinese sentence.", "Point to the app, ticket, booking, or document.", "Ask staff to confirm the next step."],
            primaryPhrase: {
              targetRole: "For staff",
              phraseCn: "您好，我想办理这个事项。可以告诉我应该在哪里开始、需要准备什么吗？",
              phraseEn: "Hello, I want to handle this task. Could you tell me where to start and what I need to prepare?",
            },
            fallback: ["Use your hotel front desk if there is no staffed counter nearby."],
          },
        ]
      : [
          {
            title: "Check the exact failed step",
            category: intent.category,
            intent: "check_failed_step",
            relationReason: "Knowing the failed step prevents repeated attempts that may lock an account, duplicate an order, or waste time.",
            situation: "Confirm what failed before trying another payment, booking, or account action.",
            steps: [
              "Take a screenshot of the error.",
              "Check whether money, booking status, ticket status, or account status changed.",
              "Try only one safe retry after confirming the status.",
            ],
            fallback: ["Ask official staff to check the status before paying or booking again."],
          },
          {
            title: "Avoid making the problem worse",
            category: "other",
            intent: "avoid_secondary_loss",
            relationReason: "Many travel problems become worse after duplicate payment, unofficial links, or sharing verification codes.",
            situation: "Pause risky actions until the official status is clear.",
            steps: [
              "Do not share passwords or verification codes.",
              "Do not pay again unless the first payment clearly failed.",
              "Do not use unofficial ticket sellers or support numbers.",
            ],
            fallback: ["Use the official app, website, staffed counter, ticket, receipt, or hotel desk to verify the next step."],
          },
          {
            title: "Ask staff to verify the issue",
            category: "language",
            intent: "staff_phrase_for_problem",
            relationReason: "A clear Chinese sentence helps staff identify whether this is payment, account, booking, or entrance trouble.",
            situation: "Show this when you need a staff member to check the issue without handing over sensitive information.",
            steps: ["Show the Chinese sentence.", "Show only the error screen or ticket information.", "Ask staff which official channel to use."],
            primaryPhrase: {
              targetRole: "For staff",
              phraseCn: "您好，我这里出现了问题。可以帮我确认是哪一步失败了吗？请不要修改我的账户信息。",
              phraseEn: "Hello, I have a problem here. Could you help me confirm which step failed? Please do not change my account information.",
            },
            fallback: ["If staff cannot help, use the official contact details from the app, ticket, receipt, or website."],
          },
        ];

  return cards.map((card, index) =>
    generatedRelatedCardToUnified({
      card,
      index,
      input,
      intent,
      language,
    }),
  );
}

function enforceDomainConsistency(
  intent: ProblemIntent,
  input: HelpAgentInput,
): ProblemIntent {
  const text = input.message.toLowerCase();
  const isMetroExitProblem =
    /(metro|subway|地铁)/i.test(text) &&
    /(exit|gate|turnstile|get out|leave|scan|qr|出站|闸机|扫码)/i.test(text);
  const isLostPassport =
    /(lost|lose|missing|stolen|丢|遗失|被偷).*(passport|护照)|(passport|护照).*(lost|missing|stolen|丢|遗失|被偷)/i.test(
      text,
    );

  if (isLostPassport) {
    return {
      ...intent,
      intent: "passport_lost",
      category: "other",
      scenario: "lost_document",
      urgency: "high",
      userNeed: "needs_police_and_consular_help",
      entities: {
        ...intent.entities,
        document: "passport",
      },
      keywords: [
        ...new Set(["lost passport", "police station", "consulate", ...intent.keywords]),
      ].slice(0, 8),
    };
  }

  if (isMetroExitProblem) {
    return {
      ...intent,
      intent: "metro_exit_problem",
      category: "map",
      scenario: "metro_exit",
      urgency: "high",
      userNeed: "needs_station_exit_assistance",
      entities: {
        ...intent.entities,
        transportMode: "metro",
      },
      keywords: [
        ...new Set([
          "metro",
          "exit gate",
          "QR code",
          ...intent.keywords,
        ]),
      ].slice(0, 8),
    };
  }

  return intent;
}

function normalizeIntent(
  raw: Partial<ProblemIntent>,
  input: HelpAgentInput,
): ProblemIntent {
  const fallback = inferIntent(input);
  return {
    intent: typeof raw.intent === "string" ? raw.intent : fallback.intent,
    category:
      typeof raw.category === "string" &&
      validCategories.has(raw.category as UnifiedCategory)
        ? (raw.category as UnifiedCategory)
        : fallback.category,
    scenario:
      typeof raw.scenario === "string"
        ? raw.scenario
        : input.selectedScenario ?? fallback.scenario,
    city: input.city ?? (typeof raw.city === "string" ? raw.city : undefined),
    urgency:
      raw.urgency === "low" || raw.urgency === "medium" || raw.urgency === "high"
        ? raw.urgency
        : fallback.urgency,
    userNeed:
      typeof raw.userNeed === "string" ? raw.userNeed : fallback.userNeed,
    entities:
      raw.entities && typeof raw.entities === "object"
        ? Object.fromEntries(
            Object.entries(raw.entities).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : fallback.entities,
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords.filter((item): item is string => typeof item === "string").slice(0, 8)
      : fallback.keywords,
  };
}

function inferIntent(input: HelpAgentInput): ProblemIntent {
  const text = input.message.toLowerCase();
  const base = {
    city: input.city,
    urgency: "medium" as const,
    entities: {},
    keywords: text.split(/\W+/).filter(Boolean).slice(0, 8),
  };

  if (
    /(qr|scan|扫码).*(menu|order|菜单|点餐)|(menu|order).*(qr|scan)/i.test(text)
  ) {
    return {
      ...base,
      intent: "qr_ordering",
      category: "food",
      scenario: "restaurant",
      userNeed: "needs_staff_ordering_help",
    };
  }
  if (/(alipay|wechat pay|card|cash|pay|支付|付款)/i.test(text)) {
    return {
      ...base,
      intent: "payment_failed",
      category: "payment",
      scenario: /restaurant|餐厅/.test(text) ? "restaurant" : input.selectedScenario,
      urgency: "high",
      userNeed: "needs_payment_alternative",
      entities: { app: /alipay/.test(text) ? "Alipay" : "payment" },
    };
  }
  if (/(reservation|booking|预约)/i.test(text) && /(museum|attraction|景点|博物馆)/i.test(text)) {
    return {
      ...base,
      intent: "attraction_reservation",
      category: "attraction",
      scenario: "reservation",
      userNeed: "needs_reservation_without_local_phone",
      entities: { placeType: /museum/.test(text) ? "museum" : "attraction" },
    };
  }
  if (/(driver|taxi|didi|司机|出租车).*(call|called|phone|电话)/i.test(text)) {
    return {
      ...base,
      intent: "taxi_driver_called",
      category: "taxi",
      scenario: "pickup",
      urgency: "high",
      userNeed: "needs_driver_message",
    };
  }
  if (/(entrance|gate|入口|门).*(find|where|找|哪)|cannot find.*entrance/i.test(text)) {
    return {
      ...base,
      intent: "cannot_find_entrance",
      category: "attraction",
      scenario: "entrance",
      userNeed: "needs_correct_entrance",
    };
  }
  if (/(app|application|应用).*(chinese|中文)|chinese.*app/i.test(text)) {
    return {
      ...base,
      intent: "app_in_chinese",
      category: "app",
      scenario: "local_app",
      userNeed: "needs_app_navigation",
    };
  }
  if (
    /(lose|lost).*(way|direction)|can(?:not|'t) find.*way|where am i|wrong way|迷路|找不到路/i.test(
      text,
    )
  ) {
    return {
      ...base,
      intent: "lost_way",
      category: "map",
      scenario: "navigation",
      userNeed: "needs_directions",
    };
  }
  if (
    /(lost|lose|missing|stolen|丢|遗失|被偷).*(passport|护照)|(passport|护照).*(lost|missing|stolen|丢|遗失|被偷)/i.test(
      text,
    )
  ) {
    return {
      ...base,
      intent: "passport_lost",
      category: "other",
      scenario: "lost_document",
      urgency: "high",
      userNeed: "needs_police_and_consular_help",
      entities: { document: "passport" },
    };
  }
  return {
    ...base,
    intent: "other_problem",
    category: "other",
    scenario: input.selectedScenario,
    userNeed: "needs_local_help",
  };
}

function normalizeAssistedContent(
  raw: AssistedContent,
  intent: ProblemIntent,
): AssistedContent {
  const fallback = safeFallbackContent(intent);
  return {
    title: typeof raw.title === "string" ? raw.title : fallback.title,
    situation:
      typeof raw.situation === "string" ? raw.situation : fallback.situation,
    steps: validStringArray(raw.steps, fallback.steps),
    primaryPhrase:
      raw.primaryPhrase &&
      typeof raw.primaryPhrase.targetRole === "string" &&
      typeof raw.primaryPhrase.phraseCn === "string" &&
      typeof raw.primaryPhrase.phraseEn === "string"
        ? raw.primaryPhrase
        : fallback.primaryPhrase,
    fallback: validStringArray(raw.fallback, fallback.fallback),
    warnings: validStringArray(raw.warnings, fallback.warnings ?? []),
    actions: normalizeGeneratedActionHints(raw.actions),
    suggestedQuestions: normalizeGeneratedQuestions(raw.suggestedQuestions),
  };
}

function normalizeGeneratedActionHints(value: unknown): GeneratedActionHint[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .flatMap((item) => {
      const type = item.type;
      const label = item.label;
      const actionValue = item.value;
      if (
        (type !== "copy_text" && type !== "open_map" && type !== "open_url") ||
        typeof label !== "string" ||
        typeof actionValue !== "string"
      ) {
        return [];
      }
      if (type === "open_url" && !isSafeHttpsUrl(actionValue)) return [];
      return [
        {
          type: type as GeneratedActionHint["type"],
          label: label.slice(0, 60),
          value: actionValue.slice(0, 300),
          fallbackText:
            typeof item.fallbackText === "string"
              ? item.fallbackText.slice(0, 180)
              : undefined,
        },
      ];
    })
    .slice(0, 4);
}

function normalizeGeneratedQuestions(
  value: unknown,
): NonNullable<AssistedContent["suggestedQuestions"]> {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .flatMap((item) => {
      if (typeof item.label !== "string" || typeof item.intent !== "string") {
        return [];
      }
      return [
        {
          label: item.label.slice(0, 100),
          intent: item.intent.slice(0, 80),
          cardId:
            typeof item.cardId === "string" ? item.cardId.slice(0, 120) : undefined,
        },
      ];
    })
    .slice(0, 3);
}

function buildGeneratedActions(
  hints: GeneratedActionHint[] | undefined,
  city?: string,
): UnifiedHelpCard["actions"] {
  if (!hints?.length) return [];
  return hints.map((hint, index) => {
    if (hint.type === "open_map") {
      const query = [city, hint.value].filter(Boolean).join(" ");
      return {
        id: `generated-map-${index}`,
        type: "open_map" as const,
        label: hint.label,
        value: `https://maps.apple.com/?q=${encodeURIComponent(query)}`,
        metadata: {
          appKey: "apple_maps" as const,
          fallbackText:
            hint.fallbackText ??
            `If the map does not open, copy “${hint.value}” into your map app.`,
          copyText: hint.value,
        },
      };
    }
    return {
      id: `generated-${hint.type}-${index}`,
      type: hint.type,
      label: hint.label,
      value: hint.value,
      metadata: {
        copyText: hint.type === "copy_text" ? hint.value : undefined,
        fallbackText: hint.fallbackText,
      },
    };
  });
}

function selectSuggestedQuestions(
  generated: AssistedContent["suggestedQuestions"],
  candidates: UnifiedHelpCard["suggestedQuestions"],
): UnifiedHelpCard["suggestedQuestions"] {
  if (!generated?.length) return [];
  const candidateIds = new Set(
    candidates.flatMap((question) => (question.cardId ? [question.cardId] : [])),
  );
  return generated.slice(0, 3).map((question) => ({
    label: question.label,
    intent: question.intent,
    cardId:
      question.cardId && candidateIds.has(question.cardId)
        ? question.cardId
        : undefined,
  }));
}

function isSafeHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const allowedDomains = [
      "gov.cn",
      "fmprc.gov.cn",
      "nia.gov.cn",
      "mps.gov.cn",
    ];
    return allowedDomains.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

function safeFallbackContent(intent: ProblemIntent): AssistedContent {
  if (intent.intent === "passport_lost") {
    return {
      title: "I lost my passport",
      situation:
        "Use this when your passport is missing or may have been stolen in China.",
      steps: [
        "Go to the nearest police station and report the loss.",
        "Keep the police report and contact your country’s embassy or consulate.",
        "Ask your hotel to help confirm your address and official contact details.",
      ],
      primaryPhrase: {
        targetRole: "For police staff",
        phraseCn: "我的护照丢了。我想报案，请问可以帮我吗？谢谢！",
        phraseEn:
          "I lost my passport. I would like to report it. Could you help me?",
      },
      fallback: [
        "Ask your hotel front desk to call the nearest police station.",
        "Contact your embassy or consulate using its official website or phone number.",
        "Keep digital copies of your passport, visa, police report and travel bookings.",
      ],
      warnings: [
        "Use official police and consular channels. Do not pay an unofficial person to replace a passport.",
      ],
      actions: [
        {
          type: "copy_text",
          label: "Copy 派出所",
          value: "派出所",
        },
        {
          type: "open_map",
          label: "Find nearest police station",
          value: "nearest police station 派出所",
          fallbackText: "Copy 派出所 into your preferred map app.",
        },
      ],
      suggestedQuestions: [
        {
          label: "How do I contact my embassy or consulate?",
          intent: "contact_consulate",
        },
        {
          label: "What documents should I keep after reporting the loss?",
          intent: "lost_passport_documents",
        },
      ],
    };
  }

  if (intent.intent === "lost_way") {
    return {
      title: "I lost my way",
      situation:
        "Use this when you are unsure where you are or cannot find the route to your destination.",
      steps: [
        "Stop somewhere safe and check your current map location.",
        "Show the destination name or address to uniformed staff.",
        "Confirm the route or official taxi pickup point before moving on.",
      ],
      primaryPhrase: {
        targetRole: "For a local staff member",
        phraseCn: "您好，我迷路了。请问怎么去这个地址？可以在地图上指给我看吗？谢谢！",
        phraseEn:
          "Hello, I am lost. How can I get to this address? Could you show me on the map?",
      },
      fallback: [
        "Go to a metro service desk, police kiosk, hotel, or staffed shop.",
        "Ask your hotel to send its Chinese address and nearest landmark.",
        "Use an official taxi queue if walking directions remain unclear.",
      ],
      warnings: [
        "Stay in a well-lit public place and do not follow an unknown person to an isolated area.",
      ],
    };
  }

  if (intent.intent === "attraction_reservation") {
    return {
      title: "I need help with an attraction reservation",
      situation:
        "Use this when an attraction asks for a reservation or Chinese phone number and you cannot complete the booking.",
      steps: [
        "Go to the official visitor service or ticket counter.",
        "Show your passport and ask whether staff can make or verify the reservation.",
        "Confirm the entry time, entrance, and accepted identification before paying.",
      ],
      primaryPhrase: {
        targetRole: "For attraction staff",
        phraseCn:
          "我没有中国手机号，无法完成预约。请问可以用护照现场预约或购票吗？谢谢！",
        phraseEn:
          "I do not have a Chinese phone number and cannot complete the reservation. Can I reserve or buy a ticket here with my passport?",
      },
      fallback: [
        "Ask the official service desk for the venue’s approved booking method.",
        "Ask your hotel front desk to help verify the official reservation channel.",
        "Choose another time or attraction if same-day entry is unavailable.",
      ],
      warnings: [
        "Reservation rules can change. Confirm with official venue staff before paying.",
      ],
    };
  }

  return {
    title: "I need local help",
    situation:
      "ChinaMate does not yet have a reviewed card for this exact situation.",
    steps: [
      "Ask uniformed staff or an official service counter.",
      "Show the short Chinese request below.",
      "Confirm important details before paying or sharing personal information.",
    ],
    primaryPhrase: {
      targetRole: "For a local staff member",
      phraseCn: "您好，我遇到了一些问题。可以请您告诉我下一步应该怎么做吗？谢谢！",
      phraseEn:
        "Hello, I have a problem. Could you tell me what I should do next?",
    },
    fallback: [
      "Ask your hotel front desk for help.",
      "Use an official service counter or hotline.",
      "Save screenshots and receipts before trying another option.",
    ],
    warnings: ["Do not share passwords, verification codes, or payment PINs."],
  };
}

function targetRoleFor(category: UnifiedCategory) {
  if (category === "attraction") return "Attraction staff";
  if (category === "food" || category === "payment") return "Restaurant staff";
  if (category === "taxi") return "Taxi driver";
  return "A local person nearby";
}

function validStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 6)
    : fallback;
}
