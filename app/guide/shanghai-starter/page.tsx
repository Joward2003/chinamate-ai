import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Navigation,
  ShieldCheck,
  Smartphone,
  UtensilsCrossed,
} from "lucide-react";
import { LocalHelpShell } from "@/components/local-help-shell";

const sections = [
  {
    id: "getting-around",
    icon: MapPin,
    title: "Getting around Shanghai",
    text: "Confirm the Chinese destination name, nearby landmark and exact entrance before leaving.",
    mode: "task",
    prompt:
      "I need to get around Shanghai and confirm the best route, destination name, and entrance before I leave.",
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Using Alipay and WeChat Pay",
    text: "Prepare a backup payment method and ask staff before leaving the counter if payment fails.",
    mode: "task",
    prompt:
      "I need to pay in Shanghai using Alipay, WeChat Pay, bank card, or cash. Help me choose the safest next step.",
  },
  {
    id: "food",
    icon: UtensilsCrossed,
    title: "Ordering food",
    text: "Use staff ordering or photo menus when a QR mini program requires a local phone number.",
    mode: "task",
    prompt:
      "I need to order food in Shanghai, but the menu or QR ordering flow may be hard to use.",
  },
  {
    id: "taxi",
    icon: Navigation,
    title: "Taking a taxi",
    text: "Keep the pickup pin, plate number and Chinese destination ready before the ride starts.",
    mode: "task",
    prompt:
      "I need to take a taxi in Shanghai and show the driver my destination in Chinese.",
  },
  {
    id: "metro",
    icon: Smartphone,
    title: "Using the metro",
    text: "Check ticket, QR code, exit gate and transfer details before entering a crowded station.",
    mode: "task",
    prompt:
      "I need to use the Shanghai metro and understand ticket, QR code, transfer, and exit steps.",
  },
  {
    id: "emergency",
    icon: ShieldCheck,
    title: "Emergency help",
    text: "Ask official staff for the right channel. Do not rely on unverified phone numbers or strangers.",
    mode: "problem",
    prompt:
      "Something went wrong in Shanghai and I may need official help. I need safe steps without unverified phone numbers.",
  },
];

export default function ShanghaiGuidePage() {
  return (
    <LocalHelpShell>
      <div className="page-shell py-8 md:py-12">
        <article className="mx-auto max-w-[760px]">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60"
          >
            <ArrowLeft className="h-4 w-4" /> Profile
          </Link>
          <header className="relative mt-6 overflow-hidden rounded-[32px] bg-[#173f32] p-7 text-white shadow-soft sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#f3b995]/15" />
            <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-[#f3b995]">
              Starter guide
            </p>
            <h1 className="font-display relative mt-3 text-4xl sm:text-5xl">
              Shanghai starter guide
            </h1>
            <p className="relative mt-4 max-w-xl leading-7 text-white/65">
              Tap a card to open ChinaMate AI with a ready-made prompt.
            </p>
          </header>
          <div className="mt-5 grid gap-4">
            {sections.map((section) => (
              <Link
                id={section.id}
                key={section.id}
                href={`/help?mode=${section.mode}&prompt=${encodeURIComponent(
                  section.prompt,
                )}`}
                className="scroll-mt-28 rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-moss/20"
              >
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eaf4ef] text-moss">
                    <section.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold">{section.title}</h2>
                    <p className="mt-2 leading-7 text-ink/60">{section.text}</p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-ink/25" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-[22px] bg-[#eaf4ef] p-5 text-moss">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-semibold">
              Live help cards can use your saved Profile preferences when AI
              personalization is enabled.
            </p>
          </div>
        </article>
      </div>
    </LocalHelpShell>
  );
}
