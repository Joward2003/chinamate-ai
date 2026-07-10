import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL ?? "http://localhost:3001";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(`${baseURL}/saved`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  localStorage.setItem(
    "chinamate-saved",
    JSON.stringify(["payment_failed_restaurant"]),
  );
  localStorage.setItem(
    "chinamate-unified-saved",
    JSON.stringify([
      {
        cardId: "ai-passport-test",
        renderMode: "ai_assisted_card",
        title: "I lost my passport",
        category: "other",
        intent: "passport_lost",
        status: {
          verified: false,
          sourceType: "ai_generated_with_sources",
          confidence: 0.6,
          sourceCoverage: "partial",
          requiresHumanReview: true,
        },
        content: {
          situation: "Use this when your passport is missing.",
          steps: ["Report the loss to police.", "Contact your consulate."],
          fallback: ["Ask hotel staff for help."],
        },
        actions: [],
        references: [],
        suggestedQuestions: [],
        metadata: {
          language: "en",
          generatedAt: new Date().toISOString(),
          toolsUsed: [],
        },
      },
    ]),
  );
});
await page.reload({ waitUntil: "networkidle" });

await page.getByText("I lost my passport", { exact: true }).waitFor();
await page.getByText("I cannot pay at a restaurant", { exact: true }).waitFor();
await page.getByText("I lost my passport", { exact: true }).click();
await page.getByRole("heading", { name: "I lost my passport" }).waitFor();
await page.getByText("Saved cards", { exact: true }).first().waitFor();

await browser.close();
console.log("Approved and AI-generated saved cards both render and reopen.");
