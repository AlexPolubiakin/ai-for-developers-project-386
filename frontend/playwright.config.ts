import { defineConfig, devices } from "@playwright/test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(frontendDir, "..");
const backendDir = resolve(repoRoot, "backend");

const frontendUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const backendUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: frontendUrl,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run start",
      cwd: backendDir,
      env: {
        FRONTEND_URL: frontendUrl,
        PORT: "3001",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: backendUrl,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      cwd: frontendDir,
      env: {
        VITE_API_URL: backendUrl,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: frontendUrl,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
