import { Router } from "express";
import { env } from "../config/env.js";
import { asyncHandler, ok } from "../middleware/error.js";
import {
  isWhatsAppReady,
  verifyWhatsAppSignature,
  normalizeWaPhone,
} from "../lib/whatsapp/client.js";
import { handleInboundMessage } from "../lib/whatsapp/bot.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

/** In-memory dedupe of Meta message ids (also persisted on WaSession) */
const seenIds = new Map();
const SEEN_TTL_MS = 10 * 60 * 1000;

function rememberMessageId(id) {
  if (!id) return false;
  const now = Date.now();
  for (const [k, t] of seenIds) {
    if (now - t > SEEN_TTL_MS) seenIds.delete(k);
  }
  if (seenIds.has(id)) return true;
  seenIds.set(id, now);
  return false;
}

/** Meta webhook verification (GET) */
router.get(
  "/webhook",
  asyncHandler(async (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === env.whatsapp.verifyToken) {
      return res.status(200).send(String(challenge || ""));
    }
    return res.sendStatus(403);
  })
);

/** Meta inbound events (POST) */
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    // Always 200 quickly so Meta does not retry aggressively
    res.status(200).json({ ok: true });

    if (!isWhatsAppReady()) {
      console.warn("WhatsApp webhook received but WHATSAPP_ENABLED/config incomplete");
      return;
    }

    const signature = req.headers["x-hub-signature-256"];
    if (env.whatsapp.appSecret) {
      const raw = req.rawBody;
      if (!verifyWhatsAppSignature(raw, signature)) {
        console.warn("WhatsApp webhook signature mismatch");
        return;
      }
    }

    const body = req.body;
    if (body?.object !== "whatsapp_business_account") return;

    const entries = Array.isArray(body.entry) ? body.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change.value;
        if (!value?.messages) continue;
        const contacts = value.contacts || [];
        for (const message of value.messages) {
          if (rememberMessageId(message.id)) continue;

          // Touch lastInboundAt on open complaints for this WA phone (helps 24h window)
          const waPhone = normalizeWaPhone(message.from);
          if (waPhone) {
            try {
              await prisma.complaint.updateMany({
                where: {
                  waPhone,
                  source: "whatsapp",
                  status: { in: ["new", "read"] },
                },
                data: { lastInboundAt: new Date() },
              });
            } catch {
              /* schema may not be migrated yet in some envs */
            }
          }

          const contact = contacts.find((c) => c.wa_id === message.from);
          const profileName = contact?.profile?.name || "";
          try {
            await handleInboundMessage(message, profileName);
          } catch (err) {
            console.error("WhatsApp handleInboundMessage failed", err);
          }
        }
      }
    }
  })
);

/** Health / config probe for ops (no secrets) */
router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    return ok(res, {
      enabled: env.whatsapp.enabled,
      configured: Boolean(env.whatsapp.token && env.whatsapp.phoneNumberId),
      phoneNumberIdSet: Boolean(env.whatsapp.phoneNumberId),
      verifyTokenSet: Boolean(env.whatsapp.verifyToken),
      apiVersion: env.whatsapp.apiVersion,
    });
  })
);

export default router;
