import { existsSync, unlinkSync } from "node:fs";
import { test, type Page } from "@playwright/test";
import { PNG } from "pngjs";

/**
 * External app screenshot target.
 */
interface ScreenshotTarget {
  /**
   * Output file name without extension.
   */
  name: string;

  /**
   * Primary app URL.
   */
  url: string;

  /**
   * Optional follow-up paths to try for richer rendered content.
   */
  candidatePaths?: string[];
}

/**
 * Screenshot quality metrics.
 */
interface ScreenshotMetrics {
  /**
   * Number of sampled pixels.
   */
  sampleCount: number;

  /**
   * Average channel variance across sampled pixels.
   */
  variance: number;

  /**
   * Ratio of pixels close to the average color.
   */
  dominantColorRatio: number;
}

const targets: ScreenshotTarget[] = [
  { name: "aida", url: "https://aida.icp.infineon.com" },
  { name: "aida-demo", url: "https://aida-demo.icp.infineon.com" },
  { name: "aida-planning", url: "https://aida-planning.icp.infineon.com" },
  { name: "common-vue-components", url: "https://common-vue-components.icp.infineon.com", candidatePaths: ["/components", "/showcase", "/"] },
  { name: "common-vue-components-demo", url: "https://common-vue-components-demo.icp.infineon.com", candidatePaths: ["/components", "/showcase", "/"] }
];

const outputDirectory = "public/screens";
const minimumVariance = 240;
const maximumDominantColorRatio = 0.985;

/**
 * Waits for fonts, asynchronous rendering, and animation startup to settle.
 * @param page - Playwright page.
 * @param delayMilliseconds - Extra delay after fonts are ready.
 */
async function waitForSettledRendering(page: Page, delayMilliseconds: number): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(delayMilliseconds);
}

/**
 * Detects whether the current page is an authentication screen.
 * @param page - Playwright page.
 * @returns Whether the page appears to be a login screen.
 */
async function isLoginPage(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const pageText = document.body.innerText.toLowerCase();
    const currentUrl = window.location.href.toLowerCase();
    const loginUrlPresent = ["login", "sso", "oauth", "openid", "keycloak"].some((text) => currentUrl.includes(text));
    const passwordFieldPresent = Boolean(document.querySelector("input[type='password']"));
    const authenticationControlPresent = Array.from(document.querySelectorAll<HTMLElement>("button, a, input[type='submit']")).some((element) => {
      const controlText = (element.innerText || element.getAttribute("value") || element.getAttribute("aria-label") || "").toLowerCase();
      return controlText.length <= 48 && ["sign in", "log in", "login", "single sign-on", "authenticate"].some((text) => controlText.includes(text));
    });
    const authenticationCopyPresent = ["keycloak", "single sign-on", "authenticate"].some((text) => pageText.includes(text));
    return loginUrlPresent || passwordFieldPresent || authenticationControlPresent || authenticationCopyPresent;
  });
}

/**
 * Checks whether the page still shows loading-only UI.
 * @param page - Playwright page.
 * @returns Whether a visible loader or skeleton is present.
 */
async function hasVisibleLoadingUi(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const loadingSelectors = [
      "[aria-busy='true']",
      "[role='progressbar']",
      ".spinner",
      ".loader",
      ".loading",
      ".skeleton",
      "[class*='spinner']",
      "[class*='loader']",
      "[class*='loading']",
      "[class*='skeleton']"
    ];
    return loadingSelectors.some((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)).some((element) => {
      const style = window.getComputedStyle(element);
      const rectangle = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rectangle.width > 8 && rectangle.height > 8;
    }));
  });
}

/**
 * Checks whether the page has visible app-like content.
 * @param page - Playwright page.
 * @returns Whether content is visible and non-trivial.
 */
async function hasVisibleApplicationContent(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const contentRoots = Array.from(document.querySelectorAll<HTMLElement>("main, [role='main'], #__nuxt, #app, app-root, [data-testid='app'], body"));
    const visibleRoots = contentRoots.filter((element) => {
      const rectangle = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return style.visibility !== "hidden" && style.display !== "none" && rectangle.width > 300 && rectangle.height > 200 && element.children.length > 0;
    });
    const visibleHeadings = Array.from(document.querySelectorAll<HTMLElement>("h1, h2, h3, [role='heading']")).filter((element) => {
      const rectangle = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return style.visibility !== "hidden" && style.display !== "none" && rectangle.width > 20 && rectangle.height > 10 && element.innerText.trim().length > 0;
    });
    const bodyTextLength = document.body.innerText.trim().length;
    const canvasOrImageCount = document.querySelectorAll("canvas, img, svg").length;
    return visibleRoots.length > 0 && bodyTextLength > 120 && (visibleHeadings.length > 0 || canvasOrImageCount > 0);
  });
}

/**
 * Waits for a real app screen or identifies login/blank states.
 * @param page - Playwright page.
 * @returns Whether the app content loaded.
 */
async function waitForApplicationContent(page: Page): Promise<boolean> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await isLoginPage(page)) return false;
    const contentLoaded = await hasVisibleApplicationContent(page);
    const loadingVisible = await hasVisibleLoadingUi(page);
    if (contentLoaded && !loadingVisible) return true;
    await page.waitForTimeout(1_000);
  }
  return false;
}

/**
 * Calculates simple variance metrics to reject blank screenshots.
 * @param screenshotBuffer - PNG screenshot bytes.
 * @returns Screenshot metrics.
 */
function calculateScreenshotMetrics(screenshotBuffer: Buffer): ScreenshotMetrics {
  const pngImage = PNG.sync.read(screenshotBuffer);
  const stepX = Math.max(1, Math.floor(pngImage.width / 80));
  const stepY = Math.max(1, Math.floor(pngImage.height / 50));
  const samples: number[][] = [];

  for (let yPosition = 0; yPosition < pngImage.height; yPosition += stepY) {
    for (let xPosition = 0; xPosition < pngImage.width; xPosition += stepX) {
      const pixelIndex = (pngImage.width * yPosition + xPosition) << 2;
      samples.push([pngImage.data[pixelIndex] || 0, pngImage.data[pixelIndex + 1] || 0, pngImage.data[pixelIndex + 2] || 0]);
    }
  }

  const averages = [0, 1, 2].map((channelIndex) => samples.reduce((sum, sample) => sum + (sample[channelIndex] || 0), 0) / samples.length);
  const variance = samples.reduce((sum, sample) => sum + [0, 1, 2].reduce((channelSum, channelIndex) => channelSum + ((sample[channelIndex] || 0) - (averages[channelIndex] || 0)) ** 2, 0), 0) / samples.length;
  const dominantSamples = samples.filter((sample) => [0, 1, 2].every((channelIndex) => Math.abs((sample[channelIndex] || 0) - (averages[channelIndex] || 0)) < 14));

  return {
    sampleCount: samples.length,
    variance,
    dominantColorRatio: dominantSamples.length / samples.length
  };
}

/**
 * Removes a stale screenshot so the site falls back to the designed placeholder.
 * @param targetName - Screenshot target name.
 */
function removeStaleScreenshot(targetName: string): void {
  const screenshotPath = `${outputDirectory}/${targetName}.png`;
  if (!existsSync(screenshotPath)) return;
  unlinkSync(screenshotPath);
}

/**
 * Captures a screenshot only when it is not blank or mostly one color.
 * @param page - Playwright page.
 * @param target - Screenshot target.
 * @returns Whether the screenshot was accepted.
 */
async function captureAcceptedScreenshot(page: Page, target: ScreenshotTarget): Promise<boolean> {
  for (const delayMilliseconds of [3_000, 5_000, 10_000]) {
    await waitForSettledRendering(page, delayMilliseconds);
    const screenshotBuffer = await page.screenshot({ fullPage: false });
    const metrics = calculateScreenshotMetrics(screenshotBuffer);
    const screenshotLooksLoaded = metrics.variance >= minimumVariance && metrics.dominantColorRatio <= maximumDominantColorRatio && screenshotBuffer.byteLength > 45_000;
    if (!screenshotLooksLoaded) continue;
    await page.screenshot({ path: `${outputDirectory}/${target.name}.png`, fullPage: false });
    return true;
  }
  return false;
}

/**
 * Attempts to load a target URL and capture a useful app screenshot.
 * @param page - Playwright page.
 * @param target - Screenshot target.
 */
async function captureTarget(page: Page, target: ScreenshotTarget): Promise<void> {
  const candidateUrls = [target.url, ...(target.candidatePaths || []).map((candidatePath) => new URL(candidatePath, target.url).toString())];

  for (const candidateUrl of candidateUrls) {
    const response = await page.goto(candidateUrl, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => null);
    if (!response || response.status() >= 400) continue;
    const contentLoaded = await waitForApplicationContent(page);
    if (!contentLoaded) {
      removeStaleScreenshot(target.name);
      return;
    }
    const accepted = await captureAcceptedScreenshot(page, target);
    if (accepted) return;
  }

  removeStaleScreenshot(target.name);
}

test.use({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2
});

test.setTimeout(300_000);

test("capture reachable source screenshots", async ({ page }) => {
  for (const target of targets) {
    await captureTarget(page, target);
  }
});
