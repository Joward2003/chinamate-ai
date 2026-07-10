"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const reasons = [
  "Staff did not understand",
  "Payment still failed",
  "App asked for Chinese phone number",
  "Entrance was wrong",
  "Other",
];

type FeedbackState = "idle" | "stuck" | "helped" | "submitted";

export function FeedbackBox({ cardId }: { cardId: string }) {
  const [state, setState] = useState<FeedbackState>("idle");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const saveFeedback = (outcome: "helped" | "stuck") => {
    const feedback = {
      cardId,
      outcome,
      reason: outcome === "stuck" ? reason : undefined,
      details: outcome === "stuck" ? details : undefined,
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("chinamate-feedback") ?? "[]");
    localStorage.setItem("chinamate-feedback", JSON.stringify([...existing, feedback]));
    void fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    }).catch(() => {
      // localStorage remains the offline fallback for the MVP.
    });
  };

  if (state === "helped" || state === "submitted") {
    return (
      <div className="flex items-start gap-3 rounded-[22px] bg-[#eaf4ef] p-5 text-moss">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="font-semibold">
          {state === "helped"
            ? "Thanks. This helps improve ChinaMate."
            : "Thanks. We’ll use this to improve the card."}
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">Feedback</p>
      <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">Did this help?</h2>

      {state === "idle" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            onClick={() => {
              saveFeedback("helped");
              setState("helped");
            }}
            className="px-3"
          >
            This helped
          </Button>
          <Button variant="outline" onClick={() => setState("stuck")} className="px-3">
            Still stuck
          </Button>
        </div>
      ) : (
        <div className="mt-5">
          <p className="font-bold">What went wrong?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {reasons.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setReason(item)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-left text-sm font-semibold transition",
                  reason === item
                    ? "border-moss bg-[#eaf4ef] text-moss"
                    : "border-black/10 bg-white text-ink/65",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="mt-5 block text-sm font-semibold" htmlFor={`feedback-${cardId}`}>
            Tell us more <span className="font-normal text-ink/40">optional</span>
          </label>
          <textarea
            id={`feedback-${cardId}`}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
            placeholder="A short note helps us fix this card."
          />
          <Button
            disabled={!reason}
            onClick={() => {
              saveFeedback("stuck");
              setState("submitted");
            }}
            className="mt-4 w-full"
          >
            Submit feedback
          </Button>
        </div>
      )}
    </section>
  );
}
