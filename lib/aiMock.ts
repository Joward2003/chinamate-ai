import type { AssistantResponse } from "@/types";

const responses: Record<string, AssistantResponse> = {
  "It is raining today.": {
    title: "Move the wall to tomorrow",
    summary:
      "Rain makes the Mutianyu toboggan unreliable. Today works better as an indoor imperial-history route.",
    changed: ["Great Wall moved to Day 2", "Taxi leg removed", "Indoor stops added"],
    mainPlan: {
      title: "National Museum → Qianmen food lane",
      timing: "10:30–17:30",
      note: "Mostly indoors, one direct metro line, Visa-friendly lunch selected.",
    },
    backupPlan: {
      title: "Capital Museum → hotel tea room",
      timing: "11:00–16:00",
      note: "Lower walking load if rain becomes heavy.",
    },
    skip: "Skip the Great Wall and outdoor hutong walk today.",
    bridgeTip: "Keep your passport with you; the museum checks the original document.",
    transportTip: "Use Metro Line 1. Avoid taxis at 17:00 when rain slows traffic.",
    paymentTip: "Museum is free; the selected Qianmen restaurant accepts Visa.",
  },
  "I woke up late.": {
    title: "Keep the highlights, remove the rush",
    summary:
      "A 10:45 start is too late for the original Forbidden City slot, so the route now begins north of the palace.",
    changed: ["Timed-entry stop replaced", "Lunch moved later", "One taxi added"],
    mainPlan: {
      title: "Jingshan Park → Shichahai → Peking duck",
      timing: "11:30–19:30",
      note: "You still get the imperial skyline and a local neighborhood walk.",
    },
    backupPlan: {
      title: "Lama Temple → Wudaoying Hutong",
      timing: "12:00–18:30",
      note: "Simpler metro route with flexible entry.",
    },
    skip: "Skip the Forbidden City today; do not buy a same-day unofficial ticket.",
    bridgeTip: "Show the taxi driver the Chinese entrance name, not only “Jingshan.”",
    transportTip: "Taxi to Jingshan East Gate, then walk downhill toward Shichahai.",
    paymentTip: "Buy the park ticket with cash if your Visa is declined.",
  },
  "I feel tired.": {
    title: "Cut 6,000 steps and keep the day worthwhile",
    summary:
      "The route now uses two short visits, a long seated lunch and a direct ride back to your hotel.",
    changed: ["Walking reduced", "Rest added", "Evening stop removed"],
    mainPlan: {
      title: "Temple of Heaven east gate → seated lunch",
      timing: "10:30–15:30",
      note: "Flat route, benches available, taxi at both ends.",
    },
    backupPlan: {
      title: "Hotel rest → evening acrobatics show",
      timing: "14:00–20:00",
      note: "Almost no walking; ticket can be paid with Visa online.",
    },
    skip: "Skip the full hutong loop and night market.",
    bridgeTip: "Ask the hotel desk to write your return address in Chinese.",
    transportTip: "Use a ride-hailing car instead of changing metro lines.",
    paymentTip: "The selected lunch venue and theatre both accept Visa.",
  },
  "I want less walking.": {
    title: "Switch to point-to-point Beijing",
    summary:
      "The new route caps continuous walking at 25 minutes and uses accessible entrances.",
    changed: ["Private car suggested", "East gates selected", "Hutong loop shortened"],
    mainPlan: {
      title: "Great Wall cable car return → scenic lunch",
      timing: "08:00–15:30",
      note: "Use the enclosed cable car both ways; skip the tower-to-tower hike.",
    },
    backupPlan: {
      title: "Summer Palace boat route",
      timing: "09:30–15:00",
      note: "Boat and shuttle replace the longest walking sections.",
    },
    skip: "Skip the toboggan queue and steep Tower 14 section.",
    bridgeTip: "“Less walking” can be shown as 少走路，谢谢.",
    transportTip: "Pre-book a car; ride-hailing pickup at Mutianyu can be unreliable.",
    paymentTip: "Prepay transport with Visa; bring ¥200 cash at the attraction.",
  },
  "I missed my reservation.": {
    title: "Do not queue for a ticket that is not available",
    summary:
      "The replacement route keeps the same history theme without relying on a timed slot.",
    changed: ["Reservation-only stop removed", "Walk-in sites selected"],
    mainPlan: {
      title: "Jingshan panorama → Drum Tower → hutongs",
      timing: "10:00–17:00",
      note: "No advance booking and the route stays in one compact area.",
    },
    backupPlan: {
      title: "National Museum standby check → Qianmen",
      timing: "10:30–17:30",
      note: "Use only if an official same-day slot appears.",
    },
    skip: "Skip unofficial ticket resellers near the gate.",
    bridgeTip: "Only use the attraction’s official mini-program or verified booking partner.",
    transportTip: "Metro to Shichahai; the final walk is under 12 minutes.",
    paymentTip: "Keep ¥100 cash for small courtyard cafés.",
  },
  "I want vegetarian food nearby.": {
    title: "A real vegetarian meal, 12 minutes away",
    summary:
      "The closest reliable option has a bilingual menu and avoids hidden meat stock.",
    changed: ["Lunch venue changed", "Food note added in Chinese"],
    mainPlan: {
      title: "Vege Tiger, Dongsi",
      timing: "Go now · 12 min by taxi",
      note: "Fully vegetarian buffet; bilingual labeling.",
    },
    backupPlan: {
      title: "King’s Joy takeaway counter",
      timing: "18 min by metro",
      note: "Higher price, excellent allergy communication.",
    },
    skip: "Skip noodle shops unless the broth is confirmed vegetarian.",
    bridgeTip: "Show: 我吃素，不要肉，也不要肉汤。",
    transportTip: "Taxi is faster; show the Chinese address card.",
    paymentTip: "Main option accepts Visa. Keep ¥100 cash for the backup.",
  },
  "I need to catch a flight tonight.": {
    title: "Protect a 3-hour airport buffer",
    summary:
      "Leave central Beijing by 17:20 for a 21:30 Capital Airport departure.",
    changed: ["Evening dinner removed", "Airport transfer locked", "Luggage stop added"],
    mainPlan: {
      title: "Early duck lunch → hotel luggage → airport",
      timing: "13:00–18:30",
      note: "Car pickup at 17:20, estimated arrival 18:30.",
    },
    backupPlan: {
      title: "Airport Express from Dongzhimen",
      timing: "Board by 17:35",
      note: "Use if road ETA rises above 85 minutes.",
    },
    skip: "Skip the hutong walk and any stop north of Shichahai.",
    bridgeTip: "Have your terminal number in Chinese and English.",
    transportTip: "Recheck PEK vs PKX before departure; they are far apart.",
    paymentTip: "Prepay the car by Visa; Airport Express ticket counters accept cash.",
  },
  "This place is too crowded.": {
    title: "Leave the crowd; keep the same story",
    summary:
      "The nearby alternative gives you historic lanes without the main commercial street.",
    changed: ["Busy core removed", "Quieter east loop selected"],
    mainPlan: {
      title: "Baitasi lanes → Lu Xun Museum",
      timing: "14:00–17:30",
      note: "Local neighborhood, cafés and a small museum.",
    },
    backupPlan: {
      title: "Guozijian Street",
      timing: "25 min by taxi",
      note: "Broader street and easier pickup points.",
    },
    skip: "Skip the central Houhai bar street until after 21:00.",
    bridgeTip: "Small museums may require passport registration at the desk.",
    transportTip: "Walk 300 m away from the crowd before requesting a taxi.",
    paymentTip: "Independent cafés may not accept Visa; carry ¥100 cash.",
  },
  "I cannot use Alipay.": {
    title: "Switch to a Visa-first route",
    summary:
      "The next three stops are verified for card payment, with cash fallbacks for transport.",
    changed: ["Small vendors removed", "Chain venues selected", "Cash ATM added"],
    mainPlan: {
      title: "Museum → hotel lunch → mall-based dinner",
      timing: "Now–20:00",
      note: "All primary venues accept Visa at staffed counters.",
    },
    backupPlan: {
      title: "Hotel-assisted cash route",
      timing: "15 min setup",
      note: "Ask the front desk to call a taxi and break a ¥100 note.",
    },
    skip: "Skip unattended kiosks, bike rentals and street-food stalls today.",
    bridgeTip: "Show: 我不能用支付宝，可以刷Visa卡吗？",
    transportTip: "Use the hotel concierge for taxis if your ride app is not working.",
    paymentTip: "Withdraw ¥500 from a major-bank ATM; decline dynamic currency conversion.",
  },
};

export function getAssistantResponse(prompt: string): AssistantResponse {
  return responses[prompt] ?? responses["I cannot use Alipay."];
}
