/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vitest shares this same config (plugins, resolve, etc.) rather than
// needing a separate test-runner setup — that's the whole point of
// picking Vitest for a Vite project.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
});
