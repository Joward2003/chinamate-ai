import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "good" | "warn" | "bad" | "blue";
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  const tones = {
    neutral: "bg-black/[0.055] text-ink/70",
    good: "bg-[#e6f3eb] text-[#176b4d]",
    warn: "bg-[#fff1d6] text-[#885a00]",
    bad: "bg-[#fde9e4] text-[#a53c27]",
    blue: "bg-[#e7f0f8] text-[#315e7b]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
