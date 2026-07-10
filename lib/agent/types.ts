import type { HelpCategory } from "@/data/helpCards";
import type { UserProfileContext } from "@/lib/profile";

export type UnifiedCategory =
  | HelpCategory
  | "map"
  | "language"
  | "other";

export type ProblemIntent = {
  intent: string;
  category: UnifiedCategory;
  scenario?: string;
  city?: string;
  urgency: "low" | "medium" | "high";
  userNeed: string;
  entities: Record<string, string>;
  keywords: string[];
};

export type CardAction = {
  id: string;
  type:
    | "show_phrase"
    | "copy_text"
    | "read_aloud"
    | "open_app"
    | "open_map"
    | "open_url"
    | "save_card"
    | "feedback";
  label: string;
  value: string;
  metadata?: {
    appKey?:
      | "alipay"
      | "wechat"
      | "didi"
      | "uber"
      | "amap"
      | "google_maps"
      | "apple_maps";
    fallbackText?: string;
    copyText?: string;
  };
};

export type ReferenceItem = {
  type:
    | "internal_help_card"
    | "internal_phrase_card"
    | "manual_knowledge"
    | "place_card"
    | "official_source"
    | "web_source";
  title: string;
  id?: string;
  url?: string;
  excerpt?: string;
};

export type SuggestedQuestion = {
  label: string;
  cardId?: string;
  intent: string;
};

export type UnifiedHelpCard = {
  cardId: string;
  renderMode: "approved_card" | "ai_assisted_card" | "clarification";
  title: string;
  category: UnifiedCategory;
  intent: string;
  scenario?: string;
  status: {
    verified: boolean;
    sourceType:
      | "approved_card"
      | "ai_generated_with_sources"
      | "needs_clarification";
    confidence: number;
    sourceCoverage: "strong" | "partial" | "weak" | "none";
    requiresHumanReview: boolean;
  };
  content: {
    situation: string;
    steps: string[];
    primaryPhrase?: {
      targetRole: string;
      phraseCn: string;
      phraseEn: string;
    };
    fallback: string[];
    warnings?: string[];
  };
  actions: CardAction[];
  references: ReferenceItem[];
  suggestedQuestions: SuggestedQuestion[];
  relatedCards?: RelatedHelpCard[];
  metadata: {
    city?: string;
    language: string;
    generatedAt: string;
    toolsUsed: string[];
    matchedExistingCardId?: string;
    model?: string;
    degradedMode?: boolean;
  };
};

export type RelatedHelpCard = Omit<UnifiedHelpCard, "relatedCards">;

export type HelpAgentInput = {
  message: string;
  city?: string;
  language?: string;
  selectedScenario?: string;
  currentCardId?: string;
  userProfileContext?: UserProfileContext;
};
