"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProblemList } from "@/components/problem-list";
import { ChineseShowCard } from "@/components/chinese-show-card";
import { UnifiedHelpCardView } from "@/components/unified-help-card-view";
import type { HelpMode, PhraseCard, PickerOption } from "@/data/helpCards";
import type { UnifiedHelpCard } from "@/lib/agent/types";
import { getUserProfileContext, loadAdminProfile } from "@/lib/profile";

type HelpModeContent = {
  title: string;
  subtitle: string;
  options: PickerOption[];
};

const modeExamples: Record<HelpMode, string[]> = {
  task: [
    "I need to pay for dinner, but I only have Visa and cash.",
    "I need to take a taxi to my hotel and show the driver Chinese.",
    "I need to order vegetarian food, but the menu is in a QR code.",
  ],
  problem: [
    "My Alipay does not work and the restaurant does not accept my card.",
    "The museum needs a reservation, but I do not have a Chinese phone number.",
    "The taxi driver called me and I cannot understand what he says.",
  ],
  chinese: [
    "I need a Chinese phrase for a taxi driver.",
    "I need a Chinese phrase for restaurant staff.",
    "I need a Chinese phrase for hotel front desk help.",
  ],
};

export function HelpModeWorkspace({
  mode,
  content,
  contentByMode,
}: {
  mode: HelpMode;
  content: HelpModeContent;
  contentByMode?: Record<HelpMode, HelpModeContent>;
}) {
  const [selectedMode, setSelectedMode] = useState(mode);
  const [message, setMessage] = useState("");
  const [city, setCity] = useState("Shanghai");
  const [result, setResult] = useState<UnifiedHelpCard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const currentContent = contentByMode?.[selectedMode] ?? content;

  const supportsAgent = selectedMode === "task" || selectedMode === "problem";

  useEffect(() => {
    const profile = loadAdminProfile();
    setCity(profile.currentCity);

    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const promptParam = params.get("prompt");
    if (
      contentByMode &&
      (modeParam === "task" ||
        modeParam === "problem" ||
        modeParam === "chinese")
    ) {
      setSelectedMode(modeParam);
    }
    if (promptParam) setMessage(promptParam.slice(0, 1200));
  }, [contentByMode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supportsAgent || message.trim().length < 3) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const profile = loadAdminProfile();
      const userProfileContext = profile.aiPersonalizationEnabled
        ? getUserProfileContext()
        : undefined;
      const response = await fetch("/api/agent/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          city,
          language: "en",
          selectedScenario: selectedMode,
          userProfileContext,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to build a Help Card.");
      }
      setResult(payload as UnifiedHelpCard);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to build a Help Card.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <UnifiedHelpCardView
        card={result}
        backHref={contentByMode ? "/help" : `/help/${selectedMode}`}
        backLabel={currentContent.title}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">Local help</p>
        <h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">
          {contentByMode ? "How can we help?" : currentContent.title}
        </h1>
        <p className="mt-3 text-base text-ink/55">
          {contentByMode
            ? "Describe the task or problem. ChinaMate will build one action card and three situation-specific related cards."
            : currentContent.subtitle}
        </p>
      </header>

      {contentByMode && (
        <div className="mb-5 grid gap-2 rounded-[24px] bg-white p-2 shadow-card sm:grid-cols-3">
          {(["task", "problem", "chinese"] as HelpMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSelectedMode(item);
                setError("");
              }}
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                selectedMode === item
                  ? "bg-ink text-white"
                  : "text-ink/58 hover:bg-black/[0.04]"
              }`}
            >
              {contentByMode[item].title}
            </button>
          ))}
        </div>
      )}

      {selectedMode === "chinese" && <CustomChineseComposer />}

      {supportsAgent && (
        <form
          onSubmit={submit}
          className="mb-7 rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-moss">
            <Sparkles className="h-4 w-4" /> AI action card
          </div>
          <label htmlFor="mode-agent-message" className="mt-3 block text-lg font-bold">
            Describe this in your own words.
          </label>
          <p className="mt-1 text-sm leading-6 text-ink/52">
            ChinaMate will generate one directly useful card and three related cards with actions, phone/staff options and Chinese phrases.
          </p>
          <textarea
            id="mode-agent-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            maxLength={1200}
            placeholder={
              selectedMode === "task"
                ? "Example: I need to buy a metro ticket but I cannot use Alipay."
                : "Example: Something went wrong with my reservation at the museum."
            }
            className="mt-4 w-full resize-none rounded-[22px] border border-black/10 bg-paper px-4 py-4 leading-6 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
          />
          <label htmlFor="mode-agent-city" className="mt-4 block text-sm font-bold">
            City
          </label>
          <div className="relative mt-2">
            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-moss" />
            <input
              id="mode-agent-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              maxLength={80}
              className="h-12 w-full rounded-2xl border border-black/10 bg-paper pl-11 pr-4 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
            />
          </div>
          <Button type="submit" disabled={loading || message.trim().length < 3} className="mt-5 w-full">
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Building cards
              </>
            ) : (
              <>
                Generate AI cards <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          {error && (
            <p role="alert" className="mt-4 rounded-2xl bg-[#fff2eb] p-4 text-sm font-semibold text-coral">
              {error}
            </p>
          )}

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/38">
              AI prompt suggestions
            </p>
            <div className="mt-3 space-y-2">
              {modeExamples[selectedMode].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setMessage(example)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#eaf4ef] px-4 py-3 text-left text-sm font-semibold text-moss"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4 shrink-0" />
                    {example}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      <ProblemList options={currentContent.options} />
    </div>
  );
}

function CustomChineseComposer() {
  const [targetRole, setTargetRole] = useState("For staff");
  const [sourceText, setSourceText] = useState("");
  const [chineseText, setChineseText] = useState("");
  const [meaning, setMeaning] = useState("");
  const [usageContext, setUsageContext] = useState("");
  const [toneNote, setToneNote] = useState("");
  const [phrase, setPhrase] = useState<PhraseCard | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");

  if (phrase) return <ChineseShowCard phrase={phrase} backHref="/help" />;

  const translate = async () => {
    const text = sourceText.trim();
    if (!text) return;
    setTranslating(true);
    setTranslationError("");
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: targetRole,
          targetRole,
          text,
          interfaceLanguage: "en",
        }),
      });
      const payload = (await response.json()) as {
        translatedText?: string;
        phraseCn?: string;
        phraseEn?: string;
        usageContext?: string;
        toneNote?: string | null;
        targetRole?: string;
        error?: string;
      };
      const generatedChinese = payload.phraseCn ?? payload.translatedText;
      if (!response.ok || !generatedChinese) {
        throw new Error(payload.error ?? "Translation failed.");
      }
      setChineseText(generatedChinese);
      setMeaning(payload.phraseEn ?? text);
      setUsageContext(payload.usageContext ?? "");
      setToneNote(payload.toneNote ?? "");
      if (payload.targetRole) setTargetRole(payload.targetRole);
    } catch (error) {
      setTranslationError(
        error instanceof Error
          ? error.message
          : "ChinaMate could not generate Chinese. Please enter Chinese manually.",
      );
    } finally {
      setTranslating(false);
    }
  };

  const readChinese = () => {
    const text = chineseText.trim();
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!chineseText.trim()) return;
        setPhrase({
          id: "custom",
          targetRole: targetRole.trim() || "For staff",
          phraseCn: chineseText.trim(),
          phraseEn:
            [meaning.trim(), usageContext.trim()].filter(Boolean).join(" ") ||
            "Custom Chinese phrase",
        });
      }}
      className="mb-7 rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6"
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-moss">
        <Sparkles className="h-4 w-4" /> AI Chinese show card
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/55">
        First describe the scene, then what you need to say. ChinaMate will write natural Chinese you can show or read aloud.
      </p>
      <label htmlFor="custom-target" className="mt-4 block text-sm font-bold">
        Scenario
      </label>
      <input
        id="custom-target"
        value={targetRole}
        onChange={(event) => setTargetRole(event.target.value)}
        maxLength={120}
        placeholder="Example: For shop assistant at a convenience store"
        className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-paper px-4 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
      />
      <label htmlFor="custom-source" className="mt-4 block text-sm font-bold">
        What do you need to say?
      </label>
      <textarea
        id="custom-source"
        value={sourceText}
        onChange={(event) => setSourceText(event.target.value)}
        rows={3}
        maxLength={700}
        placeholder="Example: Where are the chips?"
        className="mt-2 w-full resize-none rounded-[22px] border border-black/10 bg-paper px-4 py-4 leading-6 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
      />
      <Button
        type="button"
        variant="soft"
        disabled={translating || !sourceText.trim()}
        onClick={() => void translate()}
        className="mt-3 w-full"
      >
        {translating ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" /> Writing Chinese
          </>
        ) : (
          <>
            Generate Chinese <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      {translationError && (
        <p role="alert" className="mt-3 rounded-2xl bg-[#fff2eb] p-3 text-sm font-semibold text-coral">
          {translationError}
        </p>
      )}
      <label htmlFor="custom-chinese" className="mt-4 block text-sm font-bold">
        Chinese output
      </label>
      <textarea
        id="custom-chinese"
        value={chineseText}
        onChange={(event) => setChineseText(event.target.value)}
        rows={4}
        placeholder="例如：您好，我不会说中文。可以帮我确认下一步应该怎么做吗？"
        className="mt-2 w-full resize-none rounded-[22px] border border-black/10 bg-paper px-4 py-4 leading-6 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
      />
      <Button
        type="button"
        variant="outline"
        disabled={!chineseText.trim()}
        onClick={readChinese}
        className="mt-3 w-full"
      >
        <Volume2 className="h-4 w-4" /> Read Chinese aloud
      </Button>
      <label htmlFor="custom-meaning" className="mt-4 block text-sm font-bold">
        Meaning
      </label>
      <textarea
        id="custom-meaning"
        value={meaning}
        onChange={(event) => setMeaning(event.target.value)}
        rows={2}
        placeholder="Example: I do not speak Chinese. Could you help me confirm the next step?"
        className="mt-2 w-full resize-none rounded-[22px] border border-black/10 bg-paper px-4 py-4 leading-6 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
      />
      {usageContext && (
        <div className="mt-3 rounded-2xl bg-[#eaf4ef] p-4 text-sm leading-6 text-moss">
          <p className="font-bold">Usage</p>
          <p>{usageContext}</p>
          {toneNote && <p className="mt-2 text-moss/70">{toneNote}</p>}
        </div>
      )}
      <Button type="submit" disabled={!chineseText.trim()} className="mt-5 w-full">
        Create show card <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
