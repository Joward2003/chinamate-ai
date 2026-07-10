import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3002";
await mkdir("qa/agent-workflow", { recursive: true });

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const cases = [
  {
    message: "My Alipay doesn't work and the restaurant does not accept my card.",
    expectedIntent: "payment_failed",
    expectedMode: "approved_card",
    verified: true,
  },
  {
    message: "The QR code menu is all Chinese and I cannot order.",
    expectedIntent: "qr_ordering",
    expectedMode: "approved_card",
    verified: true,
  },
  {
    message:
      "The museum says I need a reservation but I do not have a Chinese phone number.",
    expectedIntent: "attraction_reservation",
    expectedMode: "ai_assisted_card",
    verified: false,
  },
];

for (const testCase of cases) {
  const response = await context.request.post(`${baseURL}/api/agent/help`, {
    data: { message: testCase.message, city: "Shanghai", language: "en" },
  });
  if (!response.ok()) {
    errors.push(`API returned ${response.status()} for ${testCase.expectedIntent}`);
    continue;
  }
  const card = await response.json();
  if (card.intent !== testCase.expectedIntent) {
    errors.push(`Expected ${testCase.expectedIntent}, received ${card.intent}`);
  }
  if (card.renderMode !== testCase.expectedMode) {
    errors.push(`Expected ${testCase.expectedMode}, received ${card.renderMode}`);
  }
  if (card.status.verified !== testCase.verified) {
    errors.push(`Unexpected verified state for ${testCase.expectedIntent}`);
  }
  if (
    testCase.expectedMode === "ai_assisted_card" &&
    !card.status.requiresHumanReview
  ) {
    errors.push("AI-assisted attraction card must require human review");
  }
}

const configResponse = await context.request.get(`${baseURL}/api/config/models`);
const config = await configResponse.json();
if (JSON.stringify(config).includes("apiKey")) {
  errors.push("Model configuration endpoint exposed an API key field");
}
if (config.models?.length !== 5) {
  errors.push("Expected five configured NVIDIA models");
}

await page.goto(`${baseURL}/help/agent`, { waitUntil: "networkidle" });
await page
  .getByLabel("What do you need help with?")
  .fill(cases[0].message);
await page.getByRole("button", { name: "Get a Help Card" }).click();
await page.getByText("Verified", { exact: true }).waitFor();
await page.getByRole("heading", { name: "I cannot pay at a restaurant" }).waitFor();

const dimensions = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  content: document.documentElement.scrollWidth,
}));
if (dimensions.content > dimensions.viewport) {
  errors.push(`Mobile overflow: ${dimensions.content}px > ${dimensions.viewport}px`);
}

await page.screenshot({
  path: "qa/agent-workflow/approved-card-mobile.png",
  fullPage: true,
});
await browser.close();

if (errors.length) {
  console.error("Agent workflow check found issues:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Agent workflow cases and unified renderer passed.");
}
