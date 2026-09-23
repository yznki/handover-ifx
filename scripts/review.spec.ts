import { expect, test, type Locator, type Page } from "@playwright/test";

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
async function waitForSettledLocalRendering(page: Page, delayMilliseconds = 1_500): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForFunction(() => Array.from(document.querySelectorAll("canvas")).every((canvas) => {
    const renderingContext = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return Boolean(renderingContext) || canvas.width > 0;
  }));
  await page.waitForTimeout(delayMilliseconds);
}

/**
 * Scrolls to a story screen and waits for animations to settle.
 * @param page - Playwright page.
 * @param screenIndex - Screen index.
 * @returns The story screen locator.
 */
async function scrollToStoryScreen(page: Page, screenIndex: number): Promise<Locator> {
  const screenLocator = page.locator("[data-story-screen]").nth(screenIndex);
  await screenLocator.evaluate((element) => element.scrollIntoView({ block: "start", inline: "nearest" }));
  await waitForSettledLocalRendering(page);
  return screenLocator;
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

test("story trailer screens and toys work", async ({ page }) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await waitForSettledLocalRendering(page, 2_000);

  const screenCount = await page.locator("[data-story-screen]").count();
  for (const screenIndex of Array.from({ length: screenCount }, (_unusedValue, currentIndex) => currentIndex)) {
    await scrollToStoryScreen(page, screenIndex);
    await page.screenshot({ path: `${reviewDirectory}\\story-${String(screenIndex + 1).padStart(2, "0")}.png`, fullPage: false });
  }

  await page.locator("[data-press-start]").click();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\story-interaction-hero-start.png`, fullPage: false });

  const quizScreen = await scrollToStoryScreen(page, 1);
  await quizScreen.getByRole("button", { name: "Fix upstream in CVC" }).click();
  await quizScreen.getByRole("button", { name: "Ship quick, imperfect, then clean" }).click();
  await quizScreen.getByRole("button", { name: "Whoever makes more sense wins" }).click();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\story-interaction-quiz.png`, fullPage: false });

  const redFlagsScreen = await scrollToStoryScreen(page, 2);
  const redFlagButtons = redFlagsScreen.locator("[data-toy='red-flags'] button");
  const redFlagCount = await redFlagButtons.count();
  for (const redFlagIndex of Array.from({ length: redFlagCount }, (_unusedValue, currentIndex) => currentIndex)) {
    await redFlagButtons.nth(redFlagIndex).click();
  }
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\story-interaction-red-flags.png`, fullPage: false });

  const mapScreen = await scrollToStoryScreen(page, 3);
  const cvcNode = mapScreen.getByRole("button", { name: "CVC" });
  await cvcNode.dragTo(mapScreen.locator("[data-repository-map]"), { targetPosition: { x: 680, y: 260 } });
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\story-interaction-map.png`, fullPage: false });

  const aidaScreen = await scrollToStoryScreen(page, 4);
  await aidaScreen.locator("[data-csv-file]").dragTo(aidaScreen.locator("[data-drop-zone]"));
  await aidaScreen.locator("[data-drop-zone]").click();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\story-interaction-aida-drop.png`, fullPage: false });

  const pipelineScreen = await scrollToStoryScreen(page, 5);
  await pipelineScreen.getByRole("button", { name: "master stable" }).click();
  await pipelineScreen.locator("[data-git-push]").click();
  await expect(pipelineScreen.getByText("deploy reached oc deploy")).toBeVisible({ timeout: 5_000 });
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\story-interaction-pipeline.png`, fullPage: false });

  const cvcScreen = await scrollToStoryScreen(page, 6);
  await cvcScreen.locator("[data-monolith-block]").click();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\story-interaction-cvc-split.png`, fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await waitForSettledLocalRendering(page, 2_000);
  const mobileScreenCount = await page.locator("[data-story-screen]").count();
  for (const screenIndex of Array.from({ length: mobileScreenCount }, (_unusedValue, currentIndex) => currentIndex)) {
    await scrollToStoryScreen(page, screenIndex);
    await page.screenshot({ path: `${reviewDirectory}\\story-mobile-${String(screenIndex + 1).padStart(2, "0")}.png`, fullPage: false });
  }
  await page.screenshot({ path: `${reviewDirectory}\\story-mobile.png`, fullPage: true });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await scrollToStoryScreen(page, 4);
  await page.screenshot({ path: `${reviewDirectory}\\story-reduced-motion.png`, fullPage: false });

  expect(consoleErrors).toEqual([]);
});
