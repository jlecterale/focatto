import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for the agenda's pure business logic (invites, roles). These
// modules avoid Firestore imports so the suite runs without booting Firebase.
// The "@/" alias mirrors tsconfig.json paths.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
