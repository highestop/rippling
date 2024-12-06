import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: "./setup.ts",
    testTimeout: process.env.CI === "true" ? 10000 : undefined,
  },
});
