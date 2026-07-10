"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { LocalHelpShell } from "@/components/local-help-shell";
import { UnifiedHelpCardView } from "@/components/unified-help-card-view";
import type { UnifiedHelpCard } from "@/lib/agent/types";

export default function SavedGeneratedCardPage() {
  const params = useParams<{ cardId: string }>();
  const [card, setCard] = useState<UnifiedHelpCard | null | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("chinamate-unified-saved") ?? "[]",
      ) as UnifiedHelpCard[];
      setCard(stored.find((item) => item.cardId === params.cardId) ?? null);
    } catch {
      setCard(null);
    }
  }, [params.cardId]);

  return (
    <LocalHelpShell>
      <div className="page-shell py-6 md:py-10">
        {card === undefined ? (
          <div className="mx-auto max-w-[760px] rounded-[28px] bg-white p-8 text-center shadow-card">
            <p className="font-semibold text-ink/55">Loading saved card…</p>
          </div>
        ) : card ? (
          <UnifiedHelpCardView
            card={card}
            backHref="/saved"
            backLabel="Saved cards"
          />
        ) : (
          <div className="mx-auto max-w-[760px] rounded-[28px] border border-dashed border-black/15 bg-white/60 p-8 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-moss/45" />
            <h1 className="mt-4 text-xl font-bold">Saved card not found</h1>
            <p className="mt-2 text-sm text-ink/50">
              It may have been removed from this browser.
            </p>
            <Link
              href="/saved"
              className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Back to saved cards
            </Link>
          </div>
        )}
      </div>
    </LocalHelpShell>
  );
}
