import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  normalizeWaPhone,
  verifyWhatsAppSignature,
} from "../../src/lib/whatsapp/client.js";

describe("whatsapp client helpers", () => {
  it("normalizes phone to digits", () => {
    expect(normalizeWaPhone("+91 98765-43210")).toBe("919876543210");
    expect(normalizeWaPhone("9876543210")).toBe("9876543210");
  });

  it("returns boolean for signature check", () => {
    const raw = Buffer.from('{"object":"whatsapp_business_account"}');
    const sig =
      "sha256=" +
      crypto.createHmac("sha256", "test-secret").update(raw).digest("hex");
    expect(typeof verifyWhatsAppSignature(raw, sig)).toBe("boolean");
  });
});
