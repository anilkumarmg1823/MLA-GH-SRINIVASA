import {
  generateSecret as otplibGenerateSecret,
  generateURI,
  generateSync,
  verifySync,
} from "otplib";
import QRCode from "qrcode";

/** Issuer shown in Authenticator apps */
const ISSUER = "Kudligi MLA Office";

/**
 * Fixed demo secret for seeded staff (valid base32, ≥128 bits).
 * Override via DEMO_TOTP_SECRET. Scan via Access → Enroll QR, or enter this secret manually.
 */
export const DEMO_TOTP_SECRET =
  process.env.DEMO_TOTP_SECRET || "BTRSABHTAOR7A2U4DZLNIQI6H5OZSNDT";

export function generateTotpSecret() {
  return otplibGenerateSecret();
}

export function buildOtpauthUrl(phone, secret) {
  const label = phone ? `staff-${phone}` : "staff";
  return generateURI({
    issuer: ISSUER,
    label,
    secret,
  });
}

export function verifyTotpToken(secret, token) {
  if (!secret || !token) return false;
  const code = String(token).replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  try {
    const result = verifySync({
      secret,
      token: code,
      epochTolerance: 30, // ±30s clock skew
    });
    return Boolean(result?.valid);
  } catch {
    return false;
  }
}

export function currentTotpToken(secret) {
  return generateSync({ secret });
}

export async function otpauthToQrDataUrl(otpauthUrl) {
  return QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
  });
}
