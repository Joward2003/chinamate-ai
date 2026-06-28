"use client";

import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BedDouble,
  Bell,
  BookOpen,
  Building2,
  Bus,
  CalendarCheck,
  Camera,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CloudRain,
  Compass,
  CookingPot,
  CreditCard,
  Footprints,
  Globe2,
  Heart,
  Home,
  Info,
  Languages,
  LocateFixed,
  Luggage,
  Map as MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  MoonStar,
  MoreHorizontal,
  Navigation,
  PartyPopper,
  Plane,
  PlaneTakeoff,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  TicketCheck,
  TrainFront,
  TriangleAlert,
  Umbrella,
  Upload,
  UserRound,
  UsersRound,
  UtensilsCrossed,
  WalletCards,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  checklistSeed,
  defaultProfile,
  itinerary,
  places,
  quickPrompts,
  services,
} from "@/data/mockData";
import { getAssistantResponse } from "@/lib/aiMock";
import { cn } from "@/lib/utils";
import type {
  AssistantResponse,
  ChecklistItem,
  EntryStatus,
  Place,
  UserProfile,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type View =
  | "home"
  | "entry"
  | "profile"
  | "prepare"
  | "itinerary"
  | "map"
  | "assistant"
  | "services"
  | "feedback"
  | "detail";

const navItems: { id: View; label: string; short: string; icon: LucideIcon }[] = [
  { id: "home", label: "Discover", short: "Home", icon: Compass },
  { id: "prepare", label: "Prepare", short: "Prepare", icon: Luggage },
  { id: "itinerary", label: "My Trip", short: "Trip", icon: CalendarCheck },
  { id: "map", label: "Friendly Map", short: "Map", icon: MapIcon },
  { id: "assistant", label: "Adjust", short: "AI", icon: WandSparkles },
  { id: "services", label: "Local Help", short: "Help", icon: UsersRound },
  { id: "feedback", label: "Recap", short: "Recap", icon: Camera },
];

const statusTone = (value: string | boolean) => {
  if (value === true || value === "yes" || value === "Low" || value === "Easy")
    return "good";
  if (value === false || value === "no" || value === "High" || value === "Hard")
    return "bad";
  return "warn";
};

export function ChinaMateApp() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("home");
  const [selectedPlace, setSelectedPlace] = useState<Place>(places[0]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [saved, setSaved] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const navigate = (next: View) => {
    setView(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const openPlace = (place: Place) => {
    setSelectedPlace(place);
    navigate("detail");
  };

  if (!started) {
    return (
      <SplashScreen
        onStart={() => {
          setStarted(true);
          setView("entry");
        }}
        onExplore={() => {
          setStarted(true);
          setView("home");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-24 md:pb-0">
      <TopNavigation
        view={view}
        navigate={navigate}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

      <main className="fade-up" key={view}>
        {view === "home" && (
          <HomeScreen
            profile={profile}
            openPlace={openPlace}
            navigate={navigate}
            saved={saved}
            setSaved={setSaved}
            notify={notify}
          />
        )}
        {view === "entry" && (
          <EntryScreen
            value={profile.entryStatus}
            onChange={(entryStatus) => setProfile({ ...profile, entryStatus })}
            onContinue={() => navigate("profile")}
          />
        )}
        {view === "profile" && (
          <ProfileScreen
            profile={profile}
            setProfile={setProfile}
            onGenerate={() => navigate("itinerary")}
          />
        )}
        {view === "prepare" && <PrepareScreen notify={notify} />}
        {view === "itinerary" && (
          <ItineraryScreen navigate={navigate} notify={notify} />
        )}
        {view === "map" && <MapScreen openPlace={openPlace} notify={notify} />}
        {view === "assistant" && <AssistantScreen navigate={navigate} />}
        {view === "services" && <ServicesScreen notify={notify} />}
        {view === "feedback" && <FeedbackScreen notify={notify} />}
        {view === "detail" && (
          <PlaceDetailScreen
            place={selectedPlace}
            onBack={() => navigate("home")}
            onPlan={() => navigate("profile")}
            isSaved={saved.includes(selectedPlace.id)}
            onSave={() => {
              setSaved((current) =>
                current.includes(selectedPlace.id)
                  ? current.filter((id) => id !== selectedPlace.id)
                  : [...current, selectedPlace.id],
              );
              notify(
                saved.includes(selectedPlace.id)
                  ? "Removed from saved places"
                  : "Saved to your China trip",
              );
            }}
            notify={notify}
          />
        )}
      </main>

      <MobileNavigation view={view} navigate={navigate} />
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft md:bottom-8"
        >
          <CheckCircle2 className="h-4 w-4 text-[#8fe0b9]" />
          {toast}
        </div>
      )}
    </div>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-[14px]",
          light ? "bg-white text-moss" : "bg-moss text-white",
        )}
      >
        <Navigation className="h-4 w-4 rotate-45 fill-current" />
      </span>
      <span className={cn("text-lg font-bold tracking-[-0.03em]", light && "text-white")}>
        ChinaMate
      </span>
    </div>
  );
}

function SplashScreen({
  onStart,
  onExplore,
}: {
  onStart: () => void;
  onExplore: () => void;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#173f32] text-white">
      <img
        src="/images/great-wall.jpg"
        alt="The Great Wall crossing green mountain ridges"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#102d25]/95 via-[#12382c]/68 to-transparent" />
      <div className="absolute inset-0 soft-noise" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 py-7 md:px-12 md:py-10">
        <div className="flex items-center justify-between">
          <Logo light />
          <button
            onClick={onExplore}
            className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Explore first
          </button>
        </div>

        <div className="my-auto max-w-[720px] py-16">
          <div className="mb-7 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/13 px-3 py-1.5 backdrop-blur">
              Visa-first routes
            </span>
            <span className="rounded-full bg-white/13 px-3 py-1.5 backdrop-blur">
              Bilingual local help
            </span>
            <span className="rounded-full bg-white/13 px-3 py-1.5 backdrop-blur">
              Plans that adapt
            </span>
          </div>
          <h1 className="font-display text-5xl leading-[0.98] sm:text-6xl md:text-[88px]">
            China, made
            <br />
            <span className="italic text-[#f3b995]">doable.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/78 md:text-xl">
            Your AI travel companion for payments, transport, reservations and
            the small local rules that make a trip work.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={onStart}
              size="lg"
              className="bg-[#f36b4f] text-white hover:bg-[#e05b40]"
            >
              Start planning
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={onExplore}
              variant="outline"
              size="lg"
              className="border-white/25 bg-white/10 text-white hover:bg-white/20"
            >
              See what&apos;s possible
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 pt-5 text-sm text-white/65 md:flex-row md:items-center md:justify-between">
          <p>Travel China easily, personally and safely.</p>
          <div className="flex gap-6">
            <span>7 cities</span>
            <span>Offline phrase cards</span>
            <span>No in-app payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopNavigation({
  view,
  navigate,
  mobileMenu,
  setMobileMenu,
}: {
  view: View;
  navigate: (view: View) => void;
  mobileMenu: boolean;
  setMobileMenu: (value: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.07] bg-paper/92 backdrop-blur-xl">
      <div className="page-shell flex h-[72px] items-center justify-between gap-6">
        <button onClick={() => navigate("home")} aria-label="Go to Discover">
          <Logo />
        </button>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-semibold transition",
                view === item.id
                  ? "bg-ink text-white"
                  : "text-ink/58 hover:bg-black/5 hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("assistant")}
            aria-label="Open trip alerts"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-coral" />
          </button>
          <button
            onClick={() => navigate("profile")}
            className="hidden items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold sm:flex"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e7efe9] text-moss">
              <UserRound className="h-3.5 w-3.5" />
            </span>
            My profile
          </button>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-full lg:hidden"
          >
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileMenu && (
        <div className="page-shell grid grid-cols-2 gap-2 border-t border-black/[0.06] py-4 lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-sm font-semibold"
              >
                <Icon className="h-4 w-4 text-moss" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

function MobileNavigation({
  view,
  navigate,
}: {
  view: View;
  navigate: (view: View) => void;
}) {
  const items = [
    navItems[0],
    navItems[2],
    navItems[3],
    navItems[4],
    navItems[6],
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.08] bg-white/96 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-semibold",
                active ? "text-moss" : "text-ink/45",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-moss/10")} />
              {item.short}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeScreen({
  profile,
  openPlace,
  navigate,
  saved,
  setSaved,
  notify,
}: {
  profile: UserProfile;
  openPlace: (place: Place) => void;
  navigate: (view: View) => void;
  saved: string[];
  setSaved: (value: string[]) => void;
  notify: (message: string) => void;
}) {
  const [category, setCategory] = useState("For you");
  const categories = ["For you", "City walks", "Food", "Culture", "Nature", "Night"];
  const filtered =
    category === "For you"
      ? places
      : places.filter((place) =>
          [...place.tags, place.category].some((tag) =>
            tag.toLowerCase().includes(category.replace("s", "").toLowerCase()),
          ),
        );

  return (
    <>
      <section className="page-shell grid gap-6 py-7 lg:grid-cols-[1.36fr_.64fr] lg:py-10">
        <div className="relative min-h-[510px] overflow-hidden rounded-[32px] bg-ink">
          <img
            src="/images/shanghai.jpg"
            alt="Shanghai skyline from the riverfront"
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#11281f]/95 via-[#173a2d]/55 to-transparent" />
          <div className="relative z-10 flex h-full max-w-[650px] flex-col justify-between p-7 text-white sm:p-10 lg:p-12">
            <div>
              <Badge className="bg-white/15 text-white backdrop-blur">
                <Sun className="h-3 w-3" /> 29°C in Shanghai · good walking weather
              </Badge>
              <h1 className="font-display mt-8 text-5xl leading-[1.02] sm:text-6xl">
                See China.
                <br />
                <span className="italic text-[#f3b995]">Skip the friction.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
                One clear route at a time—with the payment, passport, weather
                and last-mile details already checked.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("profile")}
              >
                Build my route <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("map")}
                className="border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                <MapIcon className="h-4 w-4" /> Open friendly map
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">
                  Next trip
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">
                  2 days in Beijing
                </h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf4ef] text-moss">
                <CalendarCheck className="h-5 w-5" />
              </span>
            </div>
            <div className="my-5 h-px bg-black/[0.07]" />
            <div className="space-y-4">
              <MiniStatus
                icon={CreditCard}
                label="Payment setup"
                value="Visa only · cash backup needed"
                tone="warn"
              />
              <MiniStatus
                icon={TicketCheck}
                label="Reservations"
                value="1 of 2 ready"
                tone="warn"
              />
              <MiniStatus
                icon={Languages}
                label="Language support"
                value="Phrase cards saved"
                tone="good"
              />
            </div>
            <Button
              onClick={() => navigate("itinerary")}
              className="mt-6 w-full"
            >
              Open my Beijing plan
            </Button>
          </div>
          <button
            onClick={() => navigate("assistant")}
            className="group flex flex-1 items-center justify-between overflow-hidden rounded-[28px] bg-[#e8eee8] p-6 text-left"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-moss">
                Plans change
              </p>
              <p className="mt-2 max-w-[240px] text-xl font-bold leading-6 tracking-[-0.03em]">
                Rain, fatigue, a missed booking—adjust in one tap.
              </p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-moss shadow-card transition group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" />
            </span>
          </button>
        </div>
      </section>

      <section className="page-shell py-10 md:py-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
              Pick a feeling, not a spreadsheet
            </p>
            <h2 className="font-display mt-2 text-4xl md:text-5xl">
              Start with somewhere <span className="italic">worth going.</span>
            </h2>
          </div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                  category === item
                    ? "bg-ink text-white"
                    : "border border-black/10 bg-white text-ink/65",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.slice(0, 7).map((place, index) => (
            <DestinationCard
              key={place.id}
              place={place}
              featured={index === 0}
              saved={saved.includes(place.id)}
              onOpen={() => openPlace(place)}
              onSave={() => {
                const isSaved = saved.includes(place.id);
                setSaved(
                  isSaved
                    ? saved.filter((id) => id !== place.id)
                    : [...saved, place.id],
                );
                notify(isSaved ? "Removed from saved places" : "Added to your trip");
              }}
            />
          ))}
        </div>
      </section>

      <section className="page-shell pb-16">
        <div className="grid overflow-hidden rounded-[32px] bg-[#172b23] text-white md:grid-cols-[.9fr_1.1fr]">
          <div className="p-8 md:p-11">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9dd7bb]">
              Built around your constraints
            </p>
            <h2 className="font-display mt-3 text-4xl leading-[1.05]">
              A route that knows you
              <br />
              <span className="italic text-[#f3b995]">cannot use Alipay.</span>
            </h2>
            <p className="mt-5 max-w-md leading-7 text-white/65">
              Your default plan prioritizes Visa-friendly venues, staffed ticket
              counters and short taxi instructions in Chinese.
            </p>
            <Button
              onClick={() => navigate("profile")}
              variant="outline"
              className="mt-7 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Review my travel profile
            </Button>
          </div>
          <div className="grid gap-3 bg-white/[0.06] p-6 sm:grid-cols-2 md:p-8">
            <InsightCard icon={BadgeCheck} title="Detected" value="First-time visitor" />
            <InsightCard icon={CreditCard} title="Risk" value="Visa-only payment" />
            <InsightCard icon={Languages} title="Constraint" value="No Chinese ability" />
            <InsightCard icon={CarFront} title="Suggestion" value="Taxi for last mile" />
          </div>
        </div>
      </section>
    </>
  );
}

function DestinationCard({
  place,
  featured,
  saved,
  onOpen,
  onSave,
}: {
  place: Place;
  featured?: boolean;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  return (
    <article
      className={cn(
        "group relative min-h-[390px] overflow-hidden rounded-[26px] bg-ink shadow-card",
        featured && "sm:col-span-2 sm:min-h-[460px]",
      )}
    >
      <img
        src={place.image}
        alt={place.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/10" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <Badge className="bg-white/88 text-ink backdrop-blur">
          {place.city}
        </Badge>
        {place.rainyDayFriendly && (
          <Badge className="bg-[#dceee5]/90 text-moss backdrop-blur">
            <Umbrella className="h-3 w-3" /> Rain-ready
          </Badge>
        )}
      </div>
      <button
        onClick={onSave}
        aria-label={saved ? "Remove from saved" : "Save place"}
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/88 text-ink backdrop-blur"
      >
        <Heart className={cn("h-4 w-4", saved && "fill-coral text-coral")} />
      </button>
      <button
        onClick={onOpen}
        className="absolute inset-x-0 bottom-0 w-full p-5 text-left text-white"
      >
        <p className="text-xs font-semibold text-white/65">{place.category}</p>
        <h3 className={cn("mt-1 text-xl font-bold leading-6", featured && "sm:text-3xl")}>
          {place.name}
        </h3>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-white/75">
            <span>{place.estimatedCost}</span>
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <span>{place.recommendedDuration}</span>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink transition group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </button>
    </article>
  );
}

function MiniStatus({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "good" | "warn";
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          tone === "good" ? "bg-[#e6f3eb] text-moss" : "bg-[#fff0d8] text-[#996500]",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink/45">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5">
      <Icon className="h-5 w-5 text-[#9dd7bb]" />
      <p className="mt-8 text-xs font-semibold text-white/45">{title}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function PlaceDetailScreen({
  place,
  onBack,
  onPlan,
  isSaved,
  onSave,
  notify,
}: {
  place: Place;
  onBack: () => void;
  onPlan: () => void;
  isSaved: boolean;
  onSave: () => void;
  notify: (message: string) => void;
}) {
  const facts = [
    { icon: Clock3, label: "Time needed", value: place.recommendedDuration },
    { icon: CircleDollarSign, label: "Expected cost", value: place.estimatedCost },
    {
      icon: TicketCheck,
      label: "Reservation",
      value: place.needReservation ? "Book ahead" : "Walk in",
    },
    {
      icon: BookOpen,
      label: "Passport",
      value: place.passportRequired ? "Original required" : "Not required",
    },
    {
      icon: Languages,
      label: "English service",
      value: place.englishService === "yes" ? "Available" : "Limited / unknown",
    },
    {
      icon: CreditCard,
      label: "Visa / Mastercard",
      value:
        place.visaAccepted === "yes"
          ? "Accepted"
          : place.visaAccepted === "no"
            ? "Not accepted"
            : "Not reliable",
    },
    {
      icon: Banknote,
      label: "Cash",
      value: place.cashRecommended ? "Bring small cash" : "Optional",
    },
    {
      icon: CarFront,
      label: "Last mile",
      value: `${place.lastMileDifficulty} difficulty`,
    },
  ];

  return (
    <div className="pb-16">
      <section className="page-shell py-6">
        <button
          onClick={onBack}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discover
        </button>
        <div className="relative min-h-[540px] overflow-hidden rounded-[34px] bg-ink">
          <img
            src={place.image}
            alt={place.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/15" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 md:p-12">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="bg-white/90 text-ink">{place.city}</Badge>
              <Badge className="bg-white/15 text-white backdrop-blur">
                <Star className="h-3 w-3 fill-current" /> {place.foreignerRating} by
                foreign travelers
              </Badge>
            </div>
            <h1 className="font-display max-w-3xl text-5xl leading-[1.02] md:text-7xl">
              {place.name}
            </h1>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="primary" size="lg" onClick={onPlan}>
                Plan this route <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onSave}
                className="border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => notify("Share link copied")}
                className="border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-7 py-8 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
            Why travelers go
          </p>
          <h2 className="font-display mt-2 text-4xl">The appeal, minus the guesswork.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/68">
            {place.whyPopular}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {facts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.label}
                  className="flex items-center gap-4 rounded-2xl border border-black/[0.07] bg-white p-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf4ef] text-moss">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs text-ink/45">{fact.label}</p>
                    <p className="mt-0.5 text-sm font-bold">{fact.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[26px] bg-[#fff0e8] p-6">
            <div className="flex items-center gap-2 font-bold text-[#9b422f]">
              <TriangleAlert className="h-5 w-5" />
              Know before you go
            </div>
            <div className="mt-5 space-y-4">
              {place.notes.map((note) => (
                <div key={note} className="flex gap-3 text-sm leading-6 text-ink/72">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {note}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] bg-[#e8f1ec] p-6">
            <div className="flex items-center gap-2 font-bold text-moss">
              <CloudRain className="h-5 w-5" />
              Weather fit
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              {place.weatherSuitability}
            </p>
          </div>
          {place.phrase && (
            <div className="rounded-[26px] bg-ink p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9dd7bb]">
                Show this locally
              </p>
              <p className="mt-4 font-semibold">{place.phrase.en}</p>
              <p className="mt-2 text-lg text-white/70">{place.phrase.zh}</p>
              <button
                onClick={() => notify("Phrase copied")}
                className="mt-5 text-sm font-semibold text-[#f3b995]"
              >
                Copy phrase
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
        {eyebrow}
      </p>
      <h1 className="font-display mt-2 text-4xl leading-[1.04] md:text-6xl">{title}</h1>
      {description && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/60">{description}</p>
      )}
    </div>
  );
}

function EntryScreen({
  value,
  onChange,
  onContinue,
}: {
  value: EntryStatus;
  onChange: (value: EntryStatus) => void;
  onContinue: () => void;
}) {
  const [detecting, setDetecting] = useState(false);
  const options: {
    value: EntryStatus;
    icon: LucideIcon;
    title: string;
    detail: string;
  }[] = [
    {
      value: "not-in-china",
      icon: PlaneTakeoff,
      title: "I am not in China yet",
      detail: "Start with entry rules, payment setup and reservations.",
    },
    {
      value: "arrived",
      icon: MapPin,
      title: "I have arrived in China",
      detail: "Jump to nearby places, transport and local help.",
    },
    {
      value: "detecting",
      icon: LocateFixed,
      title: detecting ? "Checking location…" : "Detect my location",
      detail: "Useful as a hint; VPNs can make it inaccurate.",
    },
  ];

  const choose = (status: EntryStatus) => {
    if (status === "detecting") {
      setDetecting(true);
      window.setTimeout(() => {
        setDetecting(false);
        onChange("arrived");
      }, 900);
    } else {
      onChange(status);
    }
  };

  return (
    <div className="page-shell grid min-h-[calc(100vh-72px)] items-center gap-10 py-10 lg:grid-cols-[.78fr_1.22fr]">
      <div>
        <Badge tone="good">
          <ShieldCheck className="h-3 w-3" /> You stay in control
        </Badge>
        <h1 className="font-display mt-6 text-5xl leading-[1.02] md:text-7xl">
          Are you already
          <br />
          <span className="italic text-moss">in China?</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-ink/62">
          This changes what you need first. Location detection helps, but you
          can always choose manually.
        </p>
        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#fff0e5] p-4 text-sm leading-6 text-ink/68">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
          GPS and IP location can disagree when a VPN is active. We never lock
          your trip based on detection alone.
        </div>
      </div>
      <div className="rounded-[34px] border border-black/[0.07] bg-white p-5 shadow-soft sm:p-7">
        <div className="space-y-3">
          {options.map((option) => {
            const Icon = option.icon;
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => choose(option.value)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-[22px] border p-4 text-left transition sm:p-5",
                  selected
                    ? "border-moss bg-[#edf5f0]"
                    : "border-black/[0.07] hover:border-moss/35",
                )}
              >
                <span
                  className={cn(
                    "grid h-12 w-12 shrink-0 place-items-center rounded-2xl",
                    selected ? "bg-moss text-white" : "bg-[#f2f3ef] text-ink/60",
                  )}
                >
                  <Icon className={cn("h-5 w-5", detecting && option.value === "detecting" && "animate-spin")} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{option.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-ink/52">
                    {option.detail}
                  </span>
                </span>
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                    selected ? "border-moss bg-moss text-white" : "border-black/15",
                  )}
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
        <Button onClick={onContinue} size="lg" className="mt-6 w-full">
          Continue with this choice <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-4 text-center text-xs text-ink/40">
          You can change this later in your travel profile.
        </p>
      </div>
    </div>
  );
}

const profileSections: {
  key: keyof UserProfile;
  title: string;
  detail: string;
  options: string[];
  multiple?: boolean;
}[] = [
  {
    key: "travelGroup",
    title: "Who are you traveling with?",
    detail: "This changes pace, transport and room for spontaneity.",
    options: ["Solo", "Couple", "Friends", "Family", "Kids", "Business"],
  },
  {
    key: "budget",
    title: "What feels comfortable?",
    detail: "Per person, excluding international flights.",
    options: ["Budget", "Standard", "Comfort", "Premium"],
  },
  {
    key: "purpose",
    title: "What brings you to China?",
    detail: "We will protect the main reason for your trip.",
    options: [
      "Sightseeing",
      "Business",
      "Transit",
      "Conference",
      "Visiting friends",
      "Deep local experience",
    ],
  },
  {
    key: "interests",
    title: "What should make the cut?",
    detail: "Pick a few. Your plan will still stay focused.",
    options: [
      "History",
      "Food",
      "Night view",
      "Shopping",
      "Nature",
      "Intangible heritage",
      "City walk",
      "Photography",
      "Kids",
      "Exhibition",
      "Coffee",
      "Bar",
    ],
    multiple: true,
  },
  {
    key: "foodPreferences",
    title: "Any food rules?",
    detail: "We turn these into Chinese phrase cards too.",
    options: [
      "Vegetarian",
      "Halal",
      "No spicy",
      "Allergy",
      "No pork",
      "No beef",
      "No seafood",
    ],
    multiple: true,
  },
  {
    key: "paymentReadiness",
    title: "How can you pay today?",
    detail: "We will not assume mobile payment works.",
    options: [
      "Alipay ready",
      "WeChat Pay ready",
      "Visa only",
      "Mastercard only",
      "Need cash reminder",
    ],
    multiple: true,
  },
  {
    key: "transportPreference",
    title: "How do you like to move?",
    detail: "Select all the modes you are comfortable using.",
    options: ["Metro", "Taxi", "Walking", "Private car", "High-speed rail"],
    multiple: true,
  },
  {
    key: "physicalIntensity",
    title: "Choose your pace",
    detail: "We use this to cap walking and stairs.",
    options: ["Easy", "Moderate", "Active"],
  },
];

function ProfileScreen({
  profile,
  setProfile,
  onGenerate,
}: {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onGenerate: () => void;
}) {
  const [step, setStep] = useState(0);
  const section = profileSections[step];
  const current = profile[section.key];
  const selected = Array.isArray(current) ? current : [current as string];

  const toggle = (option: string) => {
    if (section.multiple) {
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option];
      setProfile({ ...profile, [section.key]: next });
    } else {
      setProfile({ ...profile, [section.key]: option });
    }
  };

  return (
    <div className="page-shell py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[.34fr_.66fr]">
        <aside>
          <SectionHeader
            eyebrow="Your travel shape"
            title="A few choices. A much better route."
            description="No long forms. We only ask what changes the plan."
          />
          <div className="mt-8 rounded-[26px] bg-ink p-6 text-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Trip brief</p>
              <Badge className="bg-white/12 text-white">{step + 1} / 8</Badge>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <ProfileSummary icon={Globe2} label="Language" value="English" />
              <ProfileSummary icon={MapPin} label="City" value="Beijing" />
              <ProfileSummary icon={Clock3} label="Stay" value="2 days" />
              <ProfileSummary
                icon={CreditCard}
                label="Payment"
                value={profile.paymentReadiness.join(", ")}
              />
            </div>
          </div>
        </aside>

        <section className="rounded-[32px] border border-black/[0.07] bg-white p-6 shadow-card sm:p-9">
          <div className="flex gap-1.5">
            {profileSections.map((_, index) => (
              <button
                aria-label={`Go to profile step ${index + 1}`}
                key={index}
                onClick={() => setStep(index)}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition",
                  index <= step ? "bg-moss" : "bg-black/[0.08]",
                )}
              />
            ))}
          </div>
          <div className="mt-10 min-h-[430px]">
            <p className="text-sm font-bold text-coral">Step {step + 1}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] md:text-4xl">
              {section.title}
            </h2>
            <p className="mt-2 text-ink/52">{section.detail}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.options.map((option) => {
                const active = selected.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={cn(
                      "relative min-h-[84px] rounded-[20px] border p-4 text-left text-sm font-semibold transition",
                      active
                        ? "border-moss bg-[#edf5f0] text-moss"
                        : "border-black/[0.08] hover:border-moss/35",
                    )}
                  >
                    {option}
                    <span
                      className={cn(
                        "absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border",
                        active ? "border-moss bg-moss text-white" : "border-black/15",
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-black/[0.07] pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < profileSections.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next question <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="primary" size="lg" onClick={onGenerate}>
                <Sparkles className="h-4 w-4" /> Generate my China plan
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileSummary({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#9dd7bb]" />
      <div className="min-w-0">
        <p className="text-xs text-white/42">{label}</p>
        <p className="mt-0.5 line-clamp-2 font-semibold">{value}</p>
      </div>
    </div>
  );
}

function PrepareScreen({ notify }: { notify: (message: string) => void }) {
  const [items, setItems] = useState<ChecklistItem[]>(checklistSeed);
  const complete = items.filter((item) => item.status === "Done").length;
  const cycle = (id: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const status =
          item.status === "Not started"
            ? "In progress"
            : item.status === "In progress"
              ? "Done"
              : "Not started";
        return { ...item, status };
      }),
    );
  };

  return (
    <div className="page-shell py-8 md:py-12">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Before you land"
          title="Arrive ready, not overprepared."
          description="The essentials for a first Beijing trip, ordered by what can block the journey."
        />
        <div className="min-w-[260px] rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Trip readiness</span>
            <span className="text-moss">{complete}/{items.length} done</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.07]">
            <div
              className="h-full rounded-full bg-moss transition-all"
              style={{ width: `${(complete / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-9 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-[22px] border border-black/[0.07] bg-white p-5 sm:flex-row sm:items-center"
            >
              <button
                onClick={() => cycle(item.id)}
                aria-label={`Change status for ${item.title}`}
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full border-2",
                  item.status === "Done"
                    ? "border-moss bg-moss text-white"
                    : item.status === "In progress"
                      ? "border-[#d59620] bg-[#fff2d8] text-[#8a5b00]"
                      : "border-black/10 text-ink/20",
                )}
              >
                {item.status === "Done" ? (
                  <Check className="h-4 w-4" />
                ) : item.status === "In progress" ? (
                  <MoreHorizontal className="h-4 w-4" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{item.title}</h3>
                  <Badge tone={item.priority === "Must do" ? "bad" : "neutral"}>
                    {item.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-6 text-ink/52">{item.detail}</p>
              </div>
              <div className="flex items-center gap-3 sm:block sm:text-right">
                <p className="mb-1 text-xs font-semibold text-ink/42">{item.status}</p>
                <button
                  onClick={() => notify(`${item.title} guide opened`)}
                  className="text-sm font-bold text-moss hover:underline"
                >
                  {item.action} <ChevronRight className="inline h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[26px] bg-[#172b23] p-6 text-white lg:sticky lg:top-24">
            <WalletCards className="h-6 w-6 text-[#9dd7bb]" />
            <h3 className="mt-5 text-xl font-bold">Visa-only payment plan</h3>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Use staffed counters and hotel support. Keep a cash buffer for
              local shops and transport failures.
            </p>
            <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/55">Suggested cash</span>
                <strong>¥500</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/55">Primary card</span>
                <strong>Visa</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/55">Mobile pay</span>
                <strong className="text-[#f3b995]">Not ready</strong>
              </div>
            </div>
            <Button
              onClick={() => notify("Official payment setup link opened")}
              className="mt-6 w-full bg-white text-ink hover:bg-white/90"
            >
              Open setup guide
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ItineraryScreen({
  navigate,
  notify,
}: {
  navigate: (view: View) => void;
  notify: (message: string) => void;
}) {
  const [day, setDay] = useState(1);
  const currentDay = itinerary.find((item) => item.day === day)!;

  return (
    <div className="page-shell py-8 md:py-12">
      <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeader
          eyebrow="Your executable route"
          title="Beijing in 2 days."
          description="Built for a first-time visitor who speaks no Chinese, pays with Visa and wants history, food and the Great Wall."
        />
        <div className="flex flex-wrap gap-2">
          <Badge tone="good">
            <BadgeCheck className="h-3 w-3" /> First-time visitor
          </Badge>
          <Badge tone="warn">
            <CreditCard className="h-3 w-3" /> Visa-only
          </Badge>
          <Badge tone="blue">
            <Languages className="h-3 w-3" /> No Chinese
          </Badge>
          <Badge tone="neutral">
            <CarFront className="h-3 w-3" /> Taxi preferred
          </Badge>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-[26px] bg-[#172b23] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <Sparkles className="h-5 w-5 text-[#9dd7bb]" />
          </span>
          <div>
            <p className="font-bold">4 agents checked this route</p>
            <p className="mt-1 text-sm text-white/55">
              Demand · Itinerary · Dynamic adjustment · Local bridge
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("assistant")}
          variant="outline"
          className="border-white/15 bg-white/10 text-white hover:bg-white/20"
        >
          Something changed <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-3">
          {itinerary.map((item) => (
            <button
              key={item.day}
              onClick={() => setDay(item.day)}
              className={cn(
                "w-full rounded-[22px] border p-5 text-left transition",
                day === item.day
                  ? "border-moss bg-moss text-white shadow-card"
                  : "border-black/[0.07] bg-white hover:border-moss/30",
              )}
            >
              <p className={cn("text-xs font-bold", day === item.day ? "text-white/60" : "text-ink/40")}>
                DAY {item.day}
              </p>
              <p className="mt-2 font-bold leading-5">{item.title}</p>
              <p className={cn("mt-3 text-xs", day === item.day ? "text-white/65" : "text-ink/45")}>
                {item.date}
              </p>
            </button>
          ))}
          <button
            onClick={() => notify("Shareable itinerary link copied")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 p-4 text-sm font-semibold text-ink/55"
          >
            <Share2 className="h-4 w-4" /> Share trip
          </button>
        </aside>

        <section>
          <div className="flex flex-col gap-4 rounded-[24px] border border-black/[0.07] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-moss">
                Day {currentDay.day} · {currentDay.date}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">
                {currentDay.title}
              </h2>
            </div>
            <div className="flex flex-col gap-2 text-sm sm:items-end">
              <span className="flex items-center gap-2 font-semibold">
                <Sun className="h-4 w-4 text-[#d68a00]" /> {currentDay.weather}
              </span>
              <span className="flex items-center gap-2 text-[#a14531]">
                <TriangleAlert className="h-4 w-4" /> {currentDay.risk}
              </span>
            </div>
          </div>

          <div className="relative mt-5 space-y-4 before:absolute before:bottom-10 before:left-[27px] before:top-10 before:w-px before:bg-moss/20 sm:before:left-[36px]">
            {currentDay.stops.map((stop, index) => (
              <article
                key={`${stop.time}-${stop.title}`}
                className="relative grid gap-4 rounded-[26px] border border-black/[0.07] bg-white p-5 shadow-card sm:grid-cols-[72px_1fr] sm:p-6"
              >
                <div className="relative z-10">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#edf4ef] text-moss sm:h-[72px] sm:w-[72px]">
                    <span className="text-sm font-bold">{stop.time}</span>
                  </div>
                </div>
                <div className="sm:pl-3">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-xs font-bold text-moss">
                        MAIN PLAN · STOP {index + 1}
                      </p>
                      <h3 className="mt-1 text-xl font-bold tracking-[-0.025em]">
                        {stop.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>
                        <Clock3 className="h-3 w-3" /> {stop.duration}
                      </Badge>
                      <Badge>
                        <CircleDollarSign className="h-3 w-3" /> {stop.estimatedCost}
                      </Badge>
                      <Badge tone="blue">
                        <CarFront className="h-3 w-3" /> {stop.transport}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-ink/62">{stop.mainTip}</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <RouteNote icon={CreditCard} title="Payment" text={stop.paymentTip} />
                    <RouteNote icon={Languages} title="Language" text={stop.languageTip} />
                    <RouteNote icon={TicketCheck} title="Booking" text={stop.reservationTip} />
                  </div>
                  <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#f3f3ef] p-4 sm:flex-row sm:items-center">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-ink/55">
                      <Umbrella className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-ink/42">BACKUP PLAN</p>
                      <p className="mt-1 text-sm font-semibold">{stop.backupPlan}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">
              Optional local help
            </p>
            <h2 className="mt-2 text-2xl font-bold">Only where it removes real friction</h2>
          </div>
          <button
            onClick={() => navigate("services")}
            className="hidden text-sm font-bold text-moss sm:block"
          >
            View all services <ArrowRight className="inline h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["English guide", "¥480–680", BookOpen],
            ["Airport pickup", "¥220–360", CarFront],
            ["Ticket booking", "From ¥60", TicketCheck],
            ["Translator", "¥160/hour", Languages],
          ].map(([title, price, icon]) => {
            const Icon = icon as LucideIcon;
            return (
              <button
                key={title as string}
                onClick={() => navigate("services")}
                className="flex items-center gap-4 rounded-2xl border border-black/[0.07] bg-white p-4 text-left"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf4ef] text-moss">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold">{title as string}</p>
                  <p className="mt-0.5 text-xs text-ink/45">{price as string}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RouteNote({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] p-3.5">
      <div className="flex items-center gap-2 text-xs font-bold text-ink/45">
        <Icon className="h-3.5 w-3.5 text-moss" /> {title}
      </div>
      <p className="mt-2 text-xs leading-5 text-ink/70">{text}</p>
    </div>
  );
}

const mapFilters = [
  { id: "visa", label: "Visa accepted", icon: CreditCard },
  { id: "english", label: "English menu", icon: Languages },
  { id: "cash", label: "Cash recommended", icon: Banknote },
  { id: "rain", label: "Rainy day", icon: Umbrella },
  { id: "vegetarian", label: "Vegetarian", icon: UtensilsCrossed },
  { id: "metro", label: "Easy by metro", icon: TrainFront },
];

function MapScreen({
  openPlace,
  notify,
}: {
  openPlace: (place: Place) => void;
  notify: (message: string) => void;
}) {
  const [filters, setFilters] = useState<string[]>(["visa"]);
  const [selectedId, setSelectedId] = useState(places[1].id);
  const [contribute, setContribute] = useState(false);

  const filtered = useMemo(
    () =>
      places.filter((place) =>
        filters.every((filter) => {
          if (filter === "visa") return place.visaAccepted === "yes";
          if (filter === "english") return place.englishMenu;
          if (filter === "cash") return place.cashRecommended;
          if (filter === "rain") return place.rainyDayFriendly;
          if (filter === "vegetarian") return place.vegetarianFriendly;
          if (filter === "metro") return place.metroEasy;
          return true;
        }),
      ),
    [filters],
  );
  const selected =
    places.find((place) => place.id === selectedId) ?? filtered[0] ?? places[0];
  const pins = [
    { id: "shanghai-walk", left: "35%", top: "38%" },
    { id: "suzhou-garden", left: "58%", top: "49%" },
    { id: "beijing-hutong", left: "68%", top: "23%" },
    { id: "mutianyu", left: "75%", top: "16%" },
  ];

  return (
    <div className="page-shell py-8 md:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Foreigner-friendly map"
          title="Know before you walk in."
          description="Payment, language, weather and transport notes from a foreign traveler’s point of view."
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setContribute(true)}>
            <Plus className="h-4 w-4" /> Add info
          </Button>
          <Button variant="ghost" onClick={() => setContribute(true)}>
            Report outdated
          </Button>
        </div>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {mapFilters.map((filter) => {
          const Icon = filter.icon;
          const active = filters.includes(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() =>
                setFilters(
                  active
                    ? filters.filter((id) => id !== filter.id)
                    : [...filters, filter.id],
                )
              }
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                active
                  ? "border-moss bg-moss text-white"
                  : "border-black/10 bg-white text-ink/60",
              )}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid min-h-[680px] overflow-hidden rounded-[30px] border border-black/[0.07] bg-white shadow-card lg:grid-cols-[360px_1fr]">
        <aside className="order-2 border-black/[0.07] p-4 lg:order-1 lg:border-r">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              aria-label="Search places"
              placeholder="Search city or place"
              className="h-12 w-full rounded-2xl border border-black/[0.08] bg-[#f7f8f4] pl-11 pr-4 text-sm outline-none focus:border-moss"
            />
          </div>
          <p className="px-1 text-xs font-semibold text-ink/40">
            {filtered.length} places match all selected filters
          </p>
          <div className="mt-3 max-h-[570px] space-y-2 overflow-y-auto pr-1">
            {filtered.length ? (
              filtered.map((place) => (
                <button
                  key={place.id}
                  onClick={() => setSelectedId(place.id)}
                  className={cn(
                    "flex w-full gap-3 rounded-2xl p-3 text-left transition",
                    selected.id === place.id ? "bg-[#edf4ef]" : "hover:bg-black/[0.035]",
                  )}
                >
                  <img
                    src={place.image}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-moss">
                      {place.city} · {place.category}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-sm font-bold">
                      {place.name}
                    </span>
                    <span className="mt-2 flex items-center gap-1 text-xs text-ink/45">
                      <Star className="h-3 w-3 fill-[#d99827] text-[#d99827]" />
                      {place.foreignerRating}
                      <span className="mx-1">·</span>
                      {place.estimatedCost}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-2xl bg-[#f4f4f0] p-6 text-center">
                <SlidersHorizontal className="mx-auto h-5 w-5 text-ink/35" />
                <p className="mt-3 text-sm font-bold">No exact match</p>
                <p className="mt-1 text-xs leading-5 text-ink/45">
                  Remove one filter to see the nearest alternatives.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section className="relative order-1 min-h-[520px] overflow-hidden map-canvas lg:order-2 lg:min-h-full">
          <svg
            viewBox="0 0 800 680"
            className="absolute inset-0 h-full w-full opacity-60"
            aria-hidden="true"
          >
            <path
              d="M0 160 C170 220, 210 80, 430 180 S670 250, 820 120"
              fill="none"
              stroke="#94b1a1"
              strokeWidth="18"
              opacity=".35"
            />
            <path
              d="M60 620 C230 480, 350 600, 530 370 S720 170, 820 260"
              fill="none"
              stroke="#fff"
              strokeWidth="13"
            />
            <path
              d="M0 420 C190 380, 240 480, 420 390 S690 330, 820 440"
              fill="none"
              stroke="#fff"
              strokeWidth="8"
            />
            <path
              d="M190 0 C200 180, 340 220, 320 420 S270 590, 350 690"
              fill="none"
              stroke="#fff"
              strokeWidth="9"
            />
          </svg>
          {pins.map((pin) => {
            const place = places.find((item) => item.id === pin.id)!;
            const visible = filtered.some((item) => item.id === pin.id);
            return (
              <button
                key={pin.id}
                onClick={() => setSelectedId(pin.id)}
                style={{ left: pin.left, top: pin.top }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 transition",
                  !visible && filters.length ? "opacity-25" : "opacity-100",
                )}
              >
                <span
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-full border-[3px] border-white shadow-card",
                    selected.id === pin.id ? "bg-coral text-white" : "bg-moss text-white",
                  )}
                >
                  {place.category === "Food" ? (
                    <UtensilsCrossed className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </span>
              </button>
            );
          })}

          <div className="absolute bottom-4 left-4 right-4 rounded-[24px] bg-white p-4 shadow-soft sm:left-auto sm:w-[360px]">
            <div className="flex gap-3">
              <img
                src={selected.image}
                alt=""
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-moss">{selected.city}</p>
                <h3 className="mt-1 truncate font-bold">{selected.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selected.visaAccepted === "yes" && <Badge tone="good">Visa</Badge>}
                  {selected.cashRecommended && <Badge tone="warn">Bring cash</Badge>}
                  {selected.englishMenu && <Badge tone="blue">English menu</Badge>}
                </div>
              </div>
            </div>
            <Button
              variant="soft"
              size="sm"
              onClick={() => openPlace(selected)}
              className="mt-4 w-full"
            >
              View place details <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </section>
      </div>

      {contribute && (
        <ContributionModal
          onClose={() => setContribute(false)}
          onSubmit={() => {
            setContribute(false);
            notify("+50 points · travel coupon unlocked");
          }}
        />
      )}
    </div>
  );
}

function ContributionModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const options = [
    "This place does not accept Visa",
    "English menu available",
    "Cash needed",
    "Vegetarian friendly",
    "Good for rainy days",
    "Hard to get taxi",
  ];
  return (
    <div className="fixed inset-0 z-[90] grid place-items-end bg-black/35 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
      <div className="w-full max-w-lg rounded-t-[30px] bg-white p-6 shadow-soft sm:rounded-[30px] sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">
              Help the next traveler
            </p>
            <h2 className="mt-2 text-2xl font-bold">What did you confirm?</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-2">
          {options.map((option) => {
            const active = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() =>
                  setSelected(
                    active
                      ? selected.filter((item) => item !== option)
                      : [...selected, option],
                  )
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold",
                  active ? "border-moss bg-[#edf4ef]" : "border-black/[0.08]",
                )}
              >
                {option}
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border",
                    active ? "border-moss bg-moss text-white" : "border-black/15",
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                </span>
              </button>
            );
          })}
        </div>
        <Button onClick={onSubmit} disabled={!selected.length} className="mt-6 w-full">
          Submit update · earn 50 points
        </Button>
      </div>
    </div>
  );
}

function AssistantScreen({ navigate }: { navigate: (view: View) => void }) {
  const [active, setActive] = useState(quickPrompts[0]);
  const [response, setResponse] = useState<AssistantResponse>(
    getAssistantResponse(quickPrompts[0]),
  );
  const [loading, setLoading] = useState(false);

  const choose = (prompt: string) => {
    setActive(prompt);
    setLoading(true);
    window.setTimeout(() => {
      setResponse(getAssistantResponse(prompt));
      setLoading(false);
    }, 420);
  };

  return (
    <div className="page-shell py-8 md:py-12">
      <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeader
          eyebrow="Dynamic adjustment agent"
          title="Tell us what changed."
          description="Get one revised plan, one fallback and the local details needed to act on it."
        />
        <div className="rounded-2xl bg-[#e8f1ec] px-4 py-3 text-sm font-semibold text-moss">
          <Clock3 className="mr-2 inline h-4 w-4" />
          Context: Beijing · 09:42 · Day 1
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[330px_1fr]">
        <aside className="rounded-[28px] bg-white p-4 shadow-card">
          <p className="px-2 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/38">
            Quick changes
          </p>
          <div className="mt-1 space-y-1.5">
            {quickPrompts.map((prompt) => {
              const icons: Record<string, LucideIcon> = {
                "It is raining today.": CloudRain,
                "I woke up late.": Clock3,
                "I feel tired.": Accessibility,
                "I want less walking.": Footprints,
                "I missed my reservation.": TicketCheck,
                "I want vegetarian food nearby.": UtensilsCrossed,
                "I need to catch a flight tonight.": Plane,
                "This place is too crowded.": UsersRound,
                "I cannot use Alipay.": WalletCards,
              };
              const Icon = icons[prompt] ?? MessageCircle;
              return (
                <button
                  key={prompt}
                  onClick={() => choose(prompt)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition",
                    active === prompt ? "bg-ink text-white" : "hover:bg-black/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                      active === prompt
                        ? "bg-white/12 text-[#9dd7bb]"
                        : "bg-[#edf4ef] text-moss",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{prompt}</span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-black/[0.08] p-2">
            <input
              aria-label="Describe what changed"
              placeholder="Describe another change…"
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
            />
            <button
              onClick={() => choose("I cannot use Alipay.")}
              aria-label="Send"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-moss text-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </aside>

        <section
          className={cn(
            "min-h-[650px] rounded-[30px] border border-black/[0.07] bg-white p-5 shadow-card sm:p-7",
            loading && "opacity-55",
          )}
        >
          <div className="flex flex-col gap-4 border-b border-black/[0.07] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="good">Demand recognized</Badge>
                <Badge tone="blue">Route rechecked</Badge>
                <Badge tone="warn">Local rules applied</Badge>
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em]">
                {loading ? "Rechecking timing and local constraints…" : response.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
                {response.summary}
              </p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf4ef] text-moss">
              {loading ? (
                <RefreshCcw className="h-5 w-5 animate-spin" />
              ) : (
                <WandSparkles className="h-5 w-5" />
              )}
            </span>
          </div>

          {!loading && (
            <div className="slide-in">
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/38">
                  What changed
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {response.changed.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[#f0f1ed] px-3 py-2 text-xs font-semibold"
                    >
                      <Check className="mr-1.5 inline h-3 w-3 text-moss" /> {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[1.18fr_.82fr]">
                <div className="rounded-[24px] bg-[#173f32] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold tracking-[0.15em] text-[#9dd7bb]">
                      MAIN PLAN
                    </p>
                    <Badge className="bg-white/12 text-white">Best fit now</Badge>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold">{response.mainPlan.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-[#f3b995]">
                    {response.mainPlan.timing}
                  </p>
                  <p className="mt-5 text-sm leading-6 text-white/65">
                    {response.mainPlan.note}
                  </p>
                  <Button
                    onClick={() => navigate("itinerary")}
                    className="mt-6 bg-white text-ink hover:bg-white/90"
                  >
                    Apply to my trip
                  </Button>
                </div>
                <div className="rounded-[24px] bg-[#f0f1ed] p-6">
                  <p className="text-xs font-bold tracking-[0.15em] text-ink/38">
                    BACKUP PLAN
                  </p>
                  <h3 className="mt-5 text-xl font-bold">{response.backupPlan.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-moss">
                    {response.backupPlan.timing}
                  </p>
                  <p className="mt-5 text-sm leading-6 text-ink/58">
                    {response.backupPlan.note}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#f3c5ba] bg-[#fff2ee] p-4">
                <div className="flex gap-3">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                  <div>
                    <p className="text-xs font-bold text-[#9b422f]">WHAT TO SKIP</p>
                    <p className="mt-1 text-sm font-semibold">{response.skip}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <AgentNote icon={Languages} label="Local bridge" text={response.bridgeTip} />
                <AgentNote icon={CarFront} label="Transport" text={response.transportTip} />
                <AgentNote icon={CreditCard} label="Payment" text={response.paymentTip} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AgentNote({
  icon: Icon,
  label,
  text,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.07] p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf4ef] text-moss">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-ink/38">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink/68">{text}</p>
    </div>
  );
}

function ServicesScreen({ notify }: { notify: (message: string) => void }) {
  const iconMap: Record<string, LucideIcon> = {
    Landmark: Building2,
    Footprints,
    CarFront,
    Languages,
    Camera,
    CookingPot,
  };
  return (
    <div className="page-shell py-8 md:py-12">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Local help, when you need it"
          title="People who close the last mile."
          description="Clear scope, language and price before you inquire. ChinaMate connects you; payment stays with the provider."
        />
        <div className="flex gap-2">
          <Button variant="outline">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <Button variant="soft">
            Beijing <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const Icon = iconMap[service.icon] ?? UsersRound;
          return (
            <article
              key={service.id}
              className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-card"
            >
              <div
                className="flex h-36 items-end justify-between p-6"
                style={{ backgroundColor: service.accent }}
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-moss shadow-card">
                  <Icon className="h-6 w-6" />
                </span>
                <Badge className="bg-white text-ink">
                  <Star className="h-3 w-3 fill-[#d99827] text-[#d99827]" />{" "}
                  {service.rating}
                </Badge>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-moss">
                  {service.category}
                </p>
                <h3 className="mt-2 text-xl font-bold">{service.name}</h3>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <ServiceFact label="Price" value={service.price} />
                  <ServiceFact label="Duration" value={service.duration} />
                  <ServiceFact label="Language" value={service.language} />
                  <ServiceFact label="Best for" value={service.bestFor} />
                </div>
                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={() => notify(`Inquiry sent to ${service.name}`)}
                    className="flex-1"
                  >
                    Inquire
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => notify("Service saved")}
                    aria-label="Save service"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col gap-5 rounded-[28px] bg-[#172b23] p-7 text-white md:flex-row md:items-center md:justify-between md:p-9">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#9dd7bb]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xl font-bold">A connector, not a payment platform</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              ChinaMate shows provider details and creates an inquiry. Booking
              confirmation and payment happen on the provider&apos;s own channel.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-white/15 bg-white/10 text-white hover:bg-white/20"
        >
          How provider checks work
        </Button>
      </div>
    </div>
  );
}

function ServiceFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink/38">{label}</p>
      <p className="mt-1 line-clamp-2 font-semibold leading-5">{value}</p>
    </div>
  );
}

function FeedbackScreen({ notify }: { notify: (message: string) => void }) {
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>(["Great for foreigners", "Visa accepted"]);
  const [generated, setGenerated] = useState(false);
  const [scores, setScores] = useState({
    "Payment ease": 72,
    "Language ease": 84,
    "Transport ease": 78,
    "Local depth": 94,
    Safety: 92,
    "Value for money": 88,
  });
  const allTags = [
    "Visa accepted",
    "Cash needed",
    "English menu",
    "Hard to find taxi",
    "Great for foreigners",
    "Too crowded",
    "Good in rain",
    "Not good at night",
  ];

  return (
    <div className="page-shell py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[.58fr_.42fr]">
        <section>
          <SectionHeader
            eyebrow="Close the loop"
            title="How did China feel?"
            description="A few taps improve your next route and help other foreign travelers."
          />
          <div className="mt-8 rounded-[30px] border border-black/[0.07] bg-white p-6 shadow-card sm:p-8">
            <div>
              <p className="text-sm font-bold">Your overall trip</p>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    aria-label={`${star} stars`}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        star <= rating
                          ? "fill-[#e9a536] text-[#e9a536]"
                          : "text-black/12",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="my-7 h-px bg-black/[0.07]" />
            <p className="text-sm font-bold">What was easy—or not?</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {Object.entries(scores).map(([label, value]) => (
                <label key={label} className="block">
                  <span className="flex items-center justify-between text-xs font-semibold">
                    <span>{label}</span>
                    <span className="text-moss">{value}</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(event) =>
                      setScores({
                        ...scores,
                        [label]: Number(event.target.value),
                      })
                    }
                    className="mt-3 h-1.5 w-full accent-moss"
                  />
                </label>
              ))}
            </div>

            <div className="my-7 h-px bg-black/[0.07]" />
            <p className="text-sm font-bold">Fast local notes</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() =>
                      setTags(
                        active ? tags.filter((item) => item !== tag) : [...tags, tag],
                      )
                    }
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-xs font-semibold",
                      active
                        ? "border-moss bg-[#edf4ef] text-moss"
                        : "border-black/10 text-ink/52",
                    )}
                  >
                    {active && <Check className="mr-1 inline h-3 w-3" />}
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-[180px_1fr]">
              <button
                onClick={() => notify("Photo picker opened")}
                className="grid min-h-[120px] place-items-center rounded-2xl border border-dashed border-black/15 bg-[#f7f8f4] text-center"
              >
                <span>
                  <Upload className="mx-auto h-5 w-5 text-moss" />
                  <span className="mt-2 block text-xs font-semibold">Add trip photos</span>
                </span>
              </button>
              <textarea
                aria-label="Optional review"
                placeholder="One short note for the next traveler (optional)"
                className="min-h-[120px] resize-none rounded-2xl border border-black/[0.08] p-4 text-sm outline-none focus:border-moss"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setGenerated(true)}
              className="mt-6 w-full"
            >
              <Sparkles className="h-4 w-4" /> Generate travel recap card
            </Button>
          </div>
        </section>

        <aside className="lg:pt-20">
          <div
            className={cn(
              "overflow-hidden rounded-[32px] bg-[#173f32] text-white shadow-soft transition",
              generated ? "opacity-100" : "opacity-92",
            )}
          >
            <div className="relative h-64">
              <img
                src="/images/great-wall.jpg"
                alt="Great Wall recap"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#173f32] to-transparent" />
              <div className="absolute left-6 top-6">
                <Logo light />
              </div>
              <div className="absolute bottom-5 left-6">
                <p className="font-display text-4xl">
                  Beijing,
                  <br />
                  <span className="italic text-[#f3b995]">done my way.</span>
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <RecapMetric value="2" label="days" />
                <RecapMetric value="6" label="places" />
                <RecapMetric value="12.4k" label="steps/day" />
              </div>
              <div className="my-6 h-px bg-white/10" />
              <div className="space-y-4">
                <RecapLine label="Favorite place" value="Mutianyu Great Wall" />
                <RecapLine label="Route" value="Wall → imperial core → hutongs" />
                <RecapLine label="Local tips added" value={`${tags.length} verified notes`} />
              </div>
              {generated ? (
                <div className="mt-6 rounded-2xl bg-white/10 p-4">
                  <div className="flex items-center gap-2 font-semibold text-[#9dd7bb]">
                    <PartyPopper className="h-4 w-4" /> Your recap is ready
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/55">
                    Formatted for a 4:5 social post. Nothing shared yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/20 p-4 text-center text-xs text-white/45">
                  Complete your review to finalize this card.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {["TikTok", "Instagram", "X", "Facebook"].map((platform) => (
              <button
                key={platform}
                onClick={() =>
                  notify(
                    generated
                      ? `Share preview opened for ${platform}`
                      : "Generate the recap card first",
                  )
                }
                className="rounded-2xl border border-black/[0.07] bg-white px-2 py-3 text-[11px] font-semibold"
              >
                {platform}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function RecapMetric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/38">{label}</p>
    </div>
  );
}

function RecapLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/42">{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}
