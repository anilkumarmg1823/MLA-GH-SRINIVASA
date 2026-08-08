/**
 * Shared HTTP helpers for integration + flow tests.
 * Supports remote hosts (e.g. Render) with wake + retry on flaky edge 404/5xx.
 */
export function apiBase() {
  return (process.env.API_BASE || "http://localhost:4000").replace(/\/$/, "");
}

export function isRemoteApi() {
  return !/localhost|127\.0\.0\.1/i.test(apiBase());
}

export function apiUrl(path = "") {
  const base = `${apiBase()}/api/v1`;
  if (!path) return base;
  return path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** True when response looks like a proxy/edge miss, not our JSON API error. */
function isTransientMiss(status, json, rawText) {
  if (status === 502 || status === 503 || status === 504) return true;
  if (status !== 404) return false;
  if (json && (json.error || json.data !== undefined)) return false;
  const t = String(rawText || "").trim();
  return t === "Not Found" || t.startsWith("<!DOCTYPE") || t === "";
}

export async function req(
  path,
  { method = "GET", body, token, formData, retries } = {}
) {
  const attempts = retries ?? (isRemoteApi() ? 10 : 1);
  let last = null;

  for (let i = 0; i < attempts; i++) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body != null && !formData) headers["Content-Type"] = "application/json";

    // Rebuild FormData is not possible after a failed send — skip retries for multipart
    const res = await fetch(apiUrl(path), {
      method,
      headers,
      body: formData
        ? formData
        : body == null
          ? undefined
          : JSON.stringify(body),
    });

    const rawText = await res.text();
    let json = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      json = null;
    }

    last = { res, json, rawText };

    if (
      isTransientMiss(res.status, json, rawText) &&
      i < attempts - 1 &&
      !formData
    ) {
      if (isRemoteApi() && i === 0) {
        console.warn(
          `      retry ${path} after transient ${res.status} (Render flake)`
        );
      }
      await sleep(2000 + i * 800);
      continue;
    }

    // Re-wrap Response-like with ok/status for callers that use res.ok
    return {
      res: {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
      },
      json,
    };
  }

  return {
    res: {
      ok: last.res.ok,
      status: last.res.status,
      statusText: last.res.statusText,
    },
    json: last.json,
  };
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
  const attempts = isRemoteApi() ? 20 : 1;
  const delayMs = isRemoteApi() ? 3000 : 0;
  let last = "unknown";

  for (let i = 0; i < attempts; i++) {
    try {
      const health = await fetch(`${apiBase()}/health`);
      const text = await health.text();
      last = `${health.status} ${text.slice(0, 80)}`;
      if (health.ok) {
        if (isRemoteApi()) {
          // Warm a couple of routes so first real test is less flaky
          await fetch(apiUrl("/landing")).catch(() => {});
          await fetch(apiUrl("/developments/public")).catch(() => {});
        }
        return;
      }
    } catch (err) {
      last = err.message;
    }
    if (i < attempts - 1) await sleep(delayMs);
  }

  throw new Error(
    `API not reachable at ${apiBase()} (last: ${last}). Start backend: npm run start`
  );
}
