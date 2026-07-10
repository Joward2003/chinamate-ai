"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Clipboard,
  ExternalLink,
  Languages,
  Share2,
} from "lucide-react";
import type { AppAction, HelpCard } from "@/data/helpCards";
import { FeedbackBox } from "@/components/feedback-box";

function AppActionButton({
  action,
  onCopied,
}: {
  action: AppAction;
  onCopied: () => void;
}) {
  const Icon = action.type === "copy" ? Clipboard : action.type === "open" ? ExternalLink : ArrowUpRight;

  if (action.type === "guide") {
    return (
      <Link
        href={action.value}
        className="flex min-h-12 items-center justify-between rounded-2xl border border-black/[0.07] bg-white px-4 font-semibold shadow-sm transition hover:border-moss/25"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-moss" /> {action.label}
        </span>
        <ChevronRight className="h-4 w-4 text-ink/30" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        if (action.type === "copy") {
          await navigator.clipboard.writeText(action.value);
          onCopied();
        } else {
          window.open(action.value, "_blank", "noopener,noreferrer");
        }
      }}
      className="flex min-h-12 items-center justify-between rounded-2xl border border-black/[0.07] bg-white px-4 text-left font-semibold shadow-sm transition hover:border-moss/25"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-moss" /> {action.label}
      </span>
      <ChevronRight className="h-4 w-4 text-ink/30" />
    </button>
  );
}

export function HelpCardView({ card }: { card: HelpCard }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveCard = () => {
    const current: string[] = JSON.parse(localStorage.getItem("chinamate-saved") ?? "[]");
    const next = current.includes(card.id)
      ? current.filter((id) => id !== card.id)
      : [...current, card.id];
    localStorage.setItem("chinamate-saved", JSON.stringify(next));
    setSaved(next.includes(card.id));
  };

  const shareCard = async () => {
    const data = { title: card.title, text: card.situation, url: window.location.href };
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    }
  };

  const announceCopied = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="page-shell py-6 md:py-10">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/help/problem" className="flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveCard}
              aria-label={saved ? "Remove saved card" : "Save card"}
              className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white"
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-moss text-moss" : ""}`} />
            </button>
            <button
              type="button"
              onClick={shareCard}
              aria-label="Share card"
              className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <article className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white shadow-card">
          <header className="bg-[#173f32] p-6 text-white sm:p-8">
            <span className="inline-flex rounded-full bg-white/13 px-3 py-1.5 text-xs font-bold tracking-wide text-white/90">
              {card.tag}
            </span>
            <h1 className="font-display mt-5 text-4xl leading-[1.04] sm:text-5xl">{card.title}</h1>
          </header>

          <div className="space-y-8 p-5 sm:p-8">
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">Situation</p>
              <p className="mt-3 leading-7 text-ink/70">{card.situation}</p>
            </section>

            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">Do this first</p>
              <ol className="mt-4 space-y-3">
                {card.steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-moss text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 leading-6">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">Show this in Chinese</p>
              <Link
                href={`/phrase/${card.phraseId}`}
                className="group mt-3 flex items-center gap-4 rounded-[24px] bg-[#eaf4ef] p-5 transition hover:bg-[#dfede5]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-moss shadow-sm">
                  <Languages className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 text-lg font-bold leading-7">{card.phrasePreview}</span>
                <ChevronRight className="h-5 w-5 shrink-0 text-moss transition group-hover:translate-x-1" />
              </Link>
            </section>

            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">Open</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {card.appActions.map((action) => (
                  <AppActionButton key={action.label} action={action} onCopied={announceCopied} />
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">If it still fails</p>
              <ul className="mt-4 space-y-3">
                {card.fallback.map((item) => (
                  <li key={item} className="flex gap-3 text-ink/70">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-moss" />
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {card.avoid && (
              <section className="rounded-[22px] bg-[#fff2eb] p-5">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-coral">
                  <AlertTriangle className="h-4 w-4" /> Avoid
                </p>
                {card.avoid.map((item) => (
                  <p key={item} className="mt-2 leading-6 text-ink/70">{item}</p>
                ))}
              </section>
            )}
          </div>
        </article>

        <div className="mt-5">
          <FeedbackBox cardId={card.id} />
        </div>
      </div>

      {copied && (
        <div role="status" className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft">
          <Check className="h-4 w-4 text-[#8fe0b9]" /> Copied
        </div>
      )}
    </div>
  );
}
