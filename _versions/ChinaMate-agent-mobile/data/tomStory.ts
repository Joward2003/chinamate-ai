export interface StoryDay {
  id: string;
  day: string;
  location: string;
  scene: string;
  title: string;
  summary: string;
  image: string;
  features: string[];
  agentMessage: string;
  tags: string[];
}

export const tomStory: StoryDay[] = [
  {
    id: "day0",
    day: "Day 0",
    location: "Los Angeles",
    scene: "At home",
    title: "Ten seconds from inspiration to a viable China route",
    summary:
      "Tom, 28, a vegetarian creator visiting Asia for the first time, registers with a phone number and English—then searches “Shanghai night view.”",
    image: "/images/tom-story/day0.jpg",
    features: [
      "10-second registration",
      "Language-based lifestyle prediction",
      "Only 3 matched routes",
      "144-hour entry checklist",
      "12306 English registration link",
    ],
    agentMessage:
      "Hi Tom. I’ll prioritize vegetarian food, cold drinks and a medium-budget city route. You can change any assumption.",
    tags: ["English", "Solo", "Vegetarian", "Medium budget"],
  },
  {
    id: "day1",
    day: "Day 1",
    location: "Shanghai",
    scene: "Pudong Airport",
    title: "The app knows he has arrived—but still leaves him in control",
    summary:
      "Arrival detection switches to in-China mode and activates tomorrow’s route without asking Tom to repeat his profile.",
    image: "/images/tom-story/day1.jpg",
    features: [
      "GPS-assisted arrival mode",
      "Rest-first recommendation",
      "Visa-friendly map markers",
      "Vegetarian and cash labels",
    ],
    agentMessage:
      "Welcome to China, Tom. Rest tonight. Your Yuyuan route is ready for tomorrow.",
    tags: ["Arrived", "Visa map", "Vegetarian nearby"],
  },
  {
    id: "day2",
    day: "Day 2",
    location: "Shanghai",
    scene: "Oriental Pearl · 15:45",
    title: "A useful next step appears at exactly the right moment",
    summary:
      "After two hours at the tower, the Agent combines location, time, 34°C heat and Tom’s coffee preference.",
    image: "/images/tom-story/day2.jpg",
    features: [
      "Stay-duration detection",
      "Heat-aware recommendations",
      "Nearby vegetarian options",
      "Automatic dinner delay",
    ],
    agentMessage:
      "Your tower visit looks complete. It’s 34°C outside—choose a shaded bookstore or an oat-milk coffee stop.",
    tags: ["34°C", "Trip complete", "Coffee nearby"],
  },
  {
    id: "day3",
    day: "Day 3",
    location: "Suzhou",
    scene: "Heavy rain",
    title: "Rain changes the route, not the traveler’s day",
    summary:
      "The outdoor garden plan becomes Suzhou Museum plus a covered market, with a verified vegetarian lunch.",
    image: "/images/tom-story/day3.jpg",
    features: [
      "Weather-triggered adjustment",
      "Indoor museum alternative",
      "English-menu lunch",
      "Visa acceptance note",
    ],
    agentMessage:
      "Heavy rain detected. I moved the garden outdoors time to an indoor museum and covered market.",
    tags: ["Rain mode", "Indoor", "Visa accepted"],
  },
  {
    id: "day4",
    day: "Day 4",
    location: "Hangzhou",
    scene: "Lingyin Temple",
    title: "The last mile is explained before it becomes a problem",
    summary:
      "Weekend parking pressure triggers an early warning with a practical bus drop-off and a cash-only vegetarian meal note.",
    image: "/images/tom-story/day4.jpg",
    features: [
      "Parking queue warning",
      "Better drop-off point",
      "3-minute entrance walk",
      "Cash-only vegetarian canteen",
    ],
    agentMessage:
      "Weekend parking is tight. Bus 7 stops three minutes from the entrance and avoids the 15-minute vehicle queue.",
    tags: ["Last mile", "Bus 7", "Cash needed"],
  },
  {
    id: "day5",
    day: "Day 5",
    location: "Hangzhou",
    scene: "West Lake",
    title: "A broken data connection becomes an actionable local answer",
    summary:
      "The Agent surfaces a passport-friendly mobile service counter and the nearest scenic-area Wi-Fi instructions.",
    image: "/images/tom-story/day5.jpg",
    features: [
      "Offline-state detection",
      "Nearby mobile service counter",
      "Passport setup note",
      "Scenic-area Wi-Fi fallback",
    ],
    agentMessage:
      "You appear offline. A China Mobile counter is 50m away, or use the West Lake guest Wi-Fi shown on your offline map.",
    tags: ["Offline help", "50m away", "Passport accepted"],
  },
  {
    id: "day6",
    day: "Day 6",
    location: "Hangzhou",
    scene: "A neighborhood noodle shop",
    title: "Tom turns local knowledge into help for the next traveler",
    summary:
      "He adds a peanut-allergy warning and picture-ordering tip to a cash-only restaurant listing.",
    image: "/images/tom-story/day6.jpg",
    features: [
      "Traveler-contributed map note",
      "Allergy warning",
      "Creator badge",
      "$10 hotel reward",
    ],
    agentMessage:
      "Your note can prevent a real problem. Submit it to earn the Hutong Explorer badge.",
    tags: ["UGC", "Allergy note", "Creator reward"],
  },
  {
    id: "day7",
    day: "Day 7",
    location: "Return flight",
    scene: "Somewhere above China",
    title: "The journey becomes the next traveler’s inspiration",
    summary:
      "BridgeTrip builds a seven-day recap from route traces, selected photos and meaningful local contributions.",
    image: "/images/tom-story/day7.jpg",
    features: [
      "Automatic trip timeline",
      "Selected photo recap",
      "TikTok and Instagram export",
      "Creator-to-acquisition loop",
    ],
    agentMessage:
      "Your story is ready: “My 7 Days in China with BridgeTrip.” Nothing is shared until you confirm.",
    tags: ["7-day recap", "Social export", "2M views"],
  },
];
