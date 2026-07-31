/**
 * Kept for OTP resend + thin archive smoke.
 * Full CRUD+archive for all modules lives in modules.crud.api.test.js
 * (driven by tests/apiModules.js).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { CRUD_MODULES, runArchiveCycle } from "../apiModules.js";
import { adminLogin, assertApiUp, req } from "../helpers/http.js";

describe("Archive soft-delete (catalog sample)", () => {
  let token;

  beforeAll(async () => {
    await assertApiUp();
    token = await adminLogin();
  });

  it("Demands: DELETE archives; GET hides; restore brings it back", async () => {
    const demand = CRUD_MODULES.find((m) => m.name === "Demands");
    const created = await demand.create({ token, req });
    expect(created.res.status).toBe(201);
    await runArchiveCycle(demand, created.id, token);
  });
});

describe("Staff OTP resend path", () => {
  beforeAll(async () => {
    await assertApiUp();
  });

  it("staff OTP can be requested twice (resend path)", async () => {
    const phone = "9876543210";
    const a = await req("/auth/staff/request-otp", {
      method: "POST",
      body: { phone },
    });
    expect(a.res.ok).toBe(true);
    const b = await req("/auth/staff/request-otp", {
      method: "POST",
      body: { phone },
    });
    expect(b.res.ok).toBe(true);
  });
});
