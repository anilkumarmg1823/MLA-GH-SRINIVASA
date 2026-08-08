import { LEADER_CATEGORY_META, leadersSeed } from "@/data/leadersSeed";

const STORAGE_KEY = "mla_leaders_v2";

function uid() {
  return `ldr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll() {
  if (typeof window === "undefined") return [...leadersSeed];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leadersSeed));
      return [...leadersSeed];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...leadersSeed];
  } catch {
    return [...leadersSeed];
  }
}

function writeAll(rows) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

/** Digits-only phone; strip leading 0 / country code for display helpers */
export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/** WhatsApp chat URL with India country code (no double 91). */
export function whatsappChatUrl(phoneOrWhatsapp) {
  let digits = digitsOnly(phoneOrWhatsapp);
  if (!digits) return null;
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("91") && digits.length >= 12) {
    // already has country code
  } else if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (!digits.startsWith("91")) {
    digits = `91${digits}`;
  }
  return `https://wa.me/${digits}`;
}

export function telHref(phone) {
  const digits = digitsOnly(phone);
  return digits ? `tel:${digits}` : null;
}

function withCategoryLabels(payload) {
  const meta = LEADER_CATEGORY_META[payload.category] || LEADER_CATEGORY_META.party;
  return {
    ...payload,
    categoryKn: meta.categoryKn,
    categoryEn: meta.categoryEn,
  };
}

export function getActiveLeaders() {
  return readAll()
    .filter((r) => !r.archivedAt)
    .sort((a, b) => Number(Boolean(b.isImportant)) - Number(Boolean(a.isImportant)));
}

export function getAllLeaders() {
  return readAll();
}

export function addLeader(input) {
  const now = new Date().toISOString();
  const row = withCategoryLabels({
    id: uid(),
    nameKn: (input.nameKn || "").trim(),
    nameEn: (input.nameEn || "").trim(),
    roleKn: (input.roleKn || "").trim(),
    roleEn: (input.roleEn || "").trim(),
    category: input.category || "party",
    locationKn: (input.locationKn || "").trim(),
    phone: digitsOnly(input.phone),
    whatsapp: digitsOnly(input.whatsapp || input.phone),
    photo: (input.photo || "").trim() || "/cm_photo.png",
    bioKn: (input.bioKn || "").trim(),
    isImportant: Boolean(input.isImportant),
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  const all = readAll();
  all.unshift(row);
  writeAll(all);
  return row;
}

export function updateLeader(id, input) {
  const all = readAll();
  const idx = all.findIndex((r) => String(r.id) === String(id));
  if (idx < 0) return null;
  const prev = all[idx];
  const next = withCategoryLabels({
    ...prev,
    nameKn: (input.nameKn ?? prev.nameKn ?? "").trim(),
    nameEn: (input.nameEn ?? prev.nameEn ?? "").trim(),
    roleKn: (input.roleKn ?? prev.roleKn ?? "").trim(),
    roleEn: (input.roleEn ?? prev.roleEn ?? "").trim(),
    category: input.category || prev.category || "party",
    locationKn: (input.locationKn ?? prev.locationKn ?? "").trim(),
    phone: digitsOnly(input.phone ?? prev.phone),
    whatsapp: digitsOnly(input.whatsapp ?? input.phone ?? prev.whatsapp),
    photo: (input.photo ?? prev.photo ?? "").trim() || "/cm_photo.png",
    bioKn: (input.bioKn ?? prev.bioKn ?? "").trim(),
    isImportant: Boolean(input.isImportant ?? prev.isImportant),
    updatedAt: new Date().toISOString(),
  });
  all[idx] = next;
  writeAll(all);
  return next;
}

/** Soft-archive (hide) — matches other modules’ archive semantics */
export function archiveLeader(id) {
  const all = readAll();
  const idx = all.findIndex((r) => String(r.id) === String(id));
  if (idx < 0) return false;
  all[idx] = {
    ...all[idx],
    archivedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
  return true;
}
