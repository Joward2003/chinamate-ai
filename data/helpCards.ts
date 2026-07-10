export type HelpCategory = "payment" | "taxi" | "food" | "attraction" | "app";

export type AppAction = {
  label: string;
  type: "copy" | "open" | "guide";
  value: string;
};

export type HelpCard = {
  id: string;
  title: string;
  category: HelpCategory;
  tag: string;
  situation: string;
  steps: string[];
  phrasePreview: string;
  phraseId: string;
  appActions: AppAction[];
  fallback: string[];
  avoid?: string[];
};

export type PhraseCard = {
  id: string;
  targetRole: string;
  phraseCn: string;
  phraseEn: string;
  pinyin?: string;
  relatedCardId?: string;
};

export type HelpMode = "task" | "problem" | "chinese";

export type PickerOption = {
  label: string;
  description: string;
  icon: "payment" | "taxi" | "food" | "metro" | "attraction" | "app" | "person";
  destination: string;
};

export const helpCards: HelpCard[] = [
  {
    id: "payment_failed_restaurant",
    title: "I cannot pay at a restaurant",
    category: "payment",
    tag: "Payment problem",
    situation:
      "Use this when Alipay, WeChat Pay, or your bank card does not work at a restaurant.",
    steps: [
      "Ask if cash or Visa is accepted.",
      "Try one other payment method.",
      "Ask staff for help before leaving the counter.",
    ],
    phrasePreview: "我现在不能使用支付宝。可以用现金、Visa 或其他付款方式吗？",
    phraseId: "payment_restaurant",
    appActions: [
      {
        label: "Copy Chinese phrase",
        type: "copy",
        value: "我现在不能使用支付宝。可以用现金、Visa 或其他付款方式吗？谢谢！",
      },
      { label: "Payment guide", type: "guide", value: "/guide/shanghai-starter#payment" },
    ],
    fallback: [
      "Go to a mall or chain restaurant that accepts international cards.",
      "Ask your hotel front desk to help you pay.",
      "Keep small cash as a backup for your next purchase.",
    ],
    avoid: ["Do not leave your passport or phone with strangers."],
  },
  {
    id: "taxi_driver_called",
    title: "Taxi driver called me",
    category: "taxi",
    tag: "Taxi help",
    situation:
      "Use this when a ride-hailing driver calls and you cannot understand each other.",
    steps: [
      "Do not cancel the ride immediately.",
      "Send the Chinese phrase below in the ride app.",
      "Stand at the exact pickup pin and look for the plate number.",
    ],
    phrasePreview: "您好，我不会说中文。我在定位点等您，请发消息给我。",
    phraseId: "taxi_called",
    appActions: [
      {
        label: "Copy message for driver",
        type: "copy",
        value: "您好，我不会说中文。我在定位点等您，请发消息给我，谢谢！",
      },
      { label: "Open pickup map", type: "open", value: "https://maps.apple.com/" },
    ],
    fallback: [
      "Ask hotel or attraction staff to speak to the driver.",
      "Cancel only after checking the car has not arrived.",
      "Take a taxi from an official taxi queue.",
    ],
    avoid: ["Never get into a car if the plate does not match your booking."],
  },
  {
    id: "qr_ordering",
    title: "Restaurant only has QR ordering",
    category: "food",
    tag: "Food ordering",
    situation:
      "Use this when the menu only opens in a Chinese mini program or requires a local phone number.",
    steps: [
      "Ask for a paper menu or staff ordering.",
      "Point to photos and confirm the quantity.",
      "Mention allergies before the order is submitted.",
    ],
    phrasePreview: "我没有中国手机号，可以请您帮我点餐吗？",
    phraseId: "restaurant_qr",
    appActions: [
      {
        label: "Copy request",
        type: "copy",
        value: "我没有中国手机号，不能扫码点餐。可以请您帮我点餐吗？谢谢！",
      },
      { label: "Food guide", type: "guide", value: "/guide/shanghai-starter#food" },
    ],
    fallback: [
      "Ask another customer to show the menu, then order with staff.",
      "Choose a restaurant with a paper or photo menu.",
      "Ask your hotel to recommend a foreigner-friendly nearby option.",
    ],
    avoid: ["Confirm the price before staff submit the order for you."],
  },
  {
    id: "cannot_find_entrance",
    title: "I cannot find the entrance",
    category: "attraction",
    tag: "Entrance help",
    situation:
      "Use this when the map pin, ticket gate, or visitor entrance is unclear.",
    steps: [
      "Check the Chinese venue name on your ticket.",
      "Show the phrase below to a guard or staff member.",
      "Confirm whether passport verification happens at another gate.",
    ],
    phrasePreview: "请问游客入口在哪里？我有预约和护照。",
    phraseId: "attraction_entrance",
    appActions: [
      {
        label: "Copy entrance request",
        type: "copy",
        value: "请问游客入口在哪里？我有预约和护照。谢谢！",
      },
      { label: "Open map", type: "open", value: "https://maps.apple.com/" },
    ],
    fallback: [
      "Go to the main visitor service center.",
      "Ask a uniformed guard to mark the entrance on your map.",
      "Call the official venue number shown on the ticket.",
    ],
    avoid: ["Do not buy a replacement ticket from an unofficial seller."],
  },
  {
    id: "app_in_chinese",
    title: "The app is in Chinese",
    category: "app",
    tag: "Chinese app",
    situation:
      "Use this when a local app has no English option and you need to finish one task.",
    steps: [
      "Take a screenshot before changing anything.",
      "Use your phone’s image translation on the screenshot.",
      "Ask staff to point to the next button without handing over passwords.",
    ],
    phrasePreview: "这个应用只有中文，可以告诉我下一步点哪里吗？",
    phraseId: "app_help",
    appActions: [
      {
        label: "Copy help request",
        type: "copy",
        value: "这个应用只有中文，可以告诉我下一步点哪里吗？请不要修改我的账户信息，谢谢！",
      },
      { label: "App guide", type: "guide", value: "/guide/shanghai-starter#apps" },
    ],
    fallback: [
      "Use the service’s website or international version.",
      "Ask hotel staff to explain the steps.",
      "Use an in-person counter instead of the app.",
    ],
    avoid: ["Never share a verification code, PIN, or banking password."],
  },
];

export const phraseCards: PhraseCard[] = [
  {
    id: "payment_restaurant",
    targetRole: "For restaurant staff",
    phraseCn: "我现在不能使用支付宝。\n可以用现金、Visa\n或其他付款方式吗？\n谢谢！",
    phraseEn:
      "I cannot use Alipay now. Can I pay with cash, Visa, or another method?",
    pinyin: "Wǒ xiànzài bùnéng shǐyòng Zhīfùbǎo.",
    relatedCardId: "payment_failed_restaurant",
  },
  {
    id: "taxi_called",
    targetRole: "For taxi driver",
    phraseCn: "您好，我不会说中文。\n我在定位点等您。\n请发消息给我，谢谢！",
    phraseEn:
      "Hello, I do not speak Chinese. I am waiting at the pickup pin. Please message me.",
    relatedCardId: "taxi_driver_called",
  },
  {
    id: "restaurant_qr",
    targetRole: "For restaurant staff",
    phraseCn: "我没有中国手机号，\n不能扫码点餐。\n可以请您帮我点餐吗？\n谢谢！",
    phraseEn:
      "I do not have a Chinese phone number and cannot order by QR code. Could you help me order?",
    relatedCardId: "qr_ordering",
  },
  {
    id: "attraction_entrance",
    targetRole: "For attraction staff",
    phraseCn: "请问游客入口在哪里？\n我有预约和护照。\n谢谢！",
    phraseEn:
      "Where is the visitor entrance? I have a reservation and my passport.",
    relatedCardId: "cannot_find_entrance",
  },
  {
    id: "app_help",
    targetRole: "For a local person nearby",
    phraseCn: "这个应用只有中文。\n可以告诉我下一步\n点哪里吗？谢谢！",
    phraseEn: "This app is only in Chinese. Can you show me what to tap next?",
    relatedCardId: "app_in_chinese",
  },
  {
    id: "hotel_help",
    targetRole: "For hotel front desk",
    phraseCn: "您好，我需要帮助。\n可以请您帮我联系司机\n或确认这个地址吗？",
    phraseEn: "Hello, I need help. Could you contact my driver or confirm this address?",
  },
  {
    id: "metro_help",
    targetRole: "For metro staff",
    phraseCn: "您好，请问去这里\n应该坐哪条地铁线？\n在哪里换乘？",
    phraseEn: "Which metro line should I take to get here, and where do I transfer?",
  },
];

export const pickerContent: Record<
  HelpMode,
  { title: string; subtitle: string; options: PickerOption[] }
> = {
  task: {
    title: "I need to do something",
    subtitle: "What are you trying to do?",
    options: [
      { label: "Pay in China", description: "Cards, cash and mobile payment", icon: "payment", destination: "/card/payment_failed_restaurant" },
      { label: "Take a taxi", description: "Pickup, driver and destination help", icon: "taxi", destination: "/card/taxi_driver_called" },
      { label: "Order food", description: "Menus, QR ordering and dietary needs", icon: "food", destination: "/card/qr_ordering" },
      { label: "Use metro", description: "Ask staff for the right line", icon: "metro", destination: "/phrase/metro_help" },
      { label: "Visit an attraction", description: "Tickets, passport and entrances", icon: "attraction", destination: "/card/cannot_find_entrance" },
      { label: "Use a Chinese app", description: "Translate and finish one task", icon: "app", destination: "/card/app_in_chinese" },
    ],
  },
  problem: {
    title: "Something went wrong",
    subtitle: "What’s the problem?",
    options: [
      { label: "I cannot pay", description: "Payment was declined or unavailable", icon: "payment", destination: "/card/payment_failed_restaurant" },
      { label: "Taxi driver called me", description: "You cannot understand the call", icon: "taxi", destination: "/card/taxi_driver_called" },
      { label: "I cannot find the entrance", description: "The map pin or gate is unclear", icon: "attraction", destination: "/card/cannot_find_entrance" },
      { label: "The app is in Chinese", description: "You cannot find the next step", icon: "app", destination: "/card/app_in_chinese" },
      { label: "Restaurant only has QR ordering", description: "The mini program does not work", icon: "food", destination: "/card/qr_ordering" },
      { label: "Staff do not understand me", description: "Show a clear Chinese message", icon: "person", destination: "/phrase/app_help" },
      { label: "Other problem", description: "Start with a general help phrase", icon: "person", destination: "/phrase/hotel_help" },
    ],
  },
  chinese: {
    title: "Show this in Chinese",
    subtitle: "Who do you need to talk to?",
    options: [
      { label: "Taxi driver", description: "Pickup and message request", icon: "taxi", destination: "/phrase/taxi_called" },
      { label: "Restaurant staff", description: "Payment and ordering help", icon: "food", destination: "/phrase/payment_restaurant" },
      { label: "Attraction staff", description: "Find the correct entrance", icon: "attraction", destination: "/phrase/attraction_entrance" },
      { label: "Hotel front desk", description: "Ask for local assistance", icon: "person", destination: "/phrase/hotel_help" },
      { label: "Metro staff", description: "Line and transfer help", icon: "metro", destination: "/phrase/metro_help" },
      { label: "A local person nearby", description: "Ask where to tap in an app", icon: "app", destination: "/phrase/app_help" },
    ],
  },
};

export const getHelpCard = (id: string) => helpCards.find((card) => card.id === id);
export const getPhraseCard = (id: string) => phraseCards.find((card) => card.id === id);
