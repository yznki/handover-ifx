import { test } from "@playwright/test";

const targets = [
  { name: "aida", url: "https://aida.icp.infineon.com" },
  { name: "aida-demo", url: "https://aida-demo.icp.infineon.com" },
  { name: "aida-planning", url: "https://aida-planning.icp.infineon.com" },
  { name: "common-vue-components", url: "https://common-vue-components.icp.infineon.com" },
  { name: "common-vue-components-demo", url: "https://common-vue-components-demo.icp.infineon.com" }
];

test("capture reachable source screenshots", async ({ page }) => {
  for (const target of targets) {
    const response = await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 15_000 }).catch(() => null);
    if (!response || response.status() >= 400) continue;
    await page.screenshot({ path: `public/screens/${target.name}.png`, fullPage: true });
  }
});
