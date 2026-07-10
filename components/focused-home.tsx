import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CalendarCheck,
  Languages,
  Map,
  MessageSquareText,
  Navigation,
  TriangleAlert,
  WandSparkles,
} from "lucide-react";

const helpEntries = [
  {
    href: "/help/task",
    title: "I need to do something",
    subtitle: "Complete a task",
    icon: WandSparkles,
    tone: "bg-white text-ink",
    iconTone: "bg-[#eaf4ef] text-moss",
  },
  {
    href: "/help/problem",
    title: "Something went wrong",
    subtitle: "Fix a problem",
    icon: TriangleAlert,
    tone: "bg-[#173f32] text-white",
    iconTone: "bg-white/12 text-[#f3b995]",
  },
  {
    href: "/help/chinese",
    title: "Show this in Chinese",
    subtitle: "Talk to local people",
    icon: Languages,
    tone: "bg-white text-ink",
    iconTone: "bg-[#fff0e8] text-coral",
  },
];

export function FocusedHome() {
  return (
    <>
      <section className="page-shell py-6 md:py-10">
        <div className="relative min-h-[560px] overflow-hidden rounded-[32px] bg-ink shadow-soft">
          <img
            src="/images/shanghai.jpg"
            alt="Shanghai skyline from the riverfront"
            className="absolute inset-0 h-full w-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102d25]/98 via-[#173a2d]/80 to-[#173a2d]/40" />
          <div className="absolute inset-0 soft-noise" />

          <div className="relative z-10 grid min-h-[560px] gap-8 p-6 sm:p-9 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:p-12">
            <div className="text-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/72">
                <Navigation className="h-4 w-4 rotate-45 fill-current" />
                ChinaMate
              </div>
              <p className="mt-3 text-sm font-semibold text-[#f3b995]">
                Local help for traveling in China
              </p>
              <h1 className="font-display mt-7 text-5xl leading-[1.02] sm:text-6xl">
                What do you need
                <br />
                <span className="italic text-[#f3b995]">help with?</span>
              </h1>
              <p className="mt-5 max-w-md leading-7 text-white/72">
                Know what to do, what to show, and what to try next when traveling in China.
              </p>
              <Link
                href="/help/agent"
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/16"
              >
                <MessageSquareText className="h-4 w-4" />
                Describe a different problem
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {helpEntries.map((entry) => {
                const Icon = entry.icon;
                return (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className={`group flex min-h-[112px] items-center gap-4 rounded-[26px] border border-white/10 p-5 shadow-card transition hover:-translate-y-0.5 ${entry.tone}`}
                  >
                    <span className={`grid h-13 w-13 shrink-0 place-items-center rounded-2xl ${entry.iconTone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-bold tracking-[-0.025em] sm:text-xl">
                        {entry.title}
                      </span>
                      <span className={`mt-1 block text-sm ${entry.href === "/help/problem" ? "text-white/58" : "text-ink/48"}`}>
                        {entry.subtitle}
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pb-14 pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">Explore later</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">
              Plan less. <span className="italic">Travel ready.</span>
            </h2>
          </div>
          <p className="hidden max-w-sm text-right text-sm leading-6 text-ink/48 sm:block">
            Your original trip tools are still here when you need them.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SecondaryCard
            href="/guide/shanghai-starter"
            label="Shanghai starter guide"
            detail="Payments, apps and arrival basics"
            icon={BookOpen}
          />
          <SecondaryCard
            href="/saved"
            label="Saved cards"
            detail="Keep help available for later"
            icon={Bookmark}
          />
          <SecondaryCard
            href="/guide/shanghai-starter#map"
            label="Friendly map"
            detail="Useful places and arrival notes"
            icon={Map}
          />
          <SecondaryCard
            href="/profile"
            label="Trip ideas"
            detail="Your planning tools, now secondary"
            icon={CalendarCheck}
          />
        </div>
      </section>
    </>
  );
}

function SecondaryCard({
  href,
  label,
  detail,
  icon: Icon,
}: {
  href: string;
  label: string;
  detail: string;
  icon: typeof BookOpen;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[150px] flex-col justify-between rounded-[26px] border border-black/[0.06] bg-white p-5 shadow-card transition hover:-translate-y-0.5"
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eaf4ef] text-moss">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="flex items-center justify-between font-bold">
          {label} <ArrowRight className="h-4 w-4 text-ink/25 transition group-hover:translate-x-1 group-hover:text-moss" />
        </span>
        <span className="mt-1 block text-sm leading-5 text-ink/48">{detail}</span>
      </span>
    </Link>
  );
}
