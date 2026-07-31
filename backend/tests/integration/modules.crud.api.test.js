/**
 * Integration: GET / POST / PUT|PATCH / ARCHIVE / RESTORE for every catalog module.
 *
 * ADD NEW APIs in tests/apiModules.js (CRUD_MODULES) — this file picks them up.
 * Requires API running: npm run start
 */
import { beforeAll, describe, expect, it } from "vitest";
import { CRUD_MODULES, runModuleCrud } from "../apiModules.js";
import { adminLogin, assertApiUp } from "../helpers/http.js";

describe("All modules CRUD + archive (catalog)", () => {
  let token;

  beforeAll(async () => {
    await assertApiUp();
    token = await adminLogin();
  });

  for (const module of CRUD_MODULES) {
    it(`${module.name}: GET → POST → update → archive → restore`, async () => {
      const id = await runModuleCrud(module, token);
      expect(id).toBeTruthy();
    });
  }
});
