import { api } from "@/lib/api";
import {
  buildBedkeCreatePayload,
  buildBedkeUpdatePayload,
} from "@/lib/bedkePayload";

const LIST_LIMIT = 200;
const MAX_PAGES = 20;

export async function loadBedke(params = {}) {
  const all = [];
  const seen = new Set();
  let page = 1;
  while (page <= MAX_PAGES) {
    const qs = new URLSearchParams({
      limit: String(LIST_LIMIT),
      page: String(page),
      ...params,
    });
    const { data, meta } = await api(`/demands?${qs}`);
    const rows = Array.isArray(data) ? data : [];
    for (const row of rows) {
      if (!row?.id || seen.has(row.id)) continue;
      seen.add(row.id);
      all.push(row);
    }
    const total = Number(meta?.total) || all.length;
    if (all.length >= total || rows.length < LIST_LIMIT) break;
    page += 1;
  }
  return all;
}

export async function getAllBedke() {
  return loadBedke();
}

export async function getBedkeForVillage(gramPanchayat, village) {
  return loadBedke({ gramPanchayat, village });
}

export async function getBedkeForGp(gramPanchayat) {
  return loadBedke({ gramPanchayat });
}

export async function addBedke(record) {
  const body = buildBedkeCreatePayload(record);
  const { data } = await api("/demands", {
    method: "POST",
    body,
  });
  return data;
}

export async function updateBedke(id, patch) {
  const body = buildBedkeUpdatePayload(patch);
  const { data } = await api(`/demands/${id}`, { method: "PUT", body });
  return data;
}

export async function deleteBedke(id) {
  await api(`/demands/${id}`, { method: "DELETE" });
  return true;
}
