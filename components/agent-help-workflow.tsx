"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedHelpCardView } from "@/components/unified-help-card-view";
import type { UnifiedHelpCard } from "@/lib/agent/types";

const examples = [
  "My Alipay doesn't work and the restaurant does not accept my card.",
  "The QR code menu is all Chinese and I cannot order.",
  "The museum needs a reservation but I do not have a Chinese phone number.",
];

export function AgentHelpWorkflow({
  initialQuestion = "",
}: {
  initialQuestion?: string;
}) {
  const [message, setMessage] = useState(initialQuestion);
  const [city, setCity] = useState("Shanghai");
  const [result, setResult] = useState<UnifiedHelpCard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (message.trim().length < 3) return;
    setLoading(true);
    setLoadingHint("");
    setError("");
    setResult(null);
    const fallbackHintTimer = window.setTimeout(() => {
      setLoadingHint("DeepSeek is taking longer than usual. Trying the backup model…");
    }, 7000);

    try {
      const response = await fetch("/api/agent/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, city, language: "en" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to build a Help Card.");
      setResult(payload as UnifiedHelpCard);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to build a Help Card.",
      );
    } finally {
      window.clearTimeout(fallbackHintTimer);
      setLoading(false);
      setLoadingHint("");
    }
  };

  if (result) return <UnifiedHelpCardView card={result} />;

  return (
    <div className="mx-auto max-w-[760px]">
      <header className="mb-7">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-coral">
          <Sparkles className="h-4 w-4" /> Help Card Agent
        </div>
        <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
          Tell us what happened.
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-ink/55">
          ChinaMate will match a reviewed card first. If none fits, it builds one
          compact card from available internal references.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-7"
      >
        <label htmlFor="agent-message" className="text-sm font-bold">
          What do you need help with?
        </label>
        <textarea
          id="agent-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          maxLength={1200}
          placeholder="Example: My Alipay does not work at this restaurant."
          className="mt-3 w-full resize-none rounded-[22px] border border-black/10 bg-paper px-4 py-4 leading-6 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
        />
        <label htmlFor="agent-city" className="mt-5 block text-sm font-bold">
          City
        </label>
        <div className="relative mt-2">
          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-moss" />
          <input
            id="agent-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={80}
            className="h-12 w-full rounded-2xl border border-black/10 bg-paper pl-11 pr-4 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
          />
        </div>
        <Button type="submit" disabled={loading || message.trim().length < 3} className="mt-5 w-full">
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" /> Building Help Card
            </>
          ) : (
            <>
              Get a Help Card <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {loadingHint && (
          <p role="status" className="mt-3 text-center text-sm font-semibold text-ink/50">
            {loadingHint}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-[#fff2eb] p-4 text-sm font-semibold text-coral">
            {error}
          </p>
        )}
      </form>

      <section className="mt-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">
          Try an example
        </p>
        <div className="mt-3 space-y-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setMessage(example)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white p-4 text-left text-sm font-semibold shadow-sm"
            >
              {example}
              <ArrowRight className="h-4 w-4 shrink-0 text-ink/25" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
