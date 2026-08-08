import { defineConfig } from "vitest/config";

const remote = !/localhost|127\.0\.0\.1/i.test(
  process.env.API_BASE || "http://localhost:4000"
);

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    environment: "node",
    // Remote (Render) needs longer timeouts due to cold starts + flaky edge 404 retries
    testTimeout: remote ? 180_000 : 30_000,
    hookTimeout: remote ? 120_000 : 30_000,
  },
});
