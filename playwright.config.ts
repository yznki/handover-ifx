import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./scripts",
  timeout: 60_000,
  webServer: {
    command: "pnpm preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120_000
  },
  use: {
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
