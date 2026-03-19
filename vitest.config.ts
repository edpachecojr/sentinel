import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    // @ts-ignore - environmentMatchGlobs is supported in vitest but not yet typed
    environmentMatchGlobs: [
      ["tests/components/**", "jsdom"],
    ],
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    alias: [
      { find: "@/generated", replacement: path.resolve(__dirname, "generated") },
      { find: "@", replacement: path.resolve(__dirname, "src") },
      {
        find: "server-only",
        replacement: path.resolve(__dirname, "tests/mocks/server-only.ts"),
      },
    ],
  },
});
