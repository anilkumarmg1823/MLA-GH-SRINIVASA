/**
 * Probe + full flow against a remote API_BASE (e.g. Render).
 * Usage: API_BASE=https://kudligi-backend.onrender.com node scripts/probeRemote.js
 */
import "dotenv/config";

const BASE = (process.env.API_BASE || "http://localhost:4000").replace(/\/$/, "");
const API = `${BASE}/api/v1`;

async function req(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body != null) headers["Content-Type"] = "application/json";
  const res = await fetch(path.startsWith("http") ? path : API + path, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _text: text.slice(0, 300) };
  }
  return { status: res.status, json, text };
}

function brief(json) {
  if (json?._text) return json._text;
  if (Array.isArray(json?.data)) return `array n=${json.data.length}`;
  if (json?.data?.token) return "token-ok";
  if (json?.error) return JSON.stringify(json.error);
  return JSON.stringify(json).slice(0, 160);
}

async function main() {
  console.log(`Probing ${BASE}\n`);

  // Wake cold start
  for (let i = 1; i <= 5; i++) {
    const h = await req(`${BASE}/health`);
    console.log(`health try ${i}: ${h.status} ${brief(h.json)}`);
    if (h.status === 200) break;
    await new Promise((r) => setTimeout(r, 3000));
  }

  const paths = [
    ["GET", "/landing"],
    ["GET", "/developments/public"],
    ["POST", "/auth/admin/login", { email: "admin@mla.local", password: "admin123" }],
  ];

  let token = null;
  for (const [method, path, body] of paths) {
    const r = await req(path, { method, body });
    console.log(`${r.status} ${method} ${path} ${brief(r.json)}`);
    if (path.includes("login") && r.json?.data?.token) token = r.json.data.token;
  }

  if (!token) {
    console.error("\nNo admin token — cannot continue admin probes.");
    process.exit(1);
  }

  for (const path of [
    "/developments",
    "/demands",
    "/department-documents",
    "/assembly-qa",
    "/complaints",
    "/landing",
  ]) {
    const r = await req(path, { token });
    console.log(`${r.status} GET ${path} ${brief(r.json)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
