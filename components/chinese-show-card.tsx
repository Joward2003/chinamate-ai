"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Clipboard, Maximize2, Volume2 } from "lucide-react";
import type { PhraseCard } from "@/data/helpCards";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChineseShowCard({
  phrase,
  backHref: customBackHref,
}: {
  phrase: PhraseCard;
  backHref?: string;
}) {
  const [large, setLarge] = useState(false);
  const [copied, setCopied] = useState(false);
  const chineseText = phrase.phraseCn.replaceAll("\n", "");
  const backHref =
    customBackHref ??
    (phrase.relatedCardId ? `/card/${phrase.relatedCardId}` : "/help/chinese");

  const copyText = async () => {
    await navigator.clipboard.writeText(chineseText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const playAudio = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(chineseText);
    utterance.lang = "zh-CN";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="page-shell py-6 md:py-10">
      <div className="mx-auto max-w-[760px]">
        <Link href={backHref} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <section className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white shadow-soft">
          <header className="flex items-center justify-between bg-[#173f32] px-6 py-5 text-white sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">Show your phone</p>
              <h1 className="mt-1 text-lg font-bold">{phrase.targetRole}</h1>
            </div>
            <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold">中文</span>
          </header>

          <div className="p-5 sm:p-8">
            <div className="relative overflow-hidden rounded-[28px] bg-[#eaf4ef] px-5 py-9 text-center sm:px-8 sm:py-12">
              <div className="absolute -right-12 -top-14 h-40 w-40 rounded-full bg-[#f3b995]/25" />
              <p
                lang="zh-CN"
                className={cn(
                  "relative whitespace-pre-line font-bold leading-[1.45] tracking-[0.01em] text-ink transition-all",
                  large ? "text-[34px] sm:text-[46px]" : "text-[28px] sm:text-[38px]",
                )}
              >
                {phrase.phraseCn}
              </p>
            </div>

            <p className="mx-auto mt-6 max-w-xl text-center text-base leading-7 text-ink/62">
              {phrase.phraseEn}
            </p>
            {phrase.pinyin && (
              <p className="mt-2 text-center text-sm italic text-ink/38">{phrase.pinyin}</p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button variant="soft" onClick={playAudio} className="px-3">
                <Volume2 className="h-4 w-4" /> Play audio
              </Button>
              <Button onClick={copyText} className="px-3">
                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied ? "Copied" : "Copy text"}
              </Button>
              <Button variant="outline" onClick={() => setLarge((value) => !value)} className="px-3">
                <Maximize2 className="h-4 w-4" /> {large ? "Normal size" : "Bigger text"}
              </Button>
              <Button variant="outline" asChild className="px-3">
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-ink/40">
          Keep personal and payment details hidden while showing this screen.
        </p>
      </div>
    </div>
  );
}
