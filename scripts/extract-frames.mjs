import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const videoUrl = process.env.VIDEO_URL ?? "file:///D:/Downloads/14.07.2026_16.38.32_REC.mp4";
const outDir = path.join(process.cwd(), ".cursor-screenshots", "framework-video");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const html = `<!doctype html><html><body style="margin:0;background:#000">
<video id="v" src="${videoUrl}" muted playsinline style="width:100%;height:100vh;object-fit:contain"></video>
</body></html>`;
await page.setContent(html);

await page.waitForFunction(() => {
  const v = document.getElementById("v");
  return v && v.readyState >= 1 && v.duration && isFinite(v.duration);
}, { timeout: 30000 });

const duration = await page.evaluate(() => document.getElementById("v").duration);
console.log("duration", duration);

const fractions = [0.05, 0.25, 0.45, 0.65, 0.85, 0.98];
const results = [];
for (let i = 0; i < fractions.length; i++) {
  const t = Math.max(0, Math.min(duration - 0.05, duration * fractions[i]));
  await page.evaluate(
    (time) =>
      new Promise((resolve) => {
        const v = document.getElementById("v");
        const onSeek = () => {
          v.removeEventListener("seeked", onSeek);
          resolve();
        };
        v.addEventListener("seeked", onSeek);
        v.currentTime = time;
      }),
    t,
  );
  await page.waitForTimeout(400);
  const file = path.join(outDir, `frame-${i}-${fractions[i]}.png`);
  await page.screenshot({ path: file });
  results.push({ t: t.toFixed(2), file });
}

console.log(JSON.stringify({ outDir, duration, results }, null, 2));
await browser.close();
