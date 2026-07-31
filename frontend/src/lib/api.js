const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const TOKEN_KEY = "mla_token";

export function getApiBase() {
  return API_URL.replace(/\/$/, "");
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  setToken(null);
}

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message || code || "Request failed");
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api(path, options = {}) {
  const {
    method = "GET",
    body,
    token = getToken(),
    headers: extraHeaders = {},
    formData = false,
  } = options;

  const headers = { ...extraHeaders };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body != null && !formData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    method,
    headers,
    body: body == null ? undefined : formData ? body : JSON.stringify(body),
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json?.error?.code || "HTTP_ERROR",
      json?.error?.message || res.statusText,
      json?.error?.details
    );
  }

  return {
    data: json?.data,
    meta: json?.meta,
  };
}

export async function apiUpload(path, formData, options = {}) {
  return api(path, {
    ...options,
    method: options.method || "POST",
    body: formData,
    formData: true,
  });
}
