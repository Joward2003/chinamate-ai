export const ADMIN_PROFILE_STORAGE_KEY = "chinamate_admin_profile";

export interface UserProfile {
  userId: string;
  displayName: string;
  role: "admin";
  interfaceLanguage: "English" | "Simplified Chinese";
  chineseAssistanceEnabled: boolean;
  translationMode: "English + Chinese" | "English only" | "Chinese on demand";
  simplifiedInstructions: boolean;
  aiPersonalizationEnabled: boolean;
  currentCity: string;
  travelStyle: string;
  transportPreference: string;
  budgetPreference: string;
  paymentPreferences: string[];
  commonNeeds: string[];
  safetyPreferences: {
    emergencyCards: boolean;
    scamWarnings: boolean;
    hospitalPhrases: boolean;
    policePhrases: boolean;
    lostPassportInstructions: boolean;
  };
}

export type UserProfileContext = ReturnType<typeof buildUserProfileContext>;

export const defaultAdminProfile: UserProfile = {
  userId: "admin",
  displayName: "Admin",
  role: "admin",
  interfaceLanguage: "English",
  chineseAssistanceEnabled: true,
  translationMode: "English + Chinese",
  simplifiedInstructions: true,
  aiPersonalizationEnabled: true,
  currentCity: "Shanghai",
  travelStyle: "First-time visitor",
  transportPreference: "Metro",
  budgetPreference: "Comfort",
  paymentPreferences: ["Alipay", "WeChat Pay"],
  commonNeeds: ["Food", "Transport", "Payment", "Attractions"],
  safetyPreferences: {
    emergencyCards: true,
    scamWarnings: true,
    hospitalPhrases: true,
    policePhrases: true,
    lostPassportInstructions: true,
  },
};

export function loadAdminProfile(): UserProfile {
  if (typeof window === "undefined") return defaultAdminProfile;

  try {
    const saved = window.localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
    if (!saved) return defaultAdminProfile;
    return normalizeProfile(JSON.parse(saved));
  } catch {
    return defaultAdminProfile;
  }
}

export function saveAdminProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    ADMIN_PROFILE_STORAGE_KEY,
    JSON.stringify(normalizeProfile(profile)),
  );
}

export function resetAdminProfile() {
  saveAdminProfile(defaultAdminProfile);
  return defaultAdminProfile;
}

export function getUserProfileContext() {
  const profile = loadAdminProfile();
  return buildUserProfileContext(profile);
}

export function buildUserProfileContext(profile: UserProfile) {
  return {
    city: profile.currentCity,
    interfaceLanguage: profile.interfaceLanguage,
    chineseAssistanceEnabled: profile.chineseAssistanceEnabled,
    translationMode: profile.translationMode,
    simplifiedInstructions: profile.simplifiedInstructions,
    travelStyle: profile.travelStyle,
    transportPreference: profile.transportPreference,
    budgetPreference: profile.budgetPreference,
    paymentPreferences: profile.paymentPreferences,
    commonNeeds: profile.commonNeeds,
    safetyPreferences: profile.safetyPreferences,
  };
}

function normalizeProfile(value: Partial<UserProfile>): UserProfile {
  const profile = {
    ...defaultAdminProfile,
    ...value,
    userId: "admin",
    displayName: "Admin",
    role: "admin" as const,
    safetyPreferences: {
      ...defaultAdminProfile.safetyPreferences,
      ...value.safetyPreferences,
    },
  };

  return {
    ...profile,
    paymentPreferences: Array.isArray(profile.paymentPreferences)
      ? profile.paymentPreferences
      : defaultAdminProfile.paymentPreferences,
    commonNeeds: Array.isArray(profile.commonNeeds)
      ? profile.commonNeeds
      : defaultAdminProfile.commonNeeds,
  };
}
