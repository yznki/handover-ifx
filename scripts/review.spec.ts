import { expect, test, type Page } from "@playwright/test";

const reviewDirectory = "C:\\Users\\Kiswani\\.copilot\\session-state\\0c59e435-9e11-4684-995a-a38f3769eb8d\\files\\review";
const pages = [
  { name: "home", path: "/" },
  { name: "docs", path: "/docs/aida-architecture" },
  { name: "checklist", path: "/checklist" }
];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 }
];

/**
 * Waits for local page fonts and animation frames to settle before screenshots.
 * @param page - Playwright page.
 * @param delayMilliseconds - Extra render wait after fonts are ready.
 */
async function waitForSettledLocalRendering(page: Page, delayMilliseconds = 1_000): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForFunction(() => Array.from(document.querySelectorAll("canvas")).every((canvas) => canvas.width > 0 || canvas.height > 0));
  await page.waitForTimeout(delayMilliseconds);
}

/**
 * Captures a viewport screenshot after scrolling to a vertical position.
 * @param page - Playwright page.
 * @param screenshotName - Screenshot file name.
 * @param scrollTop - Window scroll top.
 */
async function captureMemeViewport(page: Page, screenshotName: string, scrollTop: number): Promise<void> {
  await page.evaluate((nextScrollTop) => window.scrollTo({ top: nextScrollTop, left: 0, behavior: "instant" }), scrollTop);
  await waitForSettledLocalRendering(page, 1_200);
  await page.screenshot({ path: `${reviewDirectory}\\${screenshotName}.png`, fullPage: false });
}

/**
 * Captures a viewport screenshot after scrolling to a percentage of the page.
 * @param page - Playwright page.
 * @param screenshotName - Screenshot file name.
 * @param scrollRatio - Position between the top and bottom of the page.
 */
async function captureMemeViewportAtRatio(page: Page, screenshotName: string, scrollRatio: number): Promise<void> {
  const scrollTop = await page.evaluate((nextScrollRatio) => {
    const maximumScrollTop = document.documentElement.scrollHeight - window.innerHeight;

    return Math.max(0, Math.round(maximumScrollTop * nextScrollRatio));
  }, scrollRatio);
  await captureMemeViewport(page, screenshotName, scrollTop);
}

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
      await waitForSettledLocalRendering(page);
      await page.screenshot({ path: `${reviewDirectory}\\${targetPage.name}-${viewport.name}.png`, fullPage: true });
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("meme wall renders and interactions work", async ({ page }) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await waitForSettledLocalRendering(page, 2_000);
  await expect(page.locator("[data-meme-wall]")).toBeVisible();
  await captureMemeViewport(page, "meme-desktop-01-hero", 0);
  await captureMemeViewportAtRatio(page, "meme-desktop-02-grid", 0.22);
  await captureMemeViewportAtRatio(page, "meme-desktop-03-middle", 0.45);
  await captureMemeViewportAtRatio(page, "meme-desktop-04-late", 0.7);
  await captureMemeViewportAtRatio(page, "meme-desktop-05-final", 1);

  await page.locator("[data-shuffle-memes]").click();
  await page.locator("[data-meme-of-day]").click();
  await page.locator("[data-meme-card]").first().getByRole("button", { name: /Laugh at/ }).click();
  await page.getByRole("button", { name: "Reveal punchline" }).first().click();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\meme-desktop-interactions.png`, fullPage: false });

  await page.locator("[data-accept-handover]").scrollIntoViewIfNeeded();
  await page.locator("[data-accept-handover]").click();
  await page.waitForURL("**/checklist", { timeout: 3_000 });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await waitForSettledLocalRendering(page, 2_000);
  await captureMemeViewport(page, "meme-mobile-01-hero", 0);
  await captureMemeViewportAtRatio(page, "meme-mobile-02-grid", 0.22);
  await captureMemeViewportAtRatio(page, "meme-mobile-03-middle", 0.45);
  await captureMemeViewportAtRatio(page, "meme-mobile-04-late", 0.7);
  await captureMemeViewportAtRatio(page, "meme-mobile-05-final", 1);
  await page.locator("[data-meme-card]").first().getByRole("button", { name: /Laugh at/ }).click();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\meme-mobile-interactions.png`, fullPage: false });

  expect(consoleErrors).toEqual([]);
});
