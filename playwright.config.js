import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "chromium",
      args: ["--no-sandbox"],
    },
  },
});
