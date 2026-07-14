import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.INSPECT_URL ?? "http://localhost:3000";
const outDir = path.join(process.cwd(), ".cursor-screenshots");

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") browserErrors.push(message.text());
});

await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(3500);
await page.waitForFunction(() => typeof window.__mainooSetProgress === "function", {
  timeout: 90000,
});

const states = [
  ["scene-2-isolation", 0.19],
  ["scene-3-connect", 0.34],
  ["scene-4-challenge", 0.52],
  ["scene-5-platform", 0.66],
  ["scene-6-framework", 0.84],
];

const readings = [];

for (const [name, progress] of states) {
  await page.evaluate((p) => window.__mainooSetProgress(p), progress);
  await page.waitForTimeout(1200);
  const actual = await page.evaluate(() => window.__mainooProgress ?? null);
  const chapter = await page
    .locator("text=/SCENE|THE CHALLENGE|THE PLATFORM|THE FRAMEWORK/i")
    .first()
    .textContent()
    .catch(() => null);
  readings.push({ name, requested: progress, actual, chapter });
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
}

console.log(JSON.stringify({ outDir, readings, browserErrors }, null, 2));
await browser.close();
