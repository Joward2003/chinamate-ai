"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  CircleUserRound,
  Languages,
  Pencil,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  defaultAdminProfile,
  loadAdminProfile,
  resetAdminProfile,
  saveAdminProfile,
  type UserProfile,
} from "@/lib/profile";

type DrawerKey = "language" | "safety" | "trip";

const languageOptions: UserProfile["interfaceLanguage"][] = [
  "English",
  "Simplified Chinese",
];
const translationModes: UserProfile["translationMode"][] = [
  "English + Chinese",
  "English only",
  "Chinese on demand",
];
const travelStyles = ["First-time visitor", "Business", "Leisure", "Family", "Solo"];
const transportOptions = [
  "Metro",
  "Taxi",
  "Walking",
  "High-speed rail",
  "No preference",
];
const budgetOptions = ["Budget", "Comfort", "Premium"];
const paymentOptions = ["Alipay", "WeChat Pay", "Bank card", "Cash"];
const needOptions = [
  "Food",
  "Transport",
  "Payment",
  "Hotels",
  "Attractions",
  "Medical help",
  "Shopping",
];

export function ProfilePreferenceCenter() {
  const [profile, setProfile] = useState<UserProfile>(defaultAdminProfile);
  const [draft, setDraft] = useState<UserProfile>(defaultAdminProfile);
  const [activeDrawer, setActiveDrawer] = useState<DrawerKey | null>(null);
  const [toast, setToast] = useState("");
  const [previewSafety, setPreviewSafety] = useState(false);

  useEffect(() => {
    const loaded = loadAdminProfile();
    setProfile(loaded);
    setDraft(loaded);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const summary = useMemo(
    () => [
      `${profile.interfaceLanguage} interface`,
      profile.chineseAssistanceEnabled
        ? "Chinese assistance enabled"
        : "Chinese assistance off",
      profile.currentCity,
      profile.paymentPreferences.length
        ? profile.paymentPreferences.join(" · ")
        : "No payment preference",
    ],
    [profile],
  );

  const drawerDirty =
    activeDrawer !== null && JSON.stringify(draft) !== JSON.stringify(profile);

  const openDrawer = (drawer: DrawerKey) => {
    setDraft(profile);
    setPreviewSafety(false);
    setActiveDrawer(drawer);
  };

  const closeDrawer = () => {
    if (
      drawerDirty &&
      !window.confirm("You have unsaved changes. Close without saving?")
    ) {
      return;
    }
    setDraft(profile);
    setActiveDrawer(null);
    setPreviewSafety(false);
  };

  const cancelDrawer = () => {
    setDraft(profile);
    setActiveDrawer(null);
    setPreviewSafety(false);
  };

  const saveDraft = () => {
    saveAdminProfile(draft);
    setProfile(draft);
    setActiveDrawer(null);
    setPreviewSafety(false);
    setToast("Preferences saved");
  };

  const resetToDefaults = () => {
    const next = resetAdminProfile();
    setProfile(next);
    setDraft(next);
    setActiveDrawer(null);
    setPreviewSafety(false);
    setToast("Defaults restored");
  };

  const updateProfileImmediately = (next: UserProfile) => {
    saveAdminProfile(next);
    setProfile(next);
    setDraft(next);
    setToast("Preferences saved");
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
        Your ChinaMate
      </p>
      <h1 className="font-display mt-2 text-4xl sm:text-5xl">Profile</h1>

      <section className="mt-7 rounded-[30px] bg-[#173f32] p-6 text-white shadow-card sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CircleUserRound className="h-10 w-10 text-[#f3b995]" />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
              Demo user
            </p>
            <h2 className="mt-1 text-3xl font-bold">{profile.displayName}</h2>
          </div>
          <Button
            type="button"
            variant="soft"
            onClick={() => openDrawer("trip")}
            className="bg-white/12 text-white hover:bg-white/18"
          >
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {summary.map((item) => (
            <div
              key={item}
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/82"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        <PreferenceCard
          icon={Languages}
          title="Language"
          value={`${profile.interfaceLanguage} · ${profile.translationMode}`}
          onClick={() => openDrawer("language")}
        />
        <PreferenceCard
          icon={ShieldCheck}
          title="Safety"
          value={safetySummary(profile)}
          onClick={() => openDrawer("safety")}
        />
        <PreferenceCard
          icon={BookOpen}
          title="Trip tools"
          value={`${profile.currentCity} · ${profile.travelStyle} · ${profile.transportPreference}`}
          onClick={() => openDrawer("trip")}
        />
      </section>

      <section className="mt-4 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eaf4ef] text-moss">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">
                  Use my travel preferences to personalize answers
                </h2>
                <p className="mt-1 text-sm leading-6 text-ink/52">
                  ChinaMate will use your selected language, city, transport and
                  safety preferences when generating help cards.
                </p>
              </div>
              <ToggleSwitch
                checked={profile.aiPersonalizationEnabled}
                label="AI personalization"
                onChange={(checked) =>
                  updateProfileImmediately({
                    ...profile,
                    aiPersonalizationEnabled: checked,
                  })
                }
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="soft">
          <Link href="/guide/shanghai-starter">Open Shanghai starter guide</Link>
        </Button>
        <Button type="button" variant="outline" onClick={resetToDefaults}>
          <RotateCcw className="h-4 w-4" /> Reset to defaults
        </Button>
      </div>

      {activeDrawer && (
        <ProfileDrawer
          title={drawerTitle(activeDrawer)}
          onClose={closeDrawer}
          onCancel={cancelDrawer}
          onSave={saveDraft}
          onReset={() => setDraft(defaultAdminProfile)}
        >
          {activeDrawer === "language" && (
            <LanguageSettings draft={draft} setDraft={setDraft} />
          )}
          {activeDrawer === "safety" && (
            <SafetySettings
              draft={draft}
              setDraft={setDraft}
              previewSafety={previewSafety}
              setPreviewSafety={setPreviewSafety}
            />
          )}
          {activeDrawer === "trip" && (
            <TripSettings draft={draft} setDraft={setDraft} />
          )}
        </ProfileDrawer>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft md:bottom-8">
          <Check className="h-4 w-4 text-[#f3b995]" /> {toast}
        </div>
      )}
    </div>
  );
}

function PreferenceCard({
  icon: Icon,
  title,
  value,
  onClick,
}: {
  icon: typeof Languages;
  title: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[24px] border border-black/[0.06] bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-moss/20"
    >
      <Icon className="h-5 w-5 text-moss" />
      <span className="min-w-0 flex-1">
        <strong className="block">{title}</strong>
        <span className="block truncate text-sm text-ink/50">{value}</span>
      </span>
      <ChevronRight className="h-5 w-5 text-ink/25" />
    </button>
  );
}

function ProfileDrawer({
  title,
  children,
  onClose,
  onCancel,
  onSave,
  onReset,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onCancel: () => void;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close profile drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/28"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-paper shadow-soft">
        <header className="flex items-center justify-between border-b border-black/[0.07] bg-white px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        <footer className="grid gap-2 border-t border-black/[0.07] bg-white p-4 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button type="button" variant="soft" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save preferences
          </Button>
        </footer>
      </aside>
    </div>
  );
}

function LanguageSettings({
  draft,
  setDraft,
}: {
  draft: UserProfile;
  setDraft: (profile: UserProfile) => void;
}) {
  return (
    <div className="space-y-5">
      <OptionGroup
        label="Interface language"
        options={languageOptions}
        value={draft.interfaceLanguage}
        onChange={(value) =>
          setDraft({
            ...draft,
            interfaceLanguage: value as UserProfile["interfaceLanguage"],
          })
        }
      />
      <SettingRow
        title="Show Chinese assistance cards"
        checked={draft.chineseAssistanceEnabled}
        onChange={(checked) =>
          setDraft({ ...draft, chineseAssistanceEnabled: checked })
        }
      />
      <OptionGroup
        label="Translation display mode"
        options={translationModes}
        value={draft.translationMode}
        onChange={(value) =>
          setDraft({
            ...draft,
            translationMode: value as UserProfile["translationMode"],
          })
        }
      />
      <SettingRow
        title="Show simplified instructions"
        checked={draft.simplifiedInstructions}
        onChange={(checked) =>
          setDraft({ ...draft, simplifiedInstructions: checked })
        }
      />
    </div>
  );
}

function SafetySettings({
  draft,
  setDraft,
  previewSafety,
  setPreviewSafety,
}: {
  draft: UserProfile;
  setDraft: (profile: UserProfile) => void;
  previewSafety: boolean;
  setPreviewSafety: (value: boolean) => void;
}) {
  const updateSafety = (
    key: keyof UserProfile["safetyPreferences"],
    checked: boolean,
  ) =>
    setDraft({
      ...draft,
      safetyPreferences: {
        ...draft.safetyPreferences,
        [key]: checked,
      },
    });

  return (
    <div className="space-y-4">
      <SettingRow
        title="Show emergency contact cards"
        checked={draft.safetyPreferences.emergencyCards}
        onChange={(checked) => updateSafety("emergencyCards", checked)}
      />
      <SettingRow
        title="Show scam warnings"
        checked={draft.safetyPreferences.scamWarnings}
        onChange={(checked) => updateSafety("scamWarnings", checked)}
      />
      <SettingRow
        title="Show hospital communication phrases"
        checked={draft.safetyPreferences.hospitalPhrases}
        onChange={(checked) => updateSafety("hospitalPhrases", checked)}
      />
      <SettingRow
        title="Show police communication phrases"
        checked={draft.safetyPreferences.policePhrases}
        onChange={(checked) => updateSafety("policePhrases", checked)}
      />
      <SettingRow
        title="Show lost passport instructions"
        checked={draft.safetyPreferences.lostPassportInstructions}
        onChange={(checked) =>
          updateSafety("lostPassportInstructions", checked)
        }
      />
      <Button
        type="button"
        variant="soft"
        onClick={() => setPreviewSafety(!previewSafety)}
        className="w-full"
      >
        Preview safety card
      </Button>
      {previewSafety && (
        <div className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">
            Safety preview
          </p>
          <h3 className="mt-2 font-bold">Ask official staff for help</h3>
          <p className="mt-2 text-sm leading-6 text-ink/58">
            ChinaMate will show official-channel reminders, scam warnings, and
            communication phrases based on the toggles above. Emergency phone
            numbers are not shown unless verified for the user location.
          </p>
          <p className="mt-3 rounded-2xl bg-[#eaf4ef] p-3 text-sm font-semibold text-moss">
            您好，我需要帮助。可以请您告诉我应该联系哪个官方渠道吗？
          </p>
        </div>
      )}
    </div>
  );
}

function TripSettings({
  draft,
  setDraft,
}: {
  draft: UserProfile;
  setDraft: (profile: UserProfile) => void;
}) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm font-bold">Current city</span>
        <input
          value={draft.currentCity}
          onChange={(event) =>
            setDraft({ ...draft, currentCity: event.target.value })
          }
          maxLength={80}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
        />
      </label>
      <OptionGroup
        label="Travel style"
        options={travelStyles}
        value={draft.travelStyle}
        onChange={(value) => setDraft({ ...draft, travelStyle: value })}
      />
      <OptionGroup
        label="Preferred transportation"
        options={transportOptions}
        value={draft.transportPreference}
        onChange={(value) =>
          setDraft({ ...draft, transportPreference: value })
        }
      />
      <OptionGroup
        label="Budget preference"
        options={budgetOptions}
        value={draft.budgetPreference}
        onChange={(value) => setDraft({ ...draft, budgetPreference: value })}
      />
      <TagGroup
        label="Preferred payment methods"
        options={paymentOptions}
        values={draft.paymentPreferences}
        onChange={(values) =>
          setDraft({ ...draft, paymentPreferences: values })
        }
      />
      <TagGroup
        label="Common needs"
        options={needOptions}
        values={draft.commonNeeds}
        onChange={(values) => setDraft({ ...draft, commonNeeds: values })}
      />
    </div>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">{label}</legend>
      <div className="mt-2 grid gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
              value === option
                ? "border-moss bg-[#eaf4ef] text-moss"
                : "border-black/10 bg-white text-ink/62 hover:border-moss/30"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function TagGroup({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (option: string) => {
    onChange(
      values.includes(option)
        ? values.filter((item) => item !== option)
        : [...values, option],
    );
  };

  return (
    <fieldset>
      <legend className="text-sm font-bold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              values.includes(option)
                ? "border-moss bg-[#eaf4ef] text-moss"
                : "border-black/10 bg-white text-ink/58 hover:border-moss/30"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function SettingRow({
  title,
  checked,
  onChange,
}: {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-black/[0.06] bg-white p-4 shadow-card">
      <span className="text-sm font-bold">{title}</span>
      <ToggleSwitch checked={checked} label={title} onChange={onChange} />
    </div>
  );
}

function ToggleSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${
        checked ? "bg-moss" : "bg-black/15"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

function drawerTitle(drawer: DrawerKey) {
  if (drawer === "language") return "Language preferences";
  if (drawer === "safety") return "Safety preferences";
  return "Trip tools";
}

function safetySummary(profile: UserProfile) {
  const enabled = Object.values(profile.safetyPreferences).filter(Boolean).length;
  return `${enabled} safety cards enabled · no unverified phone numbers`;
}
