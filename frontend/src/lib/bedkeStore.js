import { api } from "@/lib/api";
import {
  buildBedkeCreatePayload,
  buildBedkeUpdatePayload,
} from "@/lib/bedkePayload";

const LIST_LIMIT = 100;

export async function loadBedke(params = {}) {
  const qs = new URLSearchParams({ limit: String(LIST_LIMIT), ...params });
  const { data } = await api(`/demands?${qs}`);
  return Array.isArray(data) ? data : [];
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
