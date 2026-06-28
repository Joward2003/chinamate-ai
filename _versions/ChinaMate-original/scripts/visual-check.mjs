import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const baseURL = "http://127.0.0.1:3000";
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
await desktop.screenshot({ path: `${output}/01-splash-desktop.png`, fullPage: true });

await desktop.getByRole("button", { name: "Explore first" }).click();
await desktop.getByRole("heading", { name: /See China/ }).waitFor();
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: `${output}/02-discover-desktop.png`, fullPage: true });

await desktop.getByRole("button", { name: "My Trip" }).click();
await desktop.getByRole("heading", { name: "Beijing in 2 days." }).waitFor();
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: `${output}/03-itinerary-desktop.png`, fullPage: true });

await desktop.getByRole("button", { name: "Adjust" }).click();
await desktop.getByRole("heading", { name: "Tell us what changed." }).waitFor();
await desktop.waitForTimeout(500);
await desktop.getByRole("button", { name: "I cannot use Alipay." }).click();
await desktop.waitForTimeout(550);
await desktop.screenshot({ path: `${output}/04-assistant-desktop.png`, fullPage: true });

await desktop.getByRole("button", { name: "Friendly Map" }).click();
await desktop.getByRole("heading", { name: "Know before you walk in." }).waitFor();
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: `${output}/05-map-desktop.png`, fullPage: true });

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
await mobile.getByRole("button", { name: "Explore first" }).click();
await mobile.getByRole("heading", { name: /See China/ }).waitFor();
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: `${output}/06-discover-mobile.png`, fullPage: true });

const metrics = await mobile.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  content: document.documentElement.scrollWidth,
}));
if (metrics.content > metrics.viewport) {
  errors.push(
    `Mobile horizontal overflow: content ${metrics.content}px, viewport ${metrics.viewport}px`,
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
