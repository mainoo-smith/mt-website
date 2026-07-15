import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.INSPECT_URL ?? "http://localhost:3000";
const outDir = path.join(process.cwd(), ".cursor-screenshots");

await fs.mkdir(outDir, { recursive: true });

const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 834, height: 1194 }],
  ["desktop", { width: 1440, height: 1000 }],
];

const states = [
  ["scene-3-connect", 0.34],
  ["scene-4-challenge", 0.52],
];

const browser = await chromium.launch();

for (const [label, viewport] of viewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.waitForFunction(() => typeof window.__mainooSetProgress === "function", {
    timeout: 90000,
  });

  for (const [name, progress] of states) {
    await page.evaluate((p) => window.__mainooSetProgress(p), progress);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, `${name}-${label}.png`) });
  }

  await page.close();
}

await browser.close();
console.log(JSON.stringify({ outDir, viewports: viewports.map(([label]) => label) }, null, 2));
