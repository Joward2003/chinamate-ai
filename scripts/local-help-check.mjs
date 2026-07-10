import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3001";
const output = "qa/local-help";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
});
await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
const page = await context.newPage();
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
});

const checkOverflow = async (label) => {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  if (metrics.content > metrics.viewport) {
    errors.push(`${label} horizontal overflow: ${metrics.content}px > ${metrics.viewport}px`);
  }
};

await page.goto(baseURL, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /What do you need help with/ }).waitFor();
await checkOverflow("Home");
await page.screenshot({ path: `${output}/01-home-mobile.png`, fullPage: true });

await page.getByText("Something went wrong", { exact: true }).click();
await page.getByRole("heading", { name: "Something went wrong" }).waitFor();
await page.getByText("I cannot pay", { exact: true }).click();
await page.getByRole("heading", { name: "I cannot pay at a restaurant" }).waitFor();
await checkOverflow("Help Card");
await page.screenshot({ path: `${output}/02-payment-card-mobile.png`, fullPage: true });

await page.locator('a[href="/phrase/payment_restaurant"]').click();
await page.getByRole("heading", { name: "For restaurant staff" }).waitFor();
await page.getByRole("button", { name: "Copy text" }).click();
const clipboard = await page.evaluate(() => navigator.clipboard.readText());
if (!clipboard.includes("支付宝")) errors.push("Chinese phrase was not copied to the clipboard");
await page.getByRole("link", { name: "Back" }).first().click();
await page.getByRole("heading", { name: "I cannot pay at a restaurant" }).waitFor();
await page.getByRole("button", { name: "Still stuck" }).click();
await page.getByRole("button", { name: "Payment still failed" }).click();
await page.getByLabel("Tell us more optional").fill("Test feedback");
await page.getByRole("button", { name: "Submit feedback" }).click();
await page.getByText("Thanks. We’ll use this to improve the card.").waitFor();
const storedFeedback = await page.evaluate(() => localStorage.getItem("chinamate-feedback"));
if (!storedFeedback?.includes("Payment still failed")) errors.push("Feedback was not saved");

await page.goto(`${baseURL}/help/problem`, { waitUntil: "networkidle" });
await page.getByText("Taxi driver called me", { exact: true }).click();
await page.getByRole("heading", { name: "Taxi driver called me" }).waitFor();
await page.locator('a[href="/phrase/taxi_called"]').click();
await page.getByRole("heading", { name: "For taxi driver" }).waitFor();

await page.goto(`${baseURL}/help/chinese`, { waitUntil: "networkidle" });
await page.getByText("Restaurant staff", { exact: true }).click();
await page.getByRole("heading", { name: "For restaurant staff" }).waitFor();
await page.getByRole("button", { name: "Bigger text" }).click();
await checkOverflow("Chinese Show Card");
await page.screenshot({ path: `${output}/03-chinese-card-mobile.png`, fullPage: true });

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
desktop.on("pageerror", (error) => errors.push(error.message));
await desktop.goto(baseURL, { waitUntil: "networkidle" });
await desktop.screenshot({ path: `${output}/04-home-desktop.png`, fullPage: true });
await desktop.close();

await browser.close();

if (errors.length) {
  console.error("Local Help check found issues:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Local Help flows passed with no console errors or mobile overflow.");
}
