/**
 * Runs all API-related tests in one go:
 * 1) unit  2) integration  3) live flow against http://localhost:4000
 *
 * Usage: npm run test:all
 * Prerequisite: API must be running (`npm run start` or `npm run dev`).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const backend = path.join(root, "..");

const steps = [
  { name: "Unit", cmd: "npx", args: ["vitest", "run", "tests/unit"] },
  { name: "Integration", cmd: "npx", args: ["vitest", "run", "tests/integration"] },
  { name: "Flow (live API)", cmd: "node", args: ["scripts/fullFlowTest.js"] },
];

let failed = 0;

for (const step of steps) {
  console.log(`\n========== ${step.name} ==========\n`);
  const result = spawnSync(step.cmd, step.args, {
    cwd: backend,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    failed += 1;
    console.error(`\nFAIL  ${step.name} (exit ${result.status ?? "unknown"})`);
  } else {
    console.log(`\nPASS  ${step.name}`);
  }
}

console.log("\n========== Summary ==========");
if (failed) {
  console.error(`${failed} of ${steps.length} suites failed.`);
  process.exit(1);
}
console.log(`All ${steps.length} suites passed.`);
