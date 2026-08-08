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

describe("Staff TOTP login smoke", () => {
  beforeAll(async () => {
    await assertApiUp();
  });

  it("staff can login with authenticator code", async () => {
    const { currentTotpToken, DEMO_TOTP_SECRET } = await import(
      "../../src/lib/totp.js"
    );
    const phone = "9876543210";
    const otp = currentTotpToken(DEMO_TOTP_SECRET);
    const { res, json } = await req("/auth/staff/verify-totp", {
      method: "POST",
      body: { phone, otp },
    });
    expect(res.ok).toBe(true);
    expect(json?.data?.token).toBeTruthy();
  });
});
