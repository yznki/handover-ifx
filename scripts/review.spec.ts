import { expect, test } from "@playwright/test";

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
