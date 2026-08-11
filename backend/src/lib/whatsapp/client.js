/**
 * Meta WhatsApp Cloud API client
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
import crypto from "crypto";
import { env } from "../../config/env.js";
import { uploadBuffer } from "../s3.js";

const GRAPH = "https://graph.facebook.com";

function assertConfigured() {
  if (!env.whatsapp.token || !env.whatsapp.phoneNumberId) {
    throw new Error("WhatsApp Cloud API is not configured (token / phone number id)");
  }
}

function messagesUrl() {
  return `${GRAPH}/${env.whatsapp.apiVersion}/${env.whatsapp.phoneNumberId}/messages`;
}

async function graphPost(body) {
  assertConfigured();
  const res = await fetch(messagesUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.whatsapp.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      `WhatsApp API ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

/** Verify X-Hub-Signature-256 from Meta */
export function verifyWhatsAppSignature(rawBody, signatureHeader) {
  const secret = env.whatsapp.appSecret;
  if (!secret) return env.nodeEnv === "development";
  if (!signatureHeader || !rawBody) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(String(signatureHeader));
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function normalizeWaPhone(from) {
  return String(from || "").replace(/\D/g, "");
}

export async function sendText(to, body) {
  return graphPost({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizeWaPhone(to),
    type: "text",
    text: { preview_url: false, body: String(body).slice(0, 4096) },
  });
}

/** Reply buttons — max 3 */
export async function sendButtons(to, bodyText, buttons) {
  const btns = buttons.slice(0, 3).map((b) => ({
    type: "reply",
    reply: {
      id: String(b.id).slice(0, 256),
      title: String(b.title).slice(0, 20),
    },
  }));
  return graphPost({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizeWaPhone(to),
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: String(bodyText).slice(0, 1024) },
      action: { buttons: btns },
    },
  });
}

/**
 * Interactive list — max 10 rows.
 * sections: [{ title, rows: [{ id, title, description? }] }]
 */
export async function sendList(to, bodyText, buttonLabel, sections) {
  return graphPost({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizeWaPhone(to),
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: String(bodyText).slice(0, 1024) },
      action: {
        button: String(buttonLabel).slice(0, 20),
        sections: sections.map((sec) => ({
          title: String(sec.title || "Options").slice(0, 24),
          rows: (sec.rows || []).slice(0, 10).map((r) => ({
            id: String(r.id).slice(0, 200),
            title: String(r.title).slice(0, 24),
            ...(r.description
              ? { description: String(r.description).slice(0, 72) }
              : {}),
          })),
        })),
      },
    },
  });
}

/** Named template with a single body variable ({{1}}) */
export async function sendTemplate(to, templateName, langCode, bodyParams = []) {
  return graphPost({
    messaging_product: "whatsapp",
    to: normalizeWaPhone(to),
    type: "template",
    template: {
      name: templateName,
      language: { code: langCode === "kn" ? "kn" : "en" },
      components:
        bodyParams.length > 0
          ? [
              {
                type: "body",
                parameters: bodyParams.map((t) => ({
                  type: "text",
                  text: String(t).slice(0, 1024),
                })),
              },
            ]
          : undefined,
    },
  });
}

export async function downloadWhatsAppMedia(mediaId) {
  assertConfigured();
  const metaRes = await fetch(
    `${GRAPH}/${env.whatsapp.apiVersion}/${mediaId}`,
    { headers: { Authorization: `Bearer ${env.whatsapp.token}` } }
  );
  const meta = await metaRes.json().catch(() => ({}));
  if (!metaRes.ok || !meta.url) {
    throw new Error(meta?.error?.message || "Failed to resolve WhatsApp media URL");
  }
  const binRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${env.whatsapp.token}` },
  });
  if (!binRes.ok) throw new Error(`Failed to download WhatsApp media (${binRes.status})`);
  const buffer = Buffer.from(await binRes.arrayBuffer());
  const mimeType = meta.mime_type || binRes.headers.get("content-type") || "image/jpeg";
  const ext =
    mimeType.includes("png")
      ? ".png"
      : mimeType.includes("webp")
        ? ".webp"
        : ".jpg";
  const uploaded = await uploadBuffer({
    buffer,
    mimeType,
    originalName: `wa-${mediaId}${ext}`,
    moduleName: "complaints",
  });
  return {
    url: uploaded.url,
    s3Key: uploaded.s3Key,
    mimeType: uploaded.mimeType,
  };
}

export function isWhatsAppReady() {
  return Boolean(
    env.whatsapp.enabled &&
      env.whatsapp.token &&
      env.whatsapp.phoneNumberId
  );
}
