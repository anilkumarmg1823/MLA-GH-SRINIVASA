import { STAFF_ROLES } from "@/data/mockUsers";
import { api } from "@/lib/api";

/** Action flags per module */
export const ACCESS_ACTIONS = [
  { id: "view", labelEn: "View", labelKn: "ನೋಡಿ", hintEn: "Can open this portal", hintKn: "ಈ ಪೋರ್ಟಲ್ ತೆರೆಯಬಹುದು" },
  { id: "add", labelEn: "Add", labelKn: "ಸೇರಿಸಿ", hintEn: "Can create new records", hintKn: "ಹೊಸ ದಾಖಲೆ ಸೇರಿಸಬಹುದು" },
  { id: "edit", labelEn: "Edit", labelKn: "ಸಂಪಾದಿಸಿ", hintEn: "Can change existing records", hintKn: "ಇರುವ ದಾಖಲೆ ಬದಲಾಯಿಸಬಹುದು" },
  { id: "delete", labelEn: "Delete", labelKn: "ಅಳಿಸಿ", hintEn: "Can remove records", hintKn: "ದಾಖಲೆ ಅಳಿಸಬಹುದು" },
  { id: "download", labelEn: "Download", labelKn: "ಡೌನ್‌ಲೋಡ್", hintEn: "Can download / export", hintKn: "ಡೌನ್‌ಲೋಡ್ / ಎಕ್ಸ್‌ಪೋರ್ಟ್" },
];

export const MANAGEABLE_MODULES = STAFF_ROLES.filter((r) => r.enabled).map(
  (r) => ({
    id: r.id,
    labelEn: r.labelEn,
    labelKn: r.labelKn,
  })
);

function emptyModulePerms() {
  return {
    view: false,
    add: false,
    edit: false,
    delete: false,
    download: false,
  };
}

function fullModulePerms() {
  return {
    view: true,
    add: true,
    edit: true,
    delete: true,
    download: true,
  };
}

export async function loadStaffAccess() {
  const { data } = await api("/staff-access");
  return Array.isArray(data) ? data : [];
}

export async function getAllStaffAccess() {
  return loadStaffAccess();
}

export async function getStaffByPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const list = await loadStaffAccess();
  return list.find((s) => s.phone === digits) || null;
}

export async function upsertStaffAccess(record) {
  const digits = String(record.phone || "").replace(/\D/g, "");
  if (digits.length !== 10) return { ok: false, error: "INVALID_PHONE" };

  const modules = { ...(record.modules || {}) };
  MANAGEABLE_MODULES.forEach((m) => {
    modules[m.id] = {
      ...emptyModulePerms(),
      ...(modules[m.id] || {}),
    };
  });

  try {
    const { data } = await api("/staff-access", {
      method: "POST",
      body: {
        phone: digits,
        name: (record.name || "").trim() || "Staff User",
        nameKn: (record.nameKn ?? "").trim(),
        role: record.role,
        modules,
      },
    });
    return { ok: true, item: data };
  } catch (err) {
    if (err?.code === "CONFLICT" || err?.status === 409) {
      return { ok: false, error: "PHONE_TAKEN" };
    }
    throw err;
  }
}

export async function deleteStaffAccess(id) {
  await api(`/staff-access/${id}`, { method: "DELETE" });
  return true;
}

/** Admin: generate Authenticator QR for staff (returns secret once). */
export async function enrollStaffTotp(id) {
  const { data } = await api(`/staff-access/${id}/totp/enroll`, {
    method: "POST",
  });
  return data;
}

/** Admin: rotate Authenticator secret + new QR. */
export async function resetStaffTotp(id) {
  const { data } = await api(`/staff-access/${id}/totp/reset`, {
    method: "POST",
  });
  return data;
}

export function getModulePerms(session, moduleId) {
  if (!session) return emptyModulePerms();
  if (session.role === "admin") return fullModulePerms();

  const fromSession = session.permissions?.[moduleId];
  if (fromSession) {
    return { ...emptyModulePerms(), ...fromSession };
  }

  if (session.role === moduleId) return fullModulePerms();
  return emptyModulePerms();
}

export function canModule(session, moduleId, action = "view") {
  const perms = getModulePerms(session, moduleId);
  if (action === "view") {
    return Boolean(perms.view || perms.add || perms.edit || perms.download);
  }
  return Boolean(perms[action]);
}
