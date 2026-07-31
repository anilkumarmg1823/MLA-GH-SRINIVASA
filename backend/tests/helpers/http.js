/**
 * Shared HTTP helpers for integration + flow tests.
 */
export function apiBase() {
  return (process.env.API_BASE || "http://localhost:4000").replace(/\/$/, "");
}

export function apiUrl(path = "") {
  const base = `${apiBase()}/api/v1`;
  if (!path) return base;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function req(path, { method = "GET", body, token, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body != null && !formData) headers["Content-Type"] = "application/json";
  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body: formData
      ? formData
      : body == null
        ? undefined
        : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

export async function adminLogin(
  email = "admin@mla.local",
  password = "admin123"
) {
  const { res, json } = await req("/auth/admin/login", {
    method: "POST",
    body: { email, password },
  });
  if (!res.ok || !json?.data?.token) {
    throw new Error(`admin login failed: ${res.status}`);
  }
  return json.data.token;
}

export async function assertApiUp() {
  const health = await fetch(`${apiBase()}/health`);
  if (!health.ok) {
    throw new Error(
      `API not reachable at ${apiBase()}. Start backend: npm run start`
    );
  }
}
