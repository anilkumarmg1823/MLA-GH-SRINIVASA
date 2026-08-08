import { describe, expect, it } from "vitest";
import {
  DEMO_TOTP_SECRET,
  buildOtpauthUrl,
  currentTotpToken,
  generateTotpSecret,
  verifyTotpToken,
} from "../../src/lib/totp.js";

describe("TOTP helpers", () => {
  it("generates a secret and verifies its current token", () => {
    const secret = generateTotpSecret();
    expect(secret.length).toBeGreaterThanOrEqual(16);
    const token = currentTotpToken(secret);
    expect(token).toMatch(/^\d{6}$/);
    expect(verifyTotpToken(secret, token)).toBe(true);
  });

  it("rejects invalid codes for demo secret", () => {
    expect(verifyTotpToken(DEMO_TOTP_SECRET, "000000")).toBe(false);
    expect(verifyTotpToken(DEMO_TOTP_SECRET, "abc")).toBe(false);
    expect(verifyTotpToken(DEMO_TOTP_SECRET, "")).toBe(false);
  });

  it("accepts current token for demo secret", () => {
    const token = currentTotpToken(DEMO_TOTP_SECRET);
    expect(verifyTotpToken(DEMO_TOTP_SECRET, token)).toBe(true);
  });

  it("builds otpauth URI with issuer and phone label", () => {
    const uri = buildOtpauthUrl("9876543210", DEMO_TOTP_SECRET);
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain("secret=");
    expect(uri).toContain("issuer=");
    expect(uri).toContain("9876543210");
  });
});
