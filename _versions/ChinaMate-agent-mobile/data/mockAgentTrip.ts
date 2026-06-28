export interface AgentTripProfile {
  destination: string;
  duration: string;
  travelers: string[];
  needs: string[];
  style: string[];
  transport: string[];
  food: string[];
  budget: string;
}

export interface AgentRouteNode {
  period: "Morning" | "Lunch" | "Afternoon" | "Evening";
  place: string;
  stay: string;
  reason: string;
  transport: string;
  tags: string[];
  lastMileTips: string[];
}

export const agentPrompts = [
  "2 days in Beijing with elderly parents",
  "144-hour transit in Shanghai, easy route",
  "Business trip in Shenzhen, local food after meetings",
  "Family trip in Chengdu, kid-friendly and not too rushed",
];

const routes: Record<string, AgentRouteNode[]> = {
  Beijing: [
    {
      period: "Morning",
      place: "Temple of Heaven",
      stay: "60–90 min",
      reason:
        "A classic landmark with open space and a gentle first look at imperial Beijing.",
      transport: "Taxi · 15–25 min",
      tags: ["Elderly-friendly", "Low walking", "Outdoor"],
      lastMileTips: [
        "Best taxi drop-off: East Gate.",
        "Walk about 300m from the drop-off point.",
        "Use a taxi instead of changing metro lines with elderly travelers.",
        "Keep 天坛东门 ready to show the driver.",
      ],
    },
    {
      period: "Lunch",
      place: "Local dumpling restaurant",
      stay: "45–60 min",
      reason: "A seated local meal with picture-menu ordering and mild options.",
      transport: "Walk or taxi · 5–10 min",
      tags: ["Local food", "Family-friendly", "Payment note"],
      lastMileTips: [
        "Ask the host for a table before ordering at the counter.",
        "Some small restaurants may not accept international cards.",
        "Show 不要辣 for food that is not spicy.",
      ],
    },
    {
      period: "Afternoon",
      place: "Qianmen & Dashilar",
      stay: "60–90 min",
      reason: "Old Beijing streets, snacks and shops in one adjustable route.",
      transport: "Taxi or subway · 20–30 min",
      tags: ["Local experience", "Adjustable", "Crowded after 5 PM"],
      lastMileTips: [
        "Use Zhushikou Station to avoid the longest pedestrian section.",
        "Take a taxi if the group feels tired.",
        "An indoor tea house nearby works as a heat or rain backup.",
      ],
    },
  ],
  Shanghai: [
    {
      period: "Morning",
      place: "The Bund riverfront",
      stay: "45–60 min",
      reason: "The essential skyline view on a flat, easy-to-shorten route.",
      transport: "Taxi · 15–25 min",
      tags: ["Low walking", "Photo-friendly", "Easy taxi"],
      lastMileTips: [
        "Best drop-off: Bund 18, not the underground tunnel entrance.",
        "The riverfront ramp is easier with luggage or a wheelchair.",
        "Use Nanjing East Road Station if road traffic is slow.",
      ],
    },
    {
      period: "Lunch",
      place: "Shanghai dim sum hall",
      stay: "45–60 min",
      reason: "A staffed restaurant with seating, picture menus and card payment.",
      transport: "Taxi · 10 min",
      tags: ["Visa-friendly", "Seated meal", "Local food"],
      lastMileTips: [
        "Choose a mall branch for reliable international-card payment.",
        "Keep the restaurant name in Chinese for the driver.",
        "Ask the hotel to store luggage before this stop.",
      ],
    },
    {
      period: "Afternoon",
      place: "Former French Concession loop",
      stay: "60–90 min",
      reason: "Plane-tree streets and cafés with frequent places to rest.",
      transport: "Subway or taxi · 20 min",
      tags: ["Relaxed", "Indoor backup", "Flexible"],
      lastMileTips: [
        "Start at Wukang Mansion and walk downhill.",
        "Shorten the route at Shanghai Library Metro Station.",
        "Use a café stop during heavy rain.",
      ],
    },
  ],
  Shenzhen: [
    {
      period: "Afternoon",
      place: "Civic Center skyline",
      stay: "40–60 min",
      reason: "A quick city landmark that fits between meetings.",
      transport: "Metro · 15–25 min",
      tags: ["Business-friendly", "Easy metro", "Low cost"],
      lastMileTips: [
        "Use Exit B at Civic Center Station.",
        "Taxi pickup is easier on Fuzhong 3rd Road.",
        "Keep your hotel address in Chinese for the return.",
      ],
    },
    {
      period: "Evening",
      place: "Coco Park local dinner",
      stay: "60–90 min",
      reason: "A reliable post-meeting dinner area with varied local choices.",
      transport: "Taxi · 10–20 min",
      tags: ["After meetings", "Visa-friendly", "English menu"],
      lastMileTips: [
        "Mall restaurants are more reliable for international cards.",
        "Avoid the west taxi rank during the 18:00 rush.",
        "Ask for 少辣 if you prefer less spicy food.",
      ],
    },
    {
      period: "Evening",
      place: "Shenzhen Bay promenade",
      stay: "40–60 min",
      reason: "A calm waterfront finish without committing to a long excursion.",
      transport: "Taxi · 20 min",
      tags: ["Relaxed", "Night view", "Adjustable"],
      lastMileTips: [
        "Set the drop-off to Talent Park Gate 2.",
        "Skip this stop in heavy rain.",
        "Request the return car before walking to the water.",
      ],
    },
  ],
  Chengdu: [
    {
      period: "Morning",
      place: "Chengdu Panda Base",
      stay: "90–120 min",
      reason: "Go early for active pandas and a cooler, calmer family visit.",
      transport: "Taxi · 30–45 min",
      tags: ["Kid-friendly", "Needs reservation", "Morning first"],
      lastMileTips: [
        "Book the South Gate and bring the original passport.",
        "Use the internal shuttle to reduce walking.",
        "Taxi pickup after 11:00 can take 15–25 minutes.",
      ],
    },
    {
      period: "Lunch",
      place: "Mild Sichuan family restaurant",
      stay: "60 min",
      reason: "A seated local meal with mild dishes and simple family ordering.",
      transport: "Taxi · 15–20 min",
      tags: ["Family-friendly", "Not too spicy", "Local food"],
      lastMileTips: [
        "Show 微辣 or 不辣 before ordering.",
        "Ask whether dishes contain peanuts if allergies matter.",
        "Mall branches are easier for cards and strollers.",
      ],
    },
    {
      period: "Afternoon",
      place: "People’s Park tea house",
      stay: "60–90 min",
      reason: "A slow local-life stop where adults rest and children have space.",
      transport: "Taxi · 15 min",
      tags: ["Relaxed", "Local experience", "Seats available"],
      lastMileTips: [
        "Use the park’s South Gate for the shortest walk.",
        "Bring small cash in case the tea counter cannot take your card.",
        "Choose covered seating on rainy or very hot days.",
      ],
    },
  ],
};

export function parseAgentTrip(input: string): AgentTripProfile {
  const text = input.toLowerCase();
  const destination = text.includes("shanghai")
    ? "Shanghai"
    : text.includes("chengdu")
      ? "Chengdu"
      : text.includes("shenzhen")
        ? "Shenzhen"
        : text.includes("beijing")
          ? "Beijing"
          : "China";
  const duration = text.includes("144")
    ? "144-hour transit"
    : text.match(/\b(\d+)\s*days?\b/)?.[0] ?? "Flexible";
  const family = /parent|family|child|kid/.test(text);
  const elderly = /elderly|parent|senior/.test(text);
  const kids = /child|kid|7-year|family/.test(text);
  const business = /business|meeting|conference/.test(text);
  const lowWalking = /easy|not too much walking|low walking|elderly|parent/.test(text);

  return {
    destination,
    duration,
    travelers: business
      ? ["Business"]
      : family
        ? ["Family trip", ...(elderly ? ["Elderly parents"] : []), ...(kids ? ["Child"] : [])]
        : text.includes("couple")
          ? ["Couple"]
          : ["Solo / flexible"],
    needs: [
      ...(elderly ? ["Elderly-friendly"] : []),
      ...(kids ? ["Kid-friendly"] : []),
      ...(lowWalking ? ["Low walking preferred"] : []),
      ...(text.includes("luggage") ? ["Luggage"] : []),
      ...(text.includes("wheelchair") ? ["Wheelchair access"] : []),
    ],
    style: [
      business ? "Business + leisure" : "Local experience",
      /relax|easy|not too rushed|elderly|parent/.test(text) ? "Relaxed pace" : "Classic sightseeing",
    ],
    transport: lowWalking ? ["Taxi", "Easy subway"] : ["Subway", "Walking"],
    food: [
      /local food|food/.test(text) ? "Local food" : "Flexible",
      ...(text.includes("halal") ? ["Halal"] : []),
      ...(text.includes("vegetarian") ? ["Vegetarian"] : []),
      ...(/not spicy|no spicy|less spicy/.test(text) ? ["Not too spicy"] : []),
    ],
    budget: text.includes("budget")
      ? "Budget"
      : text.includes("premium")
        ? "Premium"
        : "Standard",
  };
}

export function getAgentRoute(destination: string): AgentRouteNode[] {
  return routes[destination] ?? routes.Beijing;
}
