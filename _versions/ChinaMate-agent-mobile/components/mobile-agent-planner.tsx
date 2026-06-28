"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CarFront,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Edit3,
  Footprints,
  Languages,
  MapPin,
  Mic,
  Navigation,
  RotateCcw,
  Send,
  Share2,
  Sparkles,
  TicketCheck,
  Umbrella,
  UsersRound,
  WandSparkles,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  agentPrompts,
  getAgentRoute,
  parseAgentTrip,
  type AgentRouteNode,
  type AgentTripProfile,
} from "@/data/mockAgentTrip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TomJourney } from "@/components/tom-journey";

type Stage = "input" | "summary" | "route" | "help" | "story" | "share";

const sampleVoice =
  "I’m in Beijing for two days with my parents. We want local food, easy transport, and not too much walking.";

export function MobileAgentPlanner({
  onCustomize,
}: {
  onCustomize: () => void;
}) {
  const [stage, setStage] = useState<Stage>("input");
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [profile, setProfile] = useState<AgentTripProfile | null>(null);
  const [question, setQuestion] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [updated, setUpdated] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startPlan = () => {
    const parsed = parseAgentTrip(input);
    if (parsed.destination === "China" && input.trim().length < 28) {
      setQuestion("Which city are you visiting?");
      return;
    }
    setQuestion("");
    setProfile(parsed);
    setStage("summary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleVoice = () => {
    if (listening) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setListening(false);
      setInput(sampleVoice);
      return;
    }
    setListening(true);
    timerRef.current = window.setTimeout(() => {
      setListening(false);
      setInput(sampleVoice);
    }, 2600);
  };

  if (stage === "story") {
    return (
      <div className="pb-24">
        <TomJourney compact onBack={() => setStage("input")} />
        <MobileBottomNav
          stage={stage}
          hasTrip={Boolean(profile)}
          setStage={setStage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-28 text-ink">
      <header className="flex h-16 items-center justify-between px-5">
        <button
          onClick={() =>
            setStage(
              stage === "input"
                ? "input"
                : stage === "route"
                  ? "summary"
                  : "input",
            )
          }
          className="flex items-center gap-2.5"
          aria-label="Go back"
        >
          {stage === "input" ? (
            <span className="grid h-9 w-9 place-items-center rounded-[14px] bg-moss text-white">
              <Navigation className="h-4 w-4 rotate-45 fill-current" />
            </span>
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-card">
              <ArrowLeft className="h-4 w-4" />
            </span>
          )}
          <span className="text-base font-bold tracking-[-0.03em]">ChinaMate</span>
        </button>
        <button
          onClick={() => setStage("help")}
          className="rounded-full bg-white px-3.5 py-2 text-xs font-bold shadow-card"
        >
          Local help
        </button>
      </header>

      {stage === "input" && (
        <AgentInput
          input={input}
          setInput={setInput}
          listening={listening}
          toggleVoice={toggleVoice}
          startPlan={startPlan}
          question={question}
          onCustomize={onCustomize}
          onStory={() => setStage("story")}
        />
      )}
      {stage === "summary" && profile && (
        <TripSummary
          profile={profile}
          onEdit={() => setStage("input")}
          onGenerate={() => {
            setStage("route");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
      {stage === "route" && profile && (
        <AgentRoute
          profile={profile}
          adjustment={adjustment}
          updated={updated}
          onAdjust={(value) => {
            setAdjustment(value);
            setUpdated(true);
          }}
          onRestart={() => {
            setStage("input");
            setUpdated(false);
            setAdjustment("");
          }}
          onLocalHelp={() => setStage("help")}
        />
      )}
      {stage === "help" && <MobileHelpScreen />}
      {stage === "share" && <MobileShareScreen />}
      <MobileBottomNav
        stage={stage}
        hasTrip={Boolean(profile)}
        setStage={setStage}
      />
    </div>
  );
}

function AgentInput({
  input,
  setInput,
  listening,
  toggleVoice,
  startPlan,
  question,
  onCustomize,
  onStory,
}: {
  input: string;
  setInput: (value: string) => void;
  listening: boolean;
  toggleVoice: () => void;
  startPlan: () => void;
  question: string;
  onCustomize: () => void;
  onStory: () => void;
}) {
  return (
    <main className="px-5 pb-12 pt-7">
      <Badge tone="good" className="px-3 py-1.5">
        <Sparkles className="h-3.5 w-3.5" /> AI trip agent
      </Badge>
      <h1 className="font-display mt-5 text-[43px] leading-[0.98]">
        Your AI travel
        <br />
        companion <span className="italic text-moss">in China.</span>
      </h1>
      <p className="mt-5 text-[15px] leading-6 text-ink/58">
        Tell me who you are traveling with, where you want to go and what kind
        of trip feels right.
      </p>

      <div
        className={cn(
          "mt-8 rounded-[28px] border bg-white p-4 shadow-soft transition",
          listening ? "border-coral" : "border-black/[0.07]",
        )}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="For example: I’m traveling in Beijing for 2 days with my parents and a 7-year-old child. We want local food and an easy route."
          className="min-h-[180px] w-full resize-none bg-transparent p-2 text-[17px] leading-7 outline-none placeholder:text-ink/28"
        />
        {listening && (
          <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold text-coral">
            <span className="flex h-7 items-center gap-1">
              {[10, 18, 26, 15, 22].map((height, index) => (
                <span
                  key={index}
                  className="w-1 animate-pulse rounded-full bg-coral"
                  style={{ height }}
                />
              ))}
            </span>
            Listening… tap the microphone to stop
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            aria-label={listening ? "Stop listening" : "Start voice input"}
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-full transition",
              listening ? "bg-coral text-white" : "bg-[#edf4ef] text-moss",
            )}
          >
            <Mic className="h-5 w-5" />
          </button>
          <Button
            onClick={startPlan}
            disabled={!input.trim()}
            size="lg"
            className="h-14 flex-1 rounded-full"
          >
            Plan my trip <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {question && (
        <div className="mt-4 rounded-2xl bg-[#fff0e8] p-4 text-sm font-semibold text-[#9b422f]">
          {question}
        </div>
      )}

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/38">
          Try an example
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {agentPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="rounded-2xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-left text-xs font-semibold leading-5 shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onCustomize}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-ink/48"
      >
        Customize step by step <ArrowRight className="h-4 w-4" />
      </button>

      <button
        onClick={onStory}
        className="mt-3 flex w-full items-center justify-between rounded-[22px] border border-black/[0.08] bg-white p-4 text-left shadow-card"
      >
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.12em] text-coral">
            Interactive demo
          </span>
          <span className="mt-1 block text-sm font-bold">Follow Tom’s 7-day China story</span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>

      <div className="mt-8 rounded-[24px] bg-[#173f32] p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9dd7bb]">
          What the agent checks
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#f3b995]" /> Card & cash
          </span>
          <span className="flex items-center gap-2">
            <CarFront className="h-4 w-4 text-[#f3b995]" /> Pickup points
          </span>
          <span className="flex items-center gap-2">
            <TicketCheck className="h-4 w-4 text-[#f3b995]" /> Reservations
          </span>
          <span className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-[#f3b995]" /> Chinese phrases
          </span>
        </div>
      </div>
    </main>
  );
}

function TripSummary({
  profile,
  onEdit,
  onGenerate,
}: {
  profile: AgentTripProfile;
  onEdit: () => void;
  onGenerate: () => void;
}) {
  const chips = [
    profile.destination,
    profile.duration,
    ...profile.travelers,
    ...profile.needs,
    ...profile.style,
    ...profile.transport,
    ...profile.food,
    profile.budget,
  ];
  return (
    <main className="px-5 pb-12 pt-5">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e7f2eb] text-moss">
        <WandSparkles className="h-6 w-6" />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-moss">
        AI understood your trip
      </p>
      <h1 className="font-display mt-2 text-[40px] leading-[1.02]">
        Here’s what I heard.
      </h1>
      <p className="mt-4 text-sm leading-6 text-ink/55">
        Check the summary before I shape the route. You can correct the original
        request with one tap.
      </p>

      <div className="mt-7 rounded-[28px] bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Trip profile</p>
          <button onClick={onEdit} className="flex items-center gap-1 text-xs font-bold text-moss">
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((chip, index) => (
            <span
              key={`${chip}-${index}`}
              className={cn(
                "rounded-full px-3 py-2 text-xs font-semibold",
                index < 2 ? "bg-moss text-white" : "bg-[#edf2ee] text-ink/72",
              )}
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="mt-6 border-t border-black/[0.07] pt-5">
          <div className="flex gap-3">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
            <p className="text-sm leading-6 text-ink/62">
              I’ll remember the group’s walking needs, food preferences and
              transport limits at every stop.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={onGenerate} size="lg" className="mt-6 h-14 w-full">
        Build my route <ArrowRight className="h-4 w-4" />
      </Button>
      <button onClick={onEdit} className="mt-3 w-full py-3 text-sm font-semibold text-ink/48">
        Change my request
      </button>
    </main>
  );
}

function AgentRoute({
  profile,
  adjustment,
  updated,
  onAdjust,
  onRestart,
  onLocalHelp,
}: {
  profile: AgentTripProfile;
  adjustment: string;
  updated: boolean;
  onAdjust: (value: string) => void;
  onRestart: () => void;
  onLocalHelp: () => void;
}) {
  const route = useMemo(() => getAgentRoute(profile.destination), [profile.destination]);
  const adjustmentText: Record<string, string> = {
    "Too rushed": "making the route more relaxed and adding rest time.",
    "Too much walking": "reducing walking and prioritizing taxi drop-offs.",
    "More local": "adding deeper neighborhood and food context.",
    "More indoor": "prioritizing indoor stops and weather-safe backups.",
    "Better for kids / elderly": "improving seating, access and group comfort.",
    "Lower budget": "reducing paid stops and private transport.",
    "Less transfer": "keeping the route within fewer neighborhoods.",
    "Rainy-day plan": "switching exposed sections to covered alternatives.",
  };

  return (
    <main className="px-5 pb-14 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">
            {updated ? "Updated plan" : "Your Agent route"}
          </p>
          <h1 className="font-display mt-2 text-[38px] leading-[1.02]">
            A relaxed {profile.destination} route.
          </h1>
        </div>
        {updated && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e7f2eb] text-moss">
            <Check className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="good">{profile.duration}</Badge>
        <Badge tone="blue">{profile.travelers[0]}</Badge>
        <Badge tone="warn">{updated ? "Relaxed pace" : profile.style[1]}</Badge>
      </div>

      {updated && (
        <div className="mt-5 rounded-2xl bg-[#e7f2eb] p-4 text-sm font-semibold leading-6 text-moss">
          Adjusted: {adjustmentText[adjustment]}
        </div>
      )}

      <div className="mt-8">
        {route.map((node, index) => (
          <div key={node.place}>
            <RouteNodeCard
              node={node}
              contextTags={profile.needs}
              updated={updated}
            />
            {index < route.length - 1 && (
              <div className="flex items-center gap-3 py-3 pl-5 text-xs font-semibold text-ink/42">
                <ArrowDown className="h-4 w-4 text-moss" />
                {route[index + 1].transport}
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="mt-9 rounded-[28px] bg-[#172b23] p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9dd7bb]">
          Want to adjust this plan?
        </p>
        <h2 className="mt-2 text-xl font-bold">Tell the AI what feels wrong.</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">
          We’ll reshape the route without making you start over.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {Object.keys(adjustmentText).map((item) => (
            <button
              key={item}
              onClick={() => onAdjust(item)}
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-semibold",
                adjustment === item
                  ? "border-[#9dd7bb] bg-[#9dd7bb] text-ink"
                  : "border-white/15 bg-white/[0.07] text-white/78",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" /> New request
        </Button>
        <Button onClick={onLocalHelp}>Get local help</Button>
      </div>
    </main>
  );
}

function RouteNodeCard({
  node,
  contextTags,
  updated,
}: {
  node: AgentRouteNode;
  contextTags: string[];
  updated: boolean;
}) {
  const [open, setOpen] = useState(false);
  const visibleTags = [...node.tags, ...contextTags]
    .filter((item, index, array) => array.indexOf(item) === index)
    .slice(0, 5);
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[26px] border bg-white shadow-card transition",
        updated ? "border-moss/35" : "border-black/[0.07]",
      )}
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#edf4ef] px-3 py-1.5 text-xs font-bold text-moss">
            {node.period}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink/42">
            <Clock3 className="h-3.5 w-3.5" /> {node.stay}
          </span>
        </div>
        <h2 className="mt-4 text-[22px] font-bold tracking-[-0.035em]">{node.place}</h2>
        <p className="mt-2 text-sm leading-6 text-ink/58">{node.reason}</p>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#f4f5f1] p-3 text-xs font-semibold">
          <CarFront className="h-4 w-4 text-moss" />
          {node.transport}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <Badge
              key={tag}
              tone={
                /payment|reservation|crowded/i.test(tag)
                  ? "warn"
                  : /elderly|kid|low walking|relaxed/i.test(tag)
                    ? "good"
                    : "neutral"
              }
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between border-t border-black/[0.07] px-5 py-4 text-sm font-bold text-moss"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Last-mile tips
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="space-y-3 border-t border-black/[0.06] bg-[#f6f7f3] px-5 py-4">
          {node.lastMileTips.map((tip) => (
            <div key={tip} className="flex gap-3 text-sm leading-5 text-ink/68">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
              {tip}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function MobileHelpScreen() {
  const [opened, setOpened] = useState("");
  const helpItems = [
    {
      title: "Taxi & pickup help",
      description:
        "Find the right pickup point and show the Chinese address to the driver.",
      tag: "Useful in China",
      icon: CarFront,
    },
    {
      title: "Translation help",
      description: "Menu, taxi, hotel and emergency phrases when words get stuck.",
      tag: "Local support",
      icon: Languages,
    },
    {
      title: "Ticket & reservation help",
      description: "Attraction booking, museum reservations and train guidance.",
      tag: "Booking help",
      icon: TicketCheck,
    },
    {
      title: "Payment help",
      description: "Check whether Visa, Mastercard, mobile pay or cash is needed.",
      tag: "Payment check",
      icon: CreditCard,
    },
    {
      title: "Local guide & city walk",
      description: "Human local support for a deeper, easier experience.",
      tag: "Human help",
      icon: Footprints,
    },
  ];

  return (
    <main className="px-5 pb-12 pt-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">
        Trusted local entry points
      </p>
      <h1 className="font-display mt-2 text-[40px] leading-[1.02]">
        Help for the parts
        <br />
        China makes <span className="italic text-moss">different.</span>
      </h1>
      <p className="mt-4 text-sm leading-6 text-ink/55">
        Clear scope before you ask. Payment stays with the service provider.
      </p>

      <div className="mt-7 space-y-3">
        {helpItems.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-card"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#edf4ef] text-moss">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <Badge tone="good">{item.tag}</Badge>
                  <h2 className="mt-3 text-lg font-bold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink/55">{item.description}</p>
                </div>
              </div>
              <Button
                onClick={() => setOpened(item.title)}
                variant="soft"
                className="mt-4 w-full"
              >
                {opened === item.title ? (
                  <>
                    <Check className="h-4 w-4" /> Request ready
                  </>
                ) : (
                  <>
                    Get help <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function MobileBottomNav({
  stage,
  hasTrip,
  setStage,
}: {
  stage: Stage;
  hasTrip: boolean;
  setStage: (stage: Stage) => void;
}) {
  const items: {
    id: Stage;
    label: string;
    icon: typeof Sparkles;
  }[] = [
    { id: "input", label: "Agent", icon: WandSparkles },
    { id: hasTrip ? "route" : "input", label: "Trip", icon: MapPin },
    { id: "story", label: "Story", icon: BookOpen },
    { id: "help", label: "Help", icon: UsersRound },
    { id: "share", label: "Share", icon: Share2 },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-[80] w-full max-w-[430px] -translate-x-1/2 border-t border-black/[0.08] bg-white/96 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            stage === item.id ||
            (item.label === "Agent" && stage === "summary") ||
            (item.label === "Trip" && stage === "route");
          return (
            <button
              key={item.label}
              onClick={() => {
                setStage(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold",
                active ? "text-moss" : "text-ink/38",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-moss/10")} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MobileShareScreen() {
  const [generated, setGenerated] = useState(false);
  const [shared, setShared] = useState("");

  return (
    <main className="px-5 pb-12 pt-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">
        Trip recap
      </p>
      <h1 className="font-display mt-2 text-[40px] leading-[1.02]">
        Your China story,
        <br />
        ready to <span className="italic text-moss">share.</span>
      </h1>
      <p className="mt-4 text-sm leading-6 text-ink/55">
        Route trace, selected photos and your useful local contributions—no long
        travel diary required.
      </p>

      <div className="mt-7 overflow-hidden rounded-[28px] bg-[#173f32] text-white shadow-soft">
        <div className="relative h-64">
          <img
            src="/images/great-wall.jpg"
            alt="China trip recap"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173f32] via-transparent to-black/15" />
          <div className="absolute bottom-5 left-5">
            <p className="font-display text-4xl leading-[.95]">
              My 7 Days
              <br />
              <span className="italic text-[#f3b995]">in China.</span>
            </p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ["3", "cities"],
              ["18", "photos"],
              ["4", "local tips"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/[0.08] p-3">
                <p className="text-xl font-bold">{value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/42">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-white/42">Route</span>
              <strong className="text-right">Shanghai → Suzhou → Hangzhou</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/42">Favorite</span>
              <strong className="text-right">West Lake at sunset</strong>
            </div>
          </div>
          {generated && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/10 p-4 text-sm font-semibold text-[#9dd7bb]">
              <BadgeCheck className="h-4 w-4" /> Social preview generated
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={() => setGenerated(true)}
        variant="primary"
        size="lg"
        className="mt-5 h-14 w-full"
      >
        <Sparkles className="h-4 w-4" />
        {generated ? "Recap card ready" : "Generate recap card"}
      </Button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {["TikTok", "Instagram", "X", "Facebook"].map((platform) => (
          <button
            key={platform}
            onClick={() => generated && setShared(platform)}
            className={cn(
              "rounded-2xl border bg-white px-3 py-4 text-sm font-bold",
              shared === platform
                ? "border-moss text-moss"
                : "border-black/[0.08] text-ink/65",
            )}
          >
            {shared === platform ? (
              <Check className="mr-1.5 inline h-4 w-4" />
            ) : (
              <Share2 className="mr-1.5 inline h-4 w-4" />
            )}
            {shared === platform ? `${platform} ready` : platform}
          </button>
        ))}
      </div>
      {!generated && (
        <p className="mt-3 text-center text-xs text-ink/38">
          Generate the recap before choosing a social platform.
        </p>
      )}
    </main>
  );
}
