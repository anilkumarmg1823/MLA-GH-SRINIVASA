/**
 * Bilingual WhatsApp complaint intake state machine.
 * Steps: start → lang → name → phone → gp → village → subject → message → photos → confirm → done
 */
import { prisma } from "../prisma.js";
import { gramPanchayats } from "../../data/gramPanchayats.js";
import { env } from "../../config/env.js";
import {
  sendText,
  sendButtons,
  sendList,
  sendTemplate,
  downloadWhatsAppMedia,
  normalizeWaPhone,
} from "./client.js";

const SESSION_IDLE_MS = 60 * 60 * 1000;
const MAX_PHOTOS = 3;
const GP_PAGE = 8;

const T = {
  kn: {
    greet:
      "ನಮಸ್ಕಾರ! ಕೂಡ್ಲಿಗಿ ಶಾಸಕರ ಕಚೇರಿ ದೂರು / ಸಲಹೆ WhatsApp ಸೇವೆಗೆ ಸ್ವಾಗತ.\n\nHello! Welcome to Kudligi MLA Office complaint WhatsApp service.\n\nPlease choose language / ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ:",
    askName: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಬರೆಯಿರಿ:",
    askPhone:
      "WhatsApp ಸಂಖ್ಯೆಯನ್ನು ದೂರು ಸಂಪರ್ಕವಾಗಿ ಬಳಸಬಹುದೇ?\n\nದೃಢೀಕರಿಸಿ ಅಥವಾ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ.",
    useThisPhone: "ಈ ಸಂಖ್ಯೆ OK",
    enterOther: "ಬೇರೆ ಸಂಖ್ಯೆ",
    askGp: "ಗ್ರಾಮ ಪಂಚಾಯತಿ ಆಯ್ಕೆ ಮಾಡಿ:",
    askVillage: "ಗ್ರಾಮ ಆಯ್ಕೆ ಮಾಡಿ:",
    more: "ಮತ್ತಷ್ಟು…",
    askSubject:
      "ವಿಷಯ (ಐಚ್ಛಿಕ). ಬಿಡಲು *skip* ಅಥವಾ *ಬಿಡಿ* ಎಂದು ಕಳುಹಿಸಿ:",
    askMessage: "ದೂರು / ಸಲಹೆಯನ್ನು ವಿವರವಾಗಿ ಬರೆಯಿರಿ:",
    askPhotos: `ಫೋಟೋಗಳನ್ನು ಕಳುಹಿಸಿ (ಗರಿಷ್ಠ ${MAX_PHOTOS}). ಮುಗಿದಾಗ *done* / *ಮುಗಿಯಿತು*. ಇಲ್ಲದಿದ್ದರೆ *skip* / *ಬಿಡಿ*.`,
    photoOk: (n) => `ಫೋಟೋ ಸೇವ್ ಆಯಿತು (${n}/${MAX_PHOTOS}). ಇನ್ನೂ ಕಳುಹಿಸಿ ಅಥವಾ *done*.`,
    confirmTitle: "ದಯವಿಟ್ಟು ದೃಢೀಕರಿಸಿ:",
    yes: "ಹೌದು · Submit",
    no: "ಬದಲಾಯಿಸಿ · Restart",
    registered: (id) =>
      `✅ ದೂರು ನೋಂದಾಯಿತು.\nಟಿಕೆಟ್: *${id}*\nಅಧಿಕಾರಿ ಉತ್ತರಿಸಿದಾಗ ಇದೇ WhatsApp-ಗೆ ಸಂದೇಶ ಬರುತ್ತದೆ.`,
    restart: "ಮೆನು / ಪುನಃ ಪ್ರಾರಂಭ. ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ:",
    invalid: "ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ *menu* ಕಳುಹಿಸಿ.",
    pickList: "ಪಟ್ಟಿ ತೆರೆಯಿರಿ",
    officerReply: (text) => `📢 ಶಾಸಕರ ಕಚೇರಿ ಉತ್ತರ:\n\n${text}`,
  },
  en: {
    greet:
      "Hello! Welcome to Kudligi MLA Office complaint WhatsApp service.\n\nನಮಸ್ಕಾರ! ಕೂಡ್ಲಿಗಿ ಶಾಸಕರ ಕಚೇರಿ ದೂರು WhatsApp ಸೇವೆ.\n\nPlease choose language / ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ:",
    askName: "Please type your full name:",
    askPhone:
      "Use this WhatsApp number as your contact for the complaint?\n\nConfirm, or type a 10-digit mobile number.",
    useThisPhone: "Use this number",
    enterOther: "Other number",
    askGp: "Select your Gram Panchayat:",
    askVillage: "Select your village:",
    more: "More…",
    askSubject: "Subject (optional). Send *skip* to leave blank:",
    askMessage: "Please describe your complaint / suggestion:",
    askPhotos: `Send photos (max ${MAX_PHOTOS}). When finished send *done*. Or *skip*.`,
    photoOk: (n) => `Photo saved (${n}/${MAX_PHOTOS}). Send more or *done*.`,
    confirmTitle: "Please confirm:",
    yes: "Yes · Submit",
    no: "Edit · Restart",
    registered: (id) =>
      `✅ Complaint registered.\nTicket: *${id}*\nWhen an officer responds, you will get a WhatsApp message here.`,
    restart: "Menu / restart. Choose language:",
    invalid: "Sorry, I didn’t understand. Try again or send *menu*.",
    pickList: "Open list",
    officerReply: (text) => `📢 MLA Office reply:\n\n${text}`,
  },
};

function t(lang) {
  return T[lang === "en" ? "en" : "kn"];
}

function isRestart(text) {
  const s = String(text || "").trim().toLowerCase();
  return (
    !s ||
    /^(hii+|he+y+|hello+|hi|namaste|namaskar|menu|start|begin|ದೂರು|complaint|complaints|help|ಮೆನು|ನಮಸ್ಕಾರ|ಹಾಯ್)$/i.test(
      s
    )
  );
}

function isSkip(text) {
  return /^(skip|none|no|ಬಿಡಿ|ಬೇಡ)$/i.test(String(text || "").trim());
}

function isDone(text) {
  return /^(done|ok|finish|ಮುಗಿಯಿತು|ಮುಗಿದು|ಸರಿ)$/i.test(String(text || "").trim());
}

function freshDraft() {
  return {
    name: "",
    phone: "",
    gramPanchayat: "",
    gramPanchayatKn: "",
    village: "",
    villageKn: "",
    subject: "",
    message: "",
    photos: [],
    gpPage: 0,
    villagePage: 0,
  };
}

async function getSession(waPhone) {
  const phone = normalizeWaPhone(waPhone);
  let session = await prisma.waSession.findUnique({ where: { waPhone: phone } });
  const now = new Date();
  if (!session) {
    session = await prisma.waSession.create({
      data: {
        waPhone: phone,
        step: "start",
        lang: "kn",
        draft: freshDraft(),
        lastInboundAt: now,
      },
    });
    return session;
  }
  if (now - new Date(session.updatedAt) > SESSION_IDLE_MS) {
    session = await prisma.waSession.update({
      where: { waPhone: phone },
      data: {
        step: "start",
        draft: freshDraft(),
        lastInboundAt: now,
      },
    });
  }
  return session;
}

async function saveSession(waPhone, patch) {
  return prisma.waSession.update({
    where: { waPhone: normalizeWaPhone(waPhone) },
    data: {
      ...patch,
      lastInboundAt: new Date(),
    },
  });
}

function draftOf(session) {
  return { ...freshDraft(), ...(session.draft && typeof session.draft === "object" ? session.draft : {}) };
}

async function startFlow(to, langHint) {
  const lang = langHint === "en" ? "en" : "kn";
  await saveSession(to, {
    step: "lang",
    lang,
    draft: freshDraft(),
  });
  await sendButtons(to, t(lang).greet, [
    { id: "lang_kn", title: "ಕನ್ನಡ" },
    { id: "lang_en", title: "English" },
  ]);
}

async function sendGpList(to, lang, page = 0) {
  const labels = t(lang);
  const start = page * GP_PAGE;
  const slice = gramPanchayats.slice(start, start + GP_PAGE);
  const rows = slice.map((gp, i) => ({
    id: `gp_${start + i}`,
    title: lang === "kn" ? gp.nameKn || gp.name : gp.name,
    description: lang === "kn" ? gp.name : gp.nameKn || gp.name,
  }));
  if (start + GP_PAGE < gramPanchayats.length) {
    rows.push({ id: `gp_more_${page + 1}`, title: labels.more });
  }
  await sendList(to, labels.askGp, labels.pickList, [
    { title: lang === "kn" ? "ಗ್ರಾಮ ಪಂಚಾಯತಿ" : "Gram Panchayat", rows },
  ]);
}

async function sendVillageList(to, lang, gp, page = 0) {
  const labels = t(lang);
  const villages = gp.villages || [];
  const start = page * GP_PAGE;
  const slice = villages.slice(start, start + GP_PAGE);
  const rows = slice.map((v, i) => ({
    id: `vil_${start + i}`,
    title: (lang === "kn" ? v.nameKn || v.name : v.name).slice(0, 24),
    description: lang === "kn" ? v.name : v.nameKn || v.name,
  }));
  if (start + GP_PAGE < villages.length) {
    rows.push({ id: `vil_more_${page + 1}`, title: labels.more });
  }
  await sendList(to, labels.askVillage, labels.pickList, [
    { title: lang === "kn" ? "ಗ್ರಾಮ" : "Village", rows },
  ]);
}

function summaryText(lang, draft) {
  const lines = [
    t(lang).confirmTitle,
    `• ${lang === "kn" ? "ಹೆಸರು" : "Name"}: ${draft.name}`,
    `• ${lang === "kn" ? "ಫೋನ್" : "Phone"}: ${draft.phone}`,
    `• GP: ${lang === "kn" ? draft.gramPanchayatKn || draft.gramPanchayat : draft.gramPanchayat}`,
    `• ${lang === "kn" ? "ಗ್ರಾಮ" : "Village"}: ${lang === "kn" ? draft.villageKn || draft.village : draft.village}`,
    `• ${lang === "kn" ? "ವಿಷಯ" : "Subject"}: ${draft.subject || "—"}`,
    `• ${lang === "kn" ? "ದೂರು" : "Message"}: ${String(draft.message).slice(0, 400)}`,
    `• ${lang === "kn" ? "ಫೋಟೋ" : "Photos"}: ${(draft.photos || []).length}`,
  ];
  return lines.join("\n");
}

async function createComplaintFromDraft(waPhone, lang, draft, waMessageId) {
  const shortId = `C-${Date.now().toString(36).toUpperCase()}`;
  const row = await prisma.complaint.create({
    data: {
      name: draft.name,
      phone: draft.phone,
      village: draft.village || draft.villageKn || "",
      gramPanchayat: draft.gramPanchayat || "",
      subject: draft.subject || shortId,
      message: draft.message,
      status: "new",
      source: "whatsapp",
      language: lang,
      waPhone: normalizeWaPhone(waPhone),
      waMessageId: waMessageId || null,
      photos: draft.photos || [],
      lastInboundAt: new Date(),
    },
  });
  return row;
}

/**
 * Process one inbound WhatsApp message object from Meta webhook.
 */
export async function handleInboundMessage(message, contactName) {
  const to = normalizeWaPhone(message.from);
  if (!to) return;

  const session = await getSession(to);
  let lang = session.lang === "en" ? "en" : "kn";
  let step = session.step || "start";
  let draft = draftOf(session);

  const msgType = message.type;
  const textBody =
    msgType === "text"
      ? message.text?.body || ""
      : msgType === "interactive"
        ? message.interactive?.button_reply?.id ||
          message.interactive?.list_reply?.id ||
          message.interactive?.button_reply?.title ||
          message.interactive?.list_reply?.title ||
          ""
        : "";

  if (msgType === "text" && isRestart(textBody) && step !== "message" && step !== "subject" && step !== "name") {
    await startFlow(to);
    return;
  }
  if (msgType === "text" && /^(menu|ಮೆನು)$/i.test(textBody.trim())) {
    await startFlow(to);
    return;
  }

  // Mark last message id for idempotency at route level
  if (message.id && session.lastMessageId === message.id) return;
  if (message.id) {
    await saveSession(to, { lastMessageId: message.id });
  }

  try {
    if (step === "start" || step === "lang") {
      if (textBody === "lang_en" || /^2|en|english$/i.test(textBody)) {
        lang = "en";
      } else if (textBody === "lang_kn" || /^1|kn|kannada|ಕನ್ನಡ$/i.test(textBody)) {
        lang = "kn";
      } else if (step === "start") {
        await startFlow(to);
        return;
      } else {
        await sendButtons(to, t(lang).greet, [
          { id: "lang_kn", title: "ಕನ್ನಡ" },
          { id: "lang_en", title: "English" },
        ]);
        return;
      }
      await saveSession(to, { step: "name", lang, draft });
      await sendText(to, t(lang).askName);
      return;
    }

    if (step === "name") {
      const name = String(textBody || contactName || "").trim().slice(0, 120);
      if (!name || msgType !== "text") {
        await sendText(to, t(lang).askName);
        return;
      }
      draft.name = name;
      draft.phone = to.length === 12 && to.startsWith("91") ? to.slice(2) : to;
      await saveSession(to, { step: "phone", draft });
      await sendButtons(to, `${t(lang).askPhone}\n\n+${to}`, [
        { id: "phone_ok", title: t(lang).useThisPhone },
        { id: "phone_other", title: t(lang).enterOther },
      ]);
      return;
    }

    if (step === "phone") {
      if (textBody === "phone_ok") {
        // keep draft.phone
      } else if (textBody === "phone_other") {
        await saveSession(to, { step: "phone_type", draft });
        await sendText(
          to,
          lang === "kn" ? "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ:" : "Send a 10-digit mobile number:"
        );
        return;
      } else if (msgType === "text") {
        const digits = textBody.replace(/\D/g, "");
        if (digits.length >= 10 && digits.length <= 15) {
          draft.phone = digits.slice(-10);
        } else {
          await sendText(to, t(lang).invalid);
          return;
        }
      } else {
        await sendText(to, t(lang).invalid);
        return;
      }
      draft.gpPage = 0;
      await saveSession(to, { step: "gp", draft });
      await sendGpList(to, lang, 0);
      return;
    }

    if (step === "phone_type") {
      const digits = String(textBody || "").replace(/\D/g, "");
      if (digits.length < 10) {
        await sendText(
          to,
          lang === "kn" ? "ಸರಿಯಾದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ:" : "Please send a valid mobile number:"
        );
        return;
      }
      draft.phone = digits.slice(-10);
      draft.gpPage = 0;
      await saveSession(to, { step: "gp", draft });
      await sendGpList(to, lang, 0);
      return;
    }

    if (step === "gp") {
      if (String(textBody).startsWith("gp_more_")) {
        const page = Number(String(textBody).replace("gp_more_", "")) || 0;
        draft.gpPage = page;
        await saveSession(to, { draft });
        await sendGpList(to, lang, page);
        return;
      }
      const m = String(textBody).match(/^gp_(\d+)$/);
      if (!m) {
        await sendGpList(to, lang, draft.gpPage || 0);
        return;
      }
      const gp = gramPanchayats[Number(m[1])];
      if (!gp) {
        await sendGpList(to, lang, 0);
        return;
      }
      draft.gramPanchayat = gp.name;
      draft.gramPanchayatKn = gp.nameKn || gp.name;
      draft.villagePage = 0;
      await saveSession(to, { step: "village", draft });
      await sendVillageList(to, lang, gp, 0);
      return;
    }

    if (step === "village") {
      const gp = gramPanchayats.find((g) => g.name === draft.gramPanchayat);
      if (!gp) {
        await saveSession(to, { step: "gp", draft });
        await sendGpList(to, lang, 0);
        return;
      }
      if (String(textBody).startsWith("vil_more_")) {
        const page = Number(String(textBody).replace("vil_more_", "")) || 0;
        draft.villagePage = page;
        await saveSession(to, { draft });
        await sendVillageList(to, lang, gp, page);
        return;
      }
      const m = String(textBody).match(/^vil_(\d+)$/);
      if (!m) {
        await sendVillageList(to, lang, gp, draft.villagePage || 0);
        return;
      }
      const village = gp.villages[Number(m[1])];
      if (!village) {
        await sendVillageList(to, lang, gp, 0);
        return;
      }
      draft.village = village.name;
      draft.villageKn = village.nameKn || village.name;
      await saveSession(to, { step: "subject", draft });
      await sendText(to, t(lang).askSubject);
      return;
    }

    if (step === "subject") {
      if (msgType !== "text") {
        await sendText(to, t(lang).askSubject);
        return;
      }
      draft.subject = isSkip(textBody) ? "" : String(textBody).trim().slice(0, 200);
      await saveSession(to, { step: "message", draft });
      await sendText(to, t(lang).askMessage);
      return;
    }

    if (step === "message") {
      if (msgType !== "text" || !String(textBody).trim()) {
        await sendText(to, t(lang).askMessage);
        return;
      }
      draft.message = String(textBody).trim().slice(0, 4000);
      draft.photos = [];
      await saveSession(to, { step: "photos", draft });
      await sendText(to, t(lang).askPhotos);
      return;
    }

    if (step === "photos") {
      if (msgType === "image" && message.image?.id) {
        if ((draft.photos || []).length >= MAX_PHOTOS) {
          await sendText(to, t(lang).askPhotos);
          return;
        }
        try {
          const photo = await downloadWhatsAppMedia(message.image.id);
          draft.photos = [...(draft.photos || []), photo];
          await saveSession(to, { draft });
          await sendText(to, t(lang).photoOk(draft.photos.length));
          if (draft.photos.length >= MAX_PHOTOS) {
            await saveSession(to, { step: "confirm", draft });
            await sendButtons(to, summaryText(lang, draft), [
              { id: "confirm_yes", title: t(lang).yes },
              { id: "confirm_no", title: t(lang).no },
            ]);
          }
        } catch (err) {
          console.error("WA media download failed", err);
          await sendText(
            to,
            lang === "kn"
              ? "ಫೋಟೋ ಸೇವ್ ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಕಳುಹಿಸಿ ಅಥವಾ *skip*."
              : "Could not save photo. Try again or send *skip*."
          );
        }
        return;
      }
      if (msgType === "text" && (isSkip(textBody) || isDone(textBody))) {
        await saveSession(to, { step: "confirm", draft });
        await sendButtons(to, summaryText(lang, draft), [
          { id: "confirm_yes", title: t(lang).yes },
          { id: "confirm_no", title: t(lang).no },
        ]);
        return;
      }
      await sendText(to, t(lang).askPhotos);
      return;
    }

    if (step === "confirm") {
      if (textBody === "confirm_yes" || /^(yes|y|ಹೌದು|ಸರಿ)$/i.test(textBody)) {
        const row = await createComplaintFromDraft(to, lang, draft, message.id);
        await saveSession(to, { step: "done", draft: freshDraft() });
        const ticket = row.id.slice(-8).toUpperCase();
        try {
          const tpl =
            lang === "en"
              ? env.whatsapp.templates.registeredEn
              : env.whatsapp.templates.registeredKn;
          await sendTemplate(to, tpl, lang, [ticket]);
        } catch {
          await sendText(to, t(lang).registered(ticket));
        }
        return;
      }
      if (textBody === "confirm_no" || /^(no|n|edit|restart|ಬದಲಾಯಿಸಿ)$/i.test(textBody)) {
        await startFlow(to, lang);
        return;
      }
      await sendButtons(to, summaryText(lang, draft), [
        { id: "confirm_yes", title: t(lang).yes },
        { id: "confirm_no", title: t(lang).no },
      ]);
      return;
    }

    // done / unknown → restart
    await startFlow(to, lang);
  } catch (err) {
    console.error("WhatsApp bot error", err);
    await sendText(to, t(lang).invalid).catch(() => {});
  }
}

/**
 * Send officer reply to citizen WhatsApp.
 * Uses free-form text if last inbound < 24h; else tries template.
 */
export async function sendOfficerReply(complaint, replyText) {
  const to = complaint.waPhone || complaint.phone;
  if (!to) throw new Error("No WhatsApp phone on complaint");
  const lang = complaint.language === "en" ? "en" : "kn";
  const body = t(lang).officerReply(replyText);

  const lastIn = complaint.lastInboundAt
    ? new Date(complaint.lastInboundAt).getTime()
    : 0;
  const within24h = lastIn && Date.now() - lastIn < 24 * 60 * 60 * 1000;

  if (within24h) {
    await sendText(to, body);
    return { mode: "session" };
  }

  try {
    const tpl =
      lang === "en"
        ? env.whatsapp.templates.replyEn
        : env.whatsapp.templates.replyKn;
    await sendTemplate(to, tpl, lang, [String(replyText).slice(0, 900)]);
    return { mode: "template" };
  } catch (err) {
    // Last resort: attempt session message (may fail outside window)
    await sendText(to, body);
    return { mode: "session_fallback", warning: err.message };
  }
}
