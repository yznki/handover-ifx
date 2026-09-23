import { expect, test, type Page } from "@playwright/test";

const reviewDirectory = "C:\\Users\\Kiswani\\.copilot\\session-state\\0c59e435-9e11-4684-995a-a38f3769eb8d\\files\\review";
const pages = [
  { name: "home", path: "/" },
  { name: "explore-index", path: "/docs" },
  { name: "explore-aida-architecture", path: "/docs/aida-architecture" },
  { name: "explore-cvc", path: "/docs/cvc-now-and-next" },
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
  await page.waitForTimeout(delayMilliseconds);
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

test("minimal home landing works", async ({ page }) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-physics-bye]")).toBeVisible();
  await waitForSettledLocalRendering(page, 2_400);
  await page.screenshot({ path: `${reviewDirectory}\\home-desktop.png`, fullPage: false });

  const firstLetter = page.getByRole("button", { name: "Throw letter b" });
  await firstLetter.dragTo(page.locator("[data-physics-bye]"), {
    targetPosition: { x: 980, y: 290 },
    force: true
  });
  await page.mouse.dblclick(80, 80);
  await waitForSettledLocalRendering(page, 900);
  await page.screenshot({ path: `${reviewDirectory}\\home-desktop-interaction.png`, fullPage: false });

  const enterButton = page.locator("[data-enter-handover]");
  await enterButton.hover();
  await expect(enterButton).toContainText("nope");
  await page.mouse.move(20, 20);
  await enterButton.hover({ force: true });
  await expect(enterButton).toContainText("almost");
  await page.mouse.move(20, 20);
  await enterButton.hover({ force: true });
  await expect(enterButton).toContainText("ok fine.");
  await enterButton.click({ force: true });
  await page.waitForURL("**/docs", { timeout: 3_000 });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await waitForSettledLocalRendering(page, 2_400);
  await page.screenshot({ path: `${reviewDirectory}\\home-mobile.png`, fullPage: false });

  expect(consoleErrors).toEqual([]);
});

test("explore pages and checklist render refined chrome", async ({ page }) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/docs", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "The grown-up handover lives here." })).toBeVisible();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\explore-desktop-index.png`, fullPage: true });

  await page.goto("http://127.0.0.1:4173/docs/aida-architecture", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "AIDA architecture overview" })).toBeVisible();
  await expect(page.getByText("On this page")).toBeVisible();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\explore-desktop-aida-architecture.png`, fullPage: true });

  await page.goto("http://127.0.0.1:4173/docs/cvc-now-and-next", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "CVC now and next" })).toBeVisible();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\explore-desktop-cvc.png`, fullPage: true });

  await page.goto("http://127.0.0.1:4173/checklist", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Handover checklist" })).toBeVisible();
  await page.getByRole("button", { name: /Split showcase/ }).click();
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\explore-desktop-checklist.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/docs/aida-architecture", { waitUntil: "networkidle" });
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\explore-mobile-doc.png`, fullPage: false });
  await page.getByRole("button", { name: "Browse docs" }).click();
  await waitForSettledLocalRendering(page, 600);
  await page.screenshot({ path: `${reviewDirectory}\\explore-mobile-drawer.png`, fullPage: false });

  expect(consoleErrors).toEqual([]);
});
