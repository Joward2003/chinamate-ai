import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3001";
const output = "qa";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

const errors = [];
const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
desktop.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
desktop.on("pageerror", (error) => errors.push(error.message));
desktop.on("response", (response) => {
  if (response.status() >= 400) {
    errors.push(`${response.status()} ${response.url()}`);
  }
});

await desktop.goto(baseURL, { waitUntil: "networkidle" });
await desktop.getByRole("heading", { name: /Your AI travel companion/ }).waitFor();
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: `${output}/01-agent-fullscreen.png`, fullPage: true });
const desktopShellWidth = await desktop
  .getByRole("heading", { name: /Your AI travel companion/ })
  .evaluate((element) => element.closest(".max-w-\\[430px\\]")?.clientWidth ?? 0);
if (desktopShellWidth > 430 || desktopShellWidth === 0) {
  errors.push(`Fullscreen mobile shell width is ${desktopShellWidth}px`);
}

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
});
mobile.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
mobile.on("pageerror", (error) => errors.push(error.message));
mobile.on("response", (response) => {
  if (response.status() >= 400) {
    errors.push(`${response.status()} ${response.url()}`);
  }
});
await mobile.goto(baseURL, { waitUntil: "networkidle" });
await mobile.getByRole("heading", { name: /Your AI travel companion/ }).waitFor();
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: `${output}/06-agent-input-mobile.png`, fullPage: true });

await mobile
  .getByRole("button", { name: "2 days in Beijing with elderly parents" })
  .click();
await mobile.getByRole("button", { name: "Plan my trip" }).click();
await mobile.getByRole("heading", { name: "Here’s what I heard." }).waitFor();
await mobile.screenshot({ path: `${output}/07-agent-summary-mobile.png`, fullPage: true });

await mobile.getByRole("button", { name: "Build my route" }).click();
await mobile.getByRole("heading", { name: /A relaxed Beijing route/ }).waitFor();
await mobile.getByRole("button", { name: "Last-mile tips" }).first().click();
await mobile.screenshot({ path: `${output}/08-agent-route-mobile.png`, fullPage: true });

await mobile.getByRole("button", { name: "Too much walking" }).click();
await mobile.getByText(/Adjusted: reducing walking/).waitFor();
await mobile.screenshot({ path: `${output}/09-agent-adjusted-mobile.png`, fullPage: true });

await mobile.getByRole("button", { name: "Get local help" }).click();
await mobile.getByRole("heading", { name: /Help for the parts/ }).waitFor();
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: `${output}/10-local-help-mobile.png`, fullPage: true });

await mobile.getByRole("button", { name: "Go back" }).click();
await mobile.getByRole("button", { name: /Follow Tom’s 7-day China story/ }).click();
await mobile.getByRole("heading", { name: /Tom's 7 days/ }).waitFor();
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: `${output}/11-tom-story-day0-mobile.png`, fullPage: true });

await mobile.getByRole("button", { name: /Day 2/ }).click();
await mobile.getByRole("heading", { name: /useful next step/ }).waitFor();
await mobile.getByRole("button", { name: /B · Oat-milk coffee/ }).click();
await mobile.getByText(/Dinner moved to 18:30/).waitFor();
await mobile.screenshot({ path: `${output}/12-tom-story-day2-mobile.png`, fullPage: true });

await mobile.getByRole("button", { name: /Day 6/ }).click();
await mobile.getByRole("button", { name: "Submit helpful note" }).click();
await mobile.getByText(/Badge earned/).waitFor();

await mobile.getByRole("button", { name: /Day 7/ }).click();
await mobile.getByRole("button", { name: "Generate share preview" }).click();
await mobile.getByText("Share preview ready").waitFor();
await mobile.screenshot({ path: `${output}/13-tom-story-day7-mobile.png`, fullPage: true });

await mobile.getByRole("button", { name: "Share", exact: true }).click();
await mobile.getByRole("heading", { name: /Your China story/ }).waitFor();
await mobile.getByRole("button", { name: "Generate recap card" }).click();
await mobile.getByRole("button", { name: "Instagram" }).click();
await mobile.getByText("Instagram ready").waitFor();
await mobile.screenshot({ path: `${output}/14-share-recap-mobile.png`, fullPage: true });

const metrics = await mobile.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  content: document.documentElement.scrollWidth,
  offenders: Array.from(document.querySelectorAll("*"))
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        className: element.className,
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      };
    })
    .filter((item) => item.right > document.documentElement.clientWidth + 1)
    .slice(0, 8),
}));
if (metrics.content > metrics.viewport) {
  errors.push(
    `Mobile horizontal overflow: content ${metrics.content}px, viewport ${metrics.viewport}px; offenders ${JSON.stringify(metrics.offenders)}`,
  );
}

await browser.close();

if (errors.length) {
  console.error("Visual check found issues:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Visual check passed with no console errors or mobile overflow.");
}
