"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, ChevronRight, Sparkles } from "lucide-react";
import { LocalHelpShell } from "@/components/local-help-shell";
import { helpCards, type HelpCard } from "@/data/helpCards";
import type { UnifiedHelpCard } from "@/lib/agent/types";

export default function SavedPage() {
  const [savedApproved, setSavedApproved] = useState<HelpCard[]>([]);
  const [savedGenerated, setSavedGenerated] = useState<UnifiedHelpCard[]>([]);

  useEffect(() => {
    const ids = readLocalStorage<string[]>("chinamate-saved", []);
    const generated = readLocalStorage<UnifiedHelpCard[]>(
      "chinamate-unified-saved",
      [],
    );
    setSavedApproved(helpCards.filter((card) => ids.includes(card.id)));
    setSavedGenerated(
      generated.filter(
        (card) =>
          card &&
          typeof card.cardId === "string" &&
          typeof card.title === "string",
      ),
    );
  }, []);

  const hasSavedCards = savedApproved.length > 0 || savedGenerated.length > 0;

  return (
    <LocalHelpShell>
      <div className="page-shell py-8 md:py-12">
        <div className="mx-auto max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">Ready when needed</p>
          <h1 className="font-display mt-2 text-4xl sm:text-5xl">Saved cards</h1>
          <p className="mt-3 text-ink/55">Keep useful local help close at hand.</p>

          {hasSavedCards ? (
            <div className="mt-7 space-y-3">
              {savedGenerated.map((card) => (
                <Link
                  key={card.cardId}
                  href={`/saved/${encodeURIComponent(card.cardId)}`}
                  className="flex items-center gap-4 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0e8] text-coral">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{card.title}</span>
                    <span className="mt-1 block text-xs font-semibold text-coral">
                      AI-assisted
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-ink/30" />
                </Link>
              ))}
              {savedApproved.map((card) => (
                <Link key={card.id} href={`/card/${card.id}`} className="flex items-center gap-4 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eaf4ef] text-moss">
                    <Bookmark className="h-5 w-5 fill-moss" />
                  </span>
                  <span className="flex-1 font-bold">{card.title}</span>
                  <ChevronRight className="h-5 w-5 text-ink/30" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-black/15 bg-white/55 p-8 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-moss/50" />
              <p className="mt-4 font-bold">No saved cards yet</p>
              <p className="mt-2 text-sm text-ink/50">Save a help card to find it here.</p>
              <Link href="/help/problem" className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                Browse help cards
              </Link>
            </div>
          )}
        </div>
      </div>
    </LocalHelpShell>
  );
}

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
