"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Coffee,
  CloudRain,
  MapPin,
  Navigation,
  Send,
  Share2,
  Sparkles,
  Star,
  Upload,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { tomStory } from "@/data/tomStory";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TomJourney({
  onBack,
  compact = false,
}: {
  onBack: () => void;
  compact?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [rainMode, setRainMode] = useState(false);
  const [contributed, setContributed] = useState(false);
  const [recap, setRecap] = useState(false);
  const active = tomStory[activeIndex];

  const next = () => {
    setActiveIndex(Math.min(tomStory.length - 1, activeIndex + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f7f8f3] pb-12">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#f7f8f3]/94 backdrop-blur-xl">
        <div
          className={cn(
            "mx-auto flex h-16 items-center justify-between px-5",
            compact ? "max-w-[430px]" : "max-w-6xl md:px-8",
          )}
        >
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-card">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Tom&apos;s journey
          </button>
          <Badge tone="good">Interactive story</Badge>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto px-5 py-7",
          compact ? "max-w-[430px]" : "max-w-6xl md:px-8 md:py-12",
        )}
      >
        <div
          className={cn(
            "grid min-w-0 gap-8",
            !compact && "lg:grid-cols-[260px_1fr]",
          )}
        >
          <aside className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-coral">
              One traveler · full loop
            </p>
            <h1
              className={cn(
                "font-display mt-3 text-4xl leading-[1.02]",
                !compact && "md:text-5xl",
              )}
            >
              Tom&apos;s 7 days
              <br />
              <span className="italic text-moss">across China.</span>
            </h1>
            <p className="mt-4 text-sm leading-6 text-ink/55">
              A 28-year-old American vegetarian creator using the 144-hour
              visa-free transit route for his first trip to Asia.
            </p>

            <div
              className={cn(
                "mt-7 grid grid-cols-4 gap-2",
                !compact && "lg:block lg:space-y-1",
              )}
            >
              {tomStory.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "flex min-w-0 items-center justify-center gap-2 rounded-2xl px-2 py-2.5 text-left transition",
                    !compact && "lg:w-full lg:justify-start lg:px-3",
                    index === activeIndex
                      ? "bg-ink text-white"
                      : cn("bg-white", !compact && "lg:bg-transparent"),
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                      index === activeIndex
                        ? "bg-[#9dd7bb] text-ink"
                        : "bg-[#e8eee8] text-moss",
                    )}
                  >
                    {index}
                  </span>
                  <span>
                    <span className="block text-xs font-bold">{item.day}</span>
                    <span
                      className={cn(
                        "mt-0.5 hidden text-[11px]",
                        !compact && "lg:block",
                        index === activeIndex ? "text-white/55" : "text-ink/42",
                      )}
                    >
                      {item.location}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section key={active.id} className="min-w-0 fade-up">
            <div className="overflow-hidden rounded-[30px] bg-ink shadow-soft">
              <div
                className={cn(
                  "relative aspect-[4/3] min-h-[290px]",
                  !compact && "md:aspect-[16/8]",
                )}
              >
                <img
                  src={active.image}
                  alt={`${active.day}: ${active.scene}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/10" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <Badge className="bg-white/90 text-ink">{active.day}</Badge>
                  <Badge className="bg-black/35 text-white backdrop-blur">
                    <MapPin className="h-3 w-3" /> {active.location}
                  </Badge>
                </div>
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 p-5 text-white",
                    !compact && "md:p-8",
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9dd7bb]">
                    {active.scene}
                  </p>
                  <h2
                    className={cn(
                      "mt-2 max-w-3xl text-2xl font-bold leading-tight",
                      !compact && "md:text-4xl",
                    )}
                  >
                    {active.title}
                  </h2>
                </div>
              </div>

              <div
                className={cn(
                  "grid gap-6 p-5 text-white",
                  !compact && "md:grid-cols-[1.05fr_.95fr] md:p-8",
                )}
              >
                <div>
                  <p className="text-sm leading-7 text-white/62">{active.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {active.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/[0.09] px-3 py-2 text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/[0.08] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9dd7bb]">
                    <Sparkles className="h-4 w-4" /> Agent moment
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6">
                    “{active.agentMessage}”
                  </p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "mt-5 grid gap-5",
                !compact && "md:grid-cols-[1fr_340px]",
              )}
            >
              <div className="rounded-[26px] border border-black/[0.07] bg-white p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-moss">
                  What BridgeTrip is doing
                </p>
                <div className="mt-4 space-y-3">
                  {active.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm font-semibold">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e7f2eb] text-moss">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <StoryInteraction
                day={active.id}
                choice={choice}
                setChoice={setChoice}
                rainMode={rainMode}
                setRainMode={setRainMode}
                contributed={contributed}
                setContributed={setContributed}
                recap={recap}
                setRecap={setRecap}
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="flex min-h-11 items-center gap-2 px-2 text-sm font-bold text-ink/50 disabled:opacity-25"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              {activeIndex < tomStory.length - 1 ? (
                <Button onClick={next}>
                  Next moment <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setRecap(true)}>
                  Generate recap <Sparkles className="h-4 w-4" />
                </Button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StoryInteraction({
  day,
  choice,
  setChoice,
  rainMode,
  setRainMode,
  contributed,
  setContributed,
  recap,
  setRecap,
}: {
  day: string;
  choice: string;
  setChoice: (value: string) => void;
  rainMode: boolean;
  setRainMode: (value: boolean) => void;
  contributed: boolean;
  setContributed: (value: boolean) => void;
  recap: boolean;
  setRecap: (value: boolean) => void;
}) {
  if (day === "day2") {
    return (
      <div className="rounded-[26px] bg-[#fff0e8] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-coral">
          Choose Tom&apos;s next step
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["bookstore", "A · Shaded bookstore", "Free view · 5 min walk"],
            ["coffee", "B · Oat-milk coffee", "Vegetarian brownie · 300m"],
          ].map(([value, title, detail]) => (
            <button
              key={value}
              onClick={() => setChoice(value)}
              className={cn(
                "w-full rounded-2xl border p-3.5 text-left",
                choice === value ? "border-coral bg-white" : "border-black/[0.07] bg-white/55",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <Coffee className="h-4 w-4" /> {title}
              </span>
              <span className="mt-1 block text-xs text-ink/48">{detail}</span>
            </button>
          ))}
        </div>
        {choice && (
          <p className="mt-3 text-xs font-semibold leading-5 text-[#9b422f]">
            Dinner moved to 18:30. A Visa-friendly vegetarian terrace is saved.
          </p>
        )}
      </div>
    );
  }

  if (day === "day3") {
    return (
      <div className="rounded-[26px] bg-[#e8f0f5] p-5">
        <CloudRain className="h-5 w-5 text-[#315e7b]" />
        <h3 className="mt-3 font-bold">Suzhou rain adjustment</h3>
        <p className="mt-2 text-sm leading-6 text-ink/55">
          Replace the exposed garden route with museum and covered-market stops.
        </p>
        <Button onClick={() => setRainMode(true)} variant="soft" className="mt-4 w-full">
          {rainMode ? <Check className="h-4 w-4" /> : <CloudRain className="h-4 w-4" />}
          {rainMode ? "Rain plan applied" : "Apply rain plan"}
        </Button>
      </div>
    );
  }

  if (day === "day5") {
    return (
      <div className="rounded-[26px] bg-[#eef0ec] p-5">
        <WifiOff className="h-5 w-5 text-ink/55" />
        <h3 className="mt-3 font-bold">Offline rescue card</h3>
        <p className="mt-2 text-sm leading-6 text-ink/55">
          Saved locally: China Mobile counter, passport phrase and West Lake Wi-Fi point.
        </p>
        <Button variant="outline" className="mt-4 w-full">
          Open offline card
        </Button>
      </div>
    );
  }

  if (day === "day6") {
    return (
      <div className="rounded-[26px] bg-[#f4eee3] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a5b00]">
          Add a traveler note
        </p>
        <p className="mt-3 text-sm font-semibold leading-6">
          “Picture ordering works. The broth contains peanuts.”
        </p>
        <Button
          onClick={() => setContributed(true)}
          disabled={contributed}
          className="mt-4 w-full"
        >
          {contributed ? <BadgeCheck className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {contributed ? "Badge earned · $10 reward" : "Submit helpful note"}
        </Button>
      </div>
    );
  }

  if (day === "day7") {
    return (
      <div className="rounded-[26px] bg-[#e7f2eb] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-moss">
          Social loop
        </p>
        <h3 className="mt-3 text-lg font-bold">My 7 Days in China with BridgeTrip</h3>
        <p className="mt-2 text-sm text-ink/52">Route trace · 18 photos · 3 local tips</p>
        <Button onClick={() => setRecap(true)} className="mt-4 w-full">
          <Share2 className="h-4 w-4" />
          {recap ? "Share preview ready" : "Generate share preview"}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[26px] bg-[#e7f2eb] p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-moss">
        <Navigation className="h-4 w-4" /> Live demo
      </div>
      <p className="mt-3 text-sm font-semibold leading-6">
        Context remembered. The next recommendation will carry Tom&apos;s language,
        food and payment constraints.
      </p>
      <Button variant="soft" className="mt-4 w-full">
        Simulate this moment <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
