import { expect, test, type Page } from "@playwright/test";

const reviewDirectory = "C:\\Users\\Kiswani\\.copilot\\session-state\\0c59e435-9e11-4684-995a-a38f3769eb8d\\files\\review";
const pages = [
  { name: "home", path: "/" },
  { name: "explore-index", path: "/docs" },
  { name: "explore-aida-architecture", path: "/docs/aida-architecture" },
  { name: "explore-cvc", path: "/docs/cvc-now-and-next" },
  { name: "checklist", path: "/checklist" }
];
const auditPages = [
  { name: "home", path: "/" },
  { name: "docs-index", path: "/docs" },
  { name: "aida-architecture", path: "/docs/aida-architecture" },
  { name: "aida-planning", path: "/docs/aida-planning" },
  { name: "aida-vision-v1", path: "/docs/aida-vision-v1" },
  { name: "aida-workflows-status", path: "/docs/aida-workflows-status" },
  { name: "cicd-aida", path: "/docs/cicd-aida" },
  { name: "cicd-cvc", path: "/docs/cicd-cvc" },
  { name: "cicd-planning", path: "/docs/cicd-planning" },
  { name: "cvc-consumers", path: "/docs/cvc-consumers" },
  { name: "cvc-local-testing", path: "/docs/cvc-local-testing" },
  { name: "cvc-now-and-next", path: "/docs/cvc-now-and-next" },
  { name: "cvc-showcase", path: "/docs/cvc-showcase" },
  { name: "deploy-hicp-by-hand", path: "/docs/deploy-hicp-by-hand" },
  { name: "glossary", path: "/docs/glossary" },
  { name: "handover-week-timeline", path: "/docs/handover-week-timeline" },
  { name: "how-my-mind-works", path: "/docs/how-my-mind-works" },
  { name: "people-and-access", path: "/docs/people-and-access" },
  { name: "semantic-release-fails", path: "/docs/semantic-release-fails" },
  { name: "unfinished-business", path: "/docs/unfinished-business" },
  { name: "valibridge", path: "/docs/valibridge" },
  { name: "checklist", path: "/checklist" }
];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 820 },
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

test("enhanced home physics delight works", async ({ page }) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-physics-bye]")).toBeVisible();
  await expect(page.getByRole("link", { name: "skip →" })).toHaveCount(0);
  const soundToggle = page.getByRole("button", { name: /sound: off|sound: on/ });
  await soundToggle.click();
  await expect(soundToggle).toContainText("sound: on");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: /sound: on/ })).toBeVisible();
  await waitForSettledLocalRendering(page, 2_400);
  await page.screenshot({ path: `${reviewDirectory}\\home-desktop-more-initial.png`, fullPage: false });

  await page.keyboard.type("thanks uqba");
  await waitForSettledLocalRendering(page, 1_600);
  await page.screenshot({ path: `${reviewDirectory}\\home-desktop-more-typed.png`, fullPage: false });

  await page.keyboard.press("Escape");
  await waitForSettledLocalRendering(page, 800);
  const bodyLimitSample = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234";
  await page.keyboard.type(bodyLimitSample);
  await waitForSettledLocalRendering(page, 1_000);
  await expect(page.locator("[data-letter-character]")).toHaveCount(60);

  await page.keyboard.press("Escape");
  await waitForSettledLocalRendering(page, 800);
  const stackTargets = [
    { horizontalPosition: 720, verticalPosition: 420 },
    { horizontalPosition: 720, verticalPosition: 340 },
    { horizontalPosition: 720, verticalPosition: 260 }
  ];
  for (const [letterIndex, stackTarget] of stackTargets.entries()) {
    const letterBounds = await page.locator("[data-letter-character]").nth(letterIndex).boundingBox();
    expect(letterBounds).not.toBeNull();
    await page.mouse.move((letterBounds?.x || 0) + (letterBounds?.width || 0) / 2, (letterBounds?.y || 0) + (letterBounds?.height || 0) / 2);
    await page.mouse.down();
    await page.mouse.move(stackTarget.horizontalPosition, stackTarget.verticalPosition, { steps: 18 });
    await page.waitForTimeout(80);
    await page.mouse.up();
    await page.waitForTimeout(120);
  }
  await waitForSettledLocalRendering(page, 300);
  await page.screenshot({ path: `${reviewDirectory}\\home-desktop-more-stacked.png`, fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await waitForSettledLocalRendering(page, 2_000);
  await page.screenshot({ path: `${reviewDirectory}\\home-mobile-more.png`, fullPage: false });

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

test("dark mode renders without flash", async ({ page }) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.addInitScript(() => {
    localStorage.setItem("handover-theme", "dark");
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  const desktopPages = [
    { name: "home", path: "/" },
    { name: "docs-index", path: "/docs" },
    { name: "aida-architecture", path: "/docs/aida-architecture" },
    { name: "checklist", path: "/checklist" }
  ];

  for (const targetPage of desktopPages) {
    await page.goto(`http://127.0.0.1:4173${targetPage.path}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.waitForLoadState("networkidle");
    await waitForSettledLocalRendering(page, targetPage.path === "/" ? 2_000 : 800);
    await page.screenshot({ path: `${reviewDirectory}\\dark-${targetPage.name}-desktop.png`, fullPage: targetPage.path !== "/" });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/docs/aida-architecture", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.waitForLoadState("networkidle");
  await waitForSettledLocalRendering(page);
  await page.screenshot({ path: `${reviewDirectory}\\dark-mobile-doc.png`, fullPage: false });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/docs", { waitUntil: "networkidle" });
  await page.keyboard.press("Control+K");
  const paletteThemeButton = page.getByRole("button", { name: "Theme Toggle dark mode Current: dark" });
  await expect(paletteThemeButton).toBeVisible();
  await page.screenshot({ path: `${reviewDirectory}\\dark-command-palette.png`, fullPage: false });
  await paletteThemeButton.click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  expect(consoleErrors).toEqual([]);
});

test("polish audit interactions work", async ({ page }) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/docs", { waitUntil: "networkidle" });
  await expect(page.locator("[data-theme-toggle]").first()).toBeVisible();
  await expect(page.locator("[data-theme-toggle]").first().locator("[data-theme-icon-sun] circle")).toHaveCount(1);
  await expect(page.locator("[data-theme-toggle]").first().locator("[data-theme-icon-sun] path")).toHaveCount(1);
  await expect(page.locator("[data-theme-toggle]").first().locator("[data-theme-icon-moon] path")).toHaveCount(1);

  await page.getByRole("button", { name: /Search docs/ }).click();
  await expect(page.locator("#command-search")).toBeFocused();
  await page.locator("#command-search").fill("insecure-skip-tls-verify");
  await expect(page.locator("mark").first()).toContainText("insecure-skip-tls-verify", { ignoreCase: true });
  await page.keyboard.press("Enter");
  await page.waitForURL("**/docs/**", { timeout: 5_000 });
  await expect(page.getByText("insecure-skip-tls-verify").first()).toBeVisible();

  await page.goto("http://127.0.0.1:4173/docs/aida-architecture", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 520));
  await waitForSettledLocalRendering(page, 400);
  const activeTocCount = await page.locator("[data-active-toc='true']").count();
  expect(activeTocCount).toBeGreaterThanOrEqual(2);

  await page.keyboard.press("Control+K");
  await expect(page.locator("#command-search")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#command-search")).not.toBeVisible();

  await page.goto("http://127.0.0.1:4173/checklist", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Before I leave" })).toBeVisible();
  await expect(page.getByText("Uqba + Sandro").first()).toBeVisible();
  await expect(page.locator(".rounded-full", { hasText: "Uqba + Sandro" })).toHaveCount(0);

  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "skip →" })).toHaveCount(0);
  const soundToggle = page.getByRole("button", { name: /sound: off|sound: on/ });
  await soundToggle.click();
  await expect(soundToggle).toContainText(/sound: on|sound: off/);
  await page.getByRole("button", { name: /dark: off|dark: on/ }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  expect(consoleErrors).toEqual([]);
});

test("full light and dark visual audit", async ({ page }) => {
  test.setTimeout(600_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  for (const theme of ["light", "dark"]) {
    await page.addInitScript((nextTheme) => {
      localStorage.setItem("handover-theme", nextTheme);
    }, theme);

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const targetPage of auditPages) {
        await page.goto(`http://127.0.0.1:4173${targetPage.path}`, { waitUntil: "domcontentloaded" });
        await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /^((?!dark).)*$/);
        await page.waitForLoadState("networkidle");
        await expect(page.locator("body")).toBeVisible();
        await waitForSettledLocalRendering(page, targetPage.path === "/" ? 900 : 250);
        await page.screenshot({
          path: `${reviewDirectory}\\audit-${theme}-${viewport.name}-${targetPage.name}.png`,
          fullPage: targetPage.path !== "/"
        });
      }
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/docs/aida-architecture", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Browse docs" }).click();
  await waitForSettledLocalRendering(page, 400);
  await page.screenshot({ path: `${reviewDirectory}\\audit-mobile-sidebar-drawer.png`, fullPage: false });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/docs", { waitUntil: "networkidle" });
  await page.keyboard.press("Control+K");
  await page.locator("#command-search").fill("Jira token");
  await waitForSettledLocalRendering(page, 300);
  await page.screenshot({ path: `${reviewDirectory}\\audit-command-palette-search.png`, fullPage: false });

  expect(consoleErrors).toEqual([]);
});
