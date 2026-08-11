import { api, setToken, clearToken } from "@/lib/api";
import { canModule } from "@/lib/permissionsStore";
import { encodeRoute } from "@/lib/routeEncoder";

const SESSION_KEY = "mla_session";
const EPOCH_KEY = "mla_auth_epoch";

export function bumpAuthEpoch() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EPOCH_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function setSession(session) {
  if (typeof window === "undefined") return;
  if (session?.token) setToken(session.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  bumpAuthEpoch();
  try {
    sessionStorage.removeItem("mla_kicked");
    sessionStorage.setItem(
      "mla_seen_epoch",
      localStorage.getItem(EPOCH_KEY) || ""
    );
  } catch {
    /* ignore */
  }
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Keep mla_token aligned so API Authorization never drops mid-session
    if (session?.token) setToken(session.token);
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  clearToken();
  localStorage.removeItem(SESSION_KEY);
  bumpAuthEpoch();
  try {
    sessionStorage.removeItem("mla_kicked");
    sessionStorage.setItem(
      "mla_seen_epoch",
      localStorage.getItem(EPOCH_KEY) || ""
    );
  } catch {
    /* ignore */
  }
}

/** True when another tab took over the browser session */
export function wasSessionReplaced() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem("mla_kicked") === "1";
  } catch {
    return false;
  }
}

export function canAccessDevelopment(session) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return canModule(session, "development", "view");
}

export function canAccessDepartmentRecords(session) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return canModule(session, "department_records", "view");
}

export function canAccessDemands(session) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return canModule(session, "demands", "view");
}

export function canAccessAssemblyQa(session) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return canModule(session, "assembly_qa", "view");
}

export function canDo(session, moduleId, action) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return canModule(session, moduleId, action);
}

/** Prefer selected role if permitted; otherwise first module with view access */
export function resolveStaffRole(preferredRole, permissions) {
  const mods = permissions || {};
  const can = (id) => {
    const p = mods[id];
    return Boolean(p?.view || p?.add || p?.edit || p?.download);
  };
  const order = [
    "development",
    "department_records",
    "demands",
    "assembly_qa",
  ];
  if (preferredRole && can(preferredRole)) return preferredRole;
  for (const id of order) {
    if (can(id)) return id;
  }
  return preferredRole || "staff";
}

export function buildStaffSession({
  phone,
  role,
  name,
  nameKn,
  permissions,
  token,
  id,
}) {
  const digits = String(phone || "").replace(/\D/g, "");
  const resolvedRole = resolveStaffRole(role, permissions);
  return {
    id,
    token,
    role: resolvedRole,
    phone: digits,
    name: name || "Staff User",
    nameKn: (nameKn || "").trim() || name || "ಸಿಬ್ಬಂದಿ",
    permissions: permissions || undefined,
  };
}

export async function loginAdmin(email, password) {
  const { data } = await api("/auth/admin/login", {
    method: "POST",
    body: { email, password },
    token: null,
  });
  const session = {
    token: data.token,
    id: data.user.id,
    role: "admin",
    email: data.user.email,
    name: data.user.name,
    nameKn: data.user.nameKn,
  };
  setSession(session);
  return session;
}

/**
 * Step 1: registered staff only.
 * Returns needsScan + QR on first login; code-only on later logins.
 */
export async function beginStaffLogin(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const { data } = await api("/auth/staff/begin-login", {
    method: "POST",
    body: { phone: digits },
    token: null,
  });
  return data;
}

/** Step 2: phone + Authenticator TOTP (no SMS). */
export async function verifyStaffTotp({ phone, otp, role }) {
  const digits = String(phone || "").replace(/\D/g, "");
  const { data } = await api("/auth/staff/verify-totp", {
    method: "POST",
    body: { phone: digits, otp, role },
    token: null,
  });
  const session = buildStaffSession({
    id: data.user.id,
    phone: data.user.phone,
    role: role || data.user.role,
    name: data.user.name,
    nameKn: data.user.nameKn,
    permissions: data.user.permissions,
    token: data.token,
  });
  setSession(session);
  return session;
}

/** Home route for the logged-in role (not the public landing page) */
export function getRoleDashboardPath(session) {
  if (!session?.role) return "/login";
  if (session.role === "admin") return "/dashboard";
  if (session.role === "development") return "/dashboard/development";
  if (session.role === "department_records") {
    return "/dashboard/department-records";
  }
  if (session.role === "demands") return "/dashboard/demands";
  if (session.role === "assembly_qa") return "/dashboard/assembly-qa";
  return "/dashboard";
}
