"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  ExternalLink,
  Languages,
  MapPin,
  Sparkles,
  Volume2,
} from "lucide-react";
import { FeedbackBox } from "@/components/feedback-box";
import type {
  CardAction,
  UnifiedHelpCard,
} from "@/lib/agent/types";

export function UnifiedHelpCardView({
  card,
  backHref = "/help/agent",
  backLabel = "Ask another question",
}: {
  card: UnifiedHelpCard;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-5 flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
        <MetadataBadge card={card} />
      </div>

      {card.status.requiresHumanReview && (
        <div className="mb-4 flex gap-3 rounded-[22px] bg-[#fff2eb] p-4 text-sm text-ink/70">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
          <p>
            AI-assisted, please confirm important details with official staff.
          </p>
        </div>
      )}

      <article className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white shadow-card">
        <header className="bg-[#173f32] p-6 text-white sm:p-8">
          <span className="inline-flex rounded-full bg-white/13 px-3 py-1.5 text-xs font-bold capitalize tracking-wide text-white/90">
            {card.category} help
          </span>
          <h1 className="font-display mt-5 text-4xl leading-[1.04] sm:text-5xl">
            {card.title}
          </h1>
        </header>

        <div className="space-y-8 p-5 sm:p-8">
          <section>
            <SectionLabel>Situation</SectionLabel>
            <p className="mt-3 leading-7 text-ink/70">{card.content.situation}</p>
          </section>

          <section>
            <SectionLabel tone="moss">Do this first</SectionLabel>
            <ol className="mt-4 space-y-3">
              {card.content.steps.map((step, index) => (
                <li key={`${index}-${step}`} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-moss text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 leading-6">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {card.content.primaryPhrase && (
            <section id="primary-phrase" className="scroll-mt-28">
              <SectionLabel tone="moss">Show this in Chinese</SectionLabel>
              <div className="mt-3 rounded-[24px] bg-[#eaf4ef] p-5 text-center">
                <p
                  lang="zh-CN"
                  className="whitespace-pre-line text-2xl font-bold leading-[1.45] text-ink"
                >
                  {card.content.primaryPhrase.phraseCn}
                </p>
                <p className="mt-4 text-sm leading-6 text-ink/55">
                  {card.content.primaryPhrase.phraseEn}
                </p>
              </div>
            </section>
          )}

          <ActionLayer actions={card.actions} card={card} />

          <section>
            <SectionLabel>If it still fails</SectionLabel>
            <ul className="mt-4 space-y-3">
              {card.content.fallback.map((item) => (
                <li key={item} className="flex gap-3 text-ink/70">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-moss" />
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {!!card.content.warnings?.length && (
            <section className="rounded-[22px] bg-[#fff2eb] p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-coral">
                <AlertTriangle className="h-4 w-4" /> Check first
              </p>
              {card.content.warnings.map((warning) => (
                <p key={warning} className="mt-2 leading-6 text-ink/70">
                  {warning}
                </p>
              ))}
            </section>
          )}

          <ReferencesList card={card} />
          <RelatedCards card={card} />
          <SuggestedQuestions card={card} />
        </div>
      </article>

      <div className="mt-5">
        <FeedbackBox cardId={card.cardId} />
      </div>
    </div>
  );
}

function MetadataBadge({ card }: { card: UnifiedHelpCard }) {
  if (card.status.verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf4ef] px-3 py-2 text-xs font-bold text-moss">
        <CheckCircle2 className="h-4 w-4" /> Verified
      </span>
    );
  }
  if (card.renderMode === "clarification") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff2eb] px-3 py-2 text-xs font-bold text-coral">
        <AlertTriangle className="h-4 w-4" /> Needs confirmation
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff2eb] px-3 py-2 text-xs font-bold text-coral">
      <Sparkles className="h-4 w-4" /> AI-assisted
    </span>
  );
}

function ActionLayer({
  actions,
  card,
}: {
  actions: CardAction[];
  card: UnifiedHelpCard;
}) {
  const [notice, setNotice] = useState("");

  const runAction = async (action: CardAction) => {
    if (action.type === "show_phrase") {
      document.getElementById("primary-phrase")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (action.type === "copy_text") {
      await navigator.clipboard.writeText(action.metadata?.copyText ?? action.value);
      setNotice("Chinese copied");
      return;
    }
    if (action.type === "read_aloud") {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(action.value);
      utterance.lang = "zh-CN";
      utterance.rate = 0.82;
      window.speechSynthesis.speak(utterance);
      setNotice("Playing Chinese");
      return;
    }
    if (action.type === "save_card") {
      const current = JSON.parse(
        localStorage.getItem("chinamate-unified-saved") ?? "[]",
      ) as UnifiedHelpCard[];
      const next = [card, ...current.filter((item) => item.cardId !== card.cardId)];
      localStorage.setItem("chinamate-unified-saved", JSON.stringify(next.slice(0, 20)));
      setNotice("Card saved");
      return;
    }
    if (
      action.type === "open_app" ||
      action.type === "open_map" ||
      action.type === "open_url"
    ) {
      window.open(action.value, "_blank", "noopener,noreferrer");
      if (action.metadata?.fallbackText) setNotice(action.metadata.fallbackText);
    }
  };

  const visible = actions.filter((action) => action.type !== "feedback");
  if (!visible.length) return null;

  return (
    <section>
      <SectionLabel tone="moss">Actions</SectionLabel>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {visible.map((action) => {
          const Icon = actionIcon(action.type);
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => void runAction(action)}
              className="flex min-h-12 items-center justify-between rounded-2xl border border-black/[0.07] bg-white px-4 text-left font-semibold shadow-sm transition hover:border-moss/25"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-moss" /> {action.label}
              </span>
              <ChevronRight className="h-4 w-4 text-ink/30" />
            </button>
          );
        })}
      </div>
      {notice && (
        <p role="status" className="mt-3 rounded-2xl bg-[#eaf4ef] px-4 py-3 text-sm font-semibold text-moss">
          {notice}
        </p>
      )}
    </section>
  );
}

function ReferencesList({ card }: { card: UnifiedHelpCard }) {
  if (!card.references.length) return null;
  return (
    <section>
      <SectionLabel tone="moss">References</SectionLabel>
      <div className="mt-3 space-y-2">
        {card.references.map((reference, index) => (
          <div
            key={`${reference.type}-${reference.id ?? index}`}
            className="rounded-2xl border border-black/[0.06] bg-paper p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{reference.title}</p>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-ink/35">
                {reference.type.replaceAll("_", " ")}
              </span>
            </div>
            {reference.excerpt && (
              <p className="mt-2 text-sm leading-5 text-ink/50">{reference.excerpt}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedCards({ card }: { card: UnifiedHelpCard }) {
  if (!card.relatedCards?.length) return null;
  return (
    <section>
      <SectionLabel tone="moss">Related AI cards</SectionLabel>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {card.relatedCards.slice(0, 3).map((related) => (
          <article
            key={related.cardId}
            className="rounded-[22px] border border-black/[0.06] bg-paper p-4"
          >
            <div>
              <span className="inline-flex rounded-full bg-[#eaf4ef] px-2.5 py-1 text-[11px] font-bold capitalize text-moss">
                {related.category}
              </span>
              <h3 className="mt-3 text-base font-bold leading-5">
                {related.title}
              </h3>
              <p className="mt-2 text-sm leading-5 text-ink/55">
                {related.content.situation}
              </p>
            </div>
            <ol className="mt-3 space-y-2">
              {related.content.steps.slice(0, 3).map((step, index) => (
                <li key={`${related.cardId}-${step}`} className="flex gap-2 text-sm leading-5 text-ink/70">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-moss text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            {related.content.primaryPhrase && (
              <div className="mt-3 rounded-2xl bg-white p-3">
                <p lang="zh-CN" className="text-sm font-bold leading-5 text-ink">
                  {related.content.primaryPhrase.phraseCn}
                </p>
                <p className="mt-1 text-xs leading-4 text-ink/45">
                  {related.content.primaryPhrase.phraseEn}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function SuggestedQuestions({ card }: { card: UnifiedHelpCard }) {
  if (!card.suggestedQuestions.length) return null;
  return (
    <section>
      <SectionLabel tone="moss">You may also need</SectionLabel>
      <div className="mt-3 space-y-2">
        {card.suggestedQuestions.map((question) => (
          <Link
            key={`${question.intent}-${question.label}`}
            href={
              question.cardId
                ? `/card/${question.cardId}`
                : `/help/agent?question=${encodeURIComponent(question.label)}`
            }
            className="flex items-center justify-between rounded-2xl bg-[#eaf4ef] px-4 py-3 font-semibold text-moss"
          >
            {question.label} <ArrowUpRight className="h-4 w-4" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({
  children,
  tone = "coral",
}: {
  children: React.ReactNode;
  tone?: "coral" | "moss";
}) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.16em] ${
        tone === "moss" ? "text-moss" : "text-coral"
      }`}
    >
      {children}
    </p>
  );
}

function actionIcon(type: CardAction["type"]) {
  if (type === "show_phrase") return Languages;
  if (type === "copy_text") return Clipboard;
  if (type === "read_aloud") return Volume2;
  if (type === "open_map") return MapPin;
  if (type === "save_card") return Bookmark;
  if (type === "open_app") return ExternalLink;
  return ArrowUpRight;
}
