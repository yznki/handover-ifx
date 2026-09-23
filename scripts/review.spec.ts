import { expect, test } from "@playwright/test";

const reviewDirectory = "C:\\Users\\Kiswani\\.copilot\\session-state\\0c59e435-9e11-4684-995a-a38f3769eb8d\\files\\review";
const storyFrameCount = 12;
const pages = [
  { name: "home", path: "/" },
  { name: "docs", path: "/docs/aida-architecture" },
  { name: "checklist", path: "/checklist" }
];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 }
];

test("generated site renders without console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const targetPage of pages) {
      await page.goto(`http://127.0.0.1:4173${targetPage.path}`, { waitUntil: "networkidle" });
      await expect(page.locator("body")).toBeVisible();
      await page.screenshot({ path: `${reviewDirectory}\\${targetPage.name}-${viewport.name}.png`, fullPage: true });
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("story scroll positions look stable", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${reviewDirectory}\\story-01.png`, fullPage: false });

  const beatCount = await page.locator("[data-beat]").count();
  const beatScreenshots = Array.from({ length: storyFrameCount - 1 }, (_, storyFrameIndex) => {
    const beatIndex = Math.round((storyFrameIndex / (storyFrameCount - 2)) * (beatCount - 1));
    return { beatIndex, storyFrameNumber: storyFrameIndex + 2 };
  });

  for (const beatScreenshot of beatScreenshots) {
    await page.locator("[data-beat]").nth(beatScreenshot.beatIndex).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${reviewDirectory}\\story-${String(beatScreenshot.storyFrameNumber).padStart(2, "0")}.png`, fullPage: false });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${reviewDirectory}\\story-mobile.png`, fullPage: true });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${reviewDirectory}\\story-reduced-motion.png`, fullPage: false });

  expect(consoleErrors).toEqual([]);
});
