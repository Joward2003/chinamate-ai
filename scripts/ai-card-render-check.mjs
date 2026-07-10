import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3001";
await mkdir("qa/agent-workflow", { recursive: true });

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${baseURL}/help/agent`, { waitUntil: "networkidle" });
const messageInput = page.locator("#agent-message");
await messageInput.click();
await messageInput.pressSequentially(
  "I am at a metro exit gate, but I do not know what QR code to scan and I cannot get out. What should I do?",
  { delay: 2 },
);
await page.waitForFunction(() => {
  const button = Array.from(document.querySelectorAll("button")).find((item) =>
    item.textContent?.includes("Get a Help Card"),
  );
  return button && !button.disabled;
});
await page.getByRole("button", { name: "Get a Help Card" }).click();
await page.getByText("AI-assisted", { exact: true }).waitFor({ timeout: 90_000 });

const heading = await page.locator("h1").last().textContent();
if (!heading || heading.includes("I need local help")) {
  errors.push(`Expected a generated metro card, received: ${heading}`);
}
await page.getByText("Show this in Chinese", { exact: true }).first().waitFor();
await page.getByText("Read aloud", { exact: true }).waitFor();

const dimensions = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  content: document.documentElement.scrollWidth,
}));
if (dimensions.content > dimensions.viewport) {
  errors.push(`Mobile overflow: ${dimensions.content}px > ${dimensions.viewport}px`);
}

await page.screenshot({
  path: "qa/agent-workflow/ai-generated-metro-card-mobile.png",
  fullPage: true,
});
await browser.close();

if (errors.length) {
  console.error("AI Card render check found issues:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`AI-generated card rendered successfully: ${heading}`);
}
