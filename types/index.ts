export type SupportState = "yes" | "no" | "unknown";
export type EntryStatus = "not-in-china" | "arrived" | "detecting";

export interface Place {
  id: string;
  name: string;
  city: string;
  category: string;
  tags: string[];
  image: string;
  imageCredit?: string;
  estimatedCost: string;
  recommendedDuration: string;
  bestFor: string[];
  needReservation: boolean;
  passportRequired: boolean;
  englishService: SupportState;
  visaAccepted: SupportState;
  mastercardAccepted: SupportState;
  alipayWechatAccepted: SupportState;
  cashRecommended: boolean;
  englishMenu: boolean;
  vegetarianFriendly: boolean;
  halalFriendly: boolean;
  rainyDayFriendly: boolean;
  nightFriendly: boolean;
  familyFriendly: boolean;
  taxiEasy: boolean;
  metroEasy: boolean;
  lastMileDifficulty: "Easy" | "Moderate" | "Hard";
  weekendCrowded: boolean;
  foreignerRating: number;
  localDepthScore: number;
  safetyScore: number;
  paymentDifficulty: "Low" | "Medium" | "High";
  languageDifficulty: "Low" | "Medium" | "High";
  transportDifficulty: "Low" | "Medium" | "High";
  whyPopular: string;
  weatherSuitability: string;
  notes: string[];
  phrase?: { en: string; zh: string };
}

export interface ItineraryStop {
  time: string;
  placeId: string;
  title: string;
  duration: string;
  transport: string;
  transportTime: string;
  estimatedCost: string;
  mainTip: string;
  paymentTip: string;
  languageTip: string;
  reservationTip: string;
  backupPlan: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  date: string;
  weather: string;
  risk: string;
  stops: ItineraryStop[];
}

export interface UserProfile {
  nationality: string;
  language: string;
  ageGroup: string;
  gender?: string;
  travelGroup: string;
  cities: string[];
  stayDuration: string;
  budget: string;
  purpose: string;
  interests: string[];
  foodPreferences: string[];
  chineseAbility: string;
  paymentReadiness: string[];
  transportPreference: string[];
  physicalIntensity: string;
  entryStatus: EntryStatus;
}

export interface ChecklistItem {
  id: string;
  title: string;
  detail: string;
  status: "Not started" | "In progress" | "Done";
  action: string;
  priority: "Must do" | "Recommended";
}

export interface LocalService {
  id: string;
  name: string;
  category: string;
  price: string;
  language: string;
  duration: string;
  bestFor: string;
  rating: number;
  icon: string;
  accent: string;
}

export interface AssistantResponse {
  title: string;
  summary: string;
  changed: string[];
  mainPlan: { title: string; timing: string; note: string };
  backupPlan: { title: string; timing: string; note: string };
  skip: string;
  bridgeTip: string;
  transportTip: string;
  paymentTip: string;
}
