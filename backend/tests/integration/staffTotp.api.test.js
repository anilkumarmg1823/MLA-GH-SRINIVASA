/**
 * Staff Authenticator (TOTP) login + admin enroll
 */
import { beforeAll, describe, expect, it } from "vitest";
import { adminLogin, assertApiUp, req } from "../helpers/http.js";
import { DEMO_TOTP_SECRET, currentTotpToken } from "../../src/lib/totp.js";

describe("Staff TOTP auth", () => {
  let adminToken;

  beforeAll(async () => {
    await assertApiUp();
    adminToken = await adminLogin();
  }, 120_000);

  it("begin-login rejects unregistered phone (no QR)", async () => {
    const { res, json } = await req("/auth/staff/begin-login", {
      method: "POST",
      body: { phone: "0000000000" },
    });
    expect(res.status).toBe(404);
    expect(json?.error?.code).toBe("NOT_FOUND");
  });

  it("begin-login then verify-totp for registered staff", async () => {
    const phone = "9876543210";
    const begin = await req("/auth/staff/begin-login", {
      method: "POST",
      body: { phone },
    });
    expect(begin.res.ok).toBe(true);
    expect(begin.json?.data?.totpEnabled).toBe(true);

    // Seeded staff already enrolled -> no QR; still can login with demo secret
    const secret = begin.json?.data?.needsScan
      ? begin.json.data.secret
      : DEMO_TOTP_SECRET;
    if (begin.json?.data?.needsScan) {
      expect(begin.json.data.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    }

    const otp = currentTotpToken(secret);
    const { res, json } = await req("/auth/staff/verify-totp", {
      method: "POST",
      body: { phone, otp },
    });
    expect(res.ok).toBe(true);
    expect(json?.data?.token).toBeTruthy();
    expect(json?.data?.user?.phone).toBe(phone);

    // Keep demo secret for other tests if begin rotated a new one
    if (begin.json?.data?.needsScan) {
      const { prisma } = await import("../../src/lib/prisma.js");
      await prisma.user.update({
        where: { phone },
        data: { totpSecret: DEMO_TOTP_SECRET, totpEnabled: true },
      });
    }
  });

  it("verify-totp rejects bad code", async () => {
    const { res, json } = await req("/auth/staff/verify-totp", {
      method: "POST",
      body: { phone: "9876543210", otp: "000000" },
    });
    expect(res.status).toBe(401);
    expect(json?.error?.code).toBe("OTP_INVALID");
  });

  it("admin can enroll / reset TOTP and get QR payload", async () => {
    const list = await req("/staff-access", { token: adminToken });
    expect(list.res.ok).toBe(true);
    const staff = (list.json?.data || []).find((u) => u.phone === "9876543210");
    expect(staff?.id).toBeTruthy();

    const enroll = await req(`/staff-access/${staff.id}/totp/enroll`, {
      method: "POST",
      token: adminToken,
    });
    expect(enroll.res.ok).toBe(true);
    expect(enroll.json?.data?.secret).toBeTruthy();
    expect(enroll.json?.data?.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(enroll.json?.data?.otpauthUrl).toMatch(/^otpauth:\/\//);

    // Restore demo secret so other tests keep working
    const { prisma } = await import("../../src/lib/prisma.js");
    await prisma.user.update({
      where: { id: staff.id },
      data: { totpSecret: DEMO_TOTP_SECRET, totpEnabled: true },
    });
  });
});
