import { api, apiUpload } from "@/lib/api";

const LIST_LIMIT = 200;
const MAX_PAGES = 20;

function stripMedia(record) {
  const {
    images: _i,
    media: _m,
    id: _id,
    createdAt: _c,
    updatedAt: _u,
    ...rest
  } = record || {};
  return rest;
}

export async function loadDevelopments(params = {}) {
  const all = [];
  let page = 1;
  const light = params.light ? { light: "1" } : {};
  const { light: _l, ...rest } = params;
  while (page <= MAX_PAGES) {
    const qs = new URLSearchParams({
      limit: String(LIST_LIMIT),
      page: String(page),
      ...rest,
      ...light,
    });
    const { data, meta } = await api(`/developments?${qs}`);
    const rows = Array.isArray(data) ? data : [];
    all.push(...rows);
    const total = Number(meta?.total) || all.length;
    if (all.length >= total || rows.length < LIST_LIMIT) break;
    page += 1;
  }
  return all;
}

export async function getDevelopmentsForVillage(gramPanchayat, village) {
  return loadDevelopments({ gramPanchayat, village });
}

export async function getDevelopmentsForGp(gramPanchayat) {
  return loadDevelopments({ gramPanchayat });
}

/** Full list — prefer light=true for charts/search (no media join). */
export async function getAllDevelopments({ light = true } = {}) {
  return loadDevelopments(light ? { light: true } : {});
}

async function uploadMediaFiles(developmentId, mediaItems) {
  const files = (mediaItems || [])
    .map((m) => m.file)
    .filter((f) => f instanceof File);
  if (!files.length) return [];
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const { data } = await apiUpload(`/developments/${developmentId}/media`, fd);
  return data || [];
}

export async function addDevelopment(record) {
  const body = stripMedia(record);
  const { data } = await api("/developments", { method: "POST", body });
  if (record.media?.length) {
    await uploadMediaFiles(data.id, record.media);
    const refreshed = await api(`/developments/${data.id}`);
    return refreshed.data;
  }
  return data;
}

export async function updateDevelopment(id, patch) {
  const body = stripMedia(patch);
  const { data } = await api(`/developments/${id}`, { method: "PUT", body });
  const newFiles = (patch.media || []).filter((m) => m.file instanceof File);
  if (newFiles.length) {
    await uploadMediaFiles(id, newFiles);
    const refreshed = await api(`/developments/${id}`);
    return refreshed.data;
  }
  return data;
}

export async function deleteDevelopment(id) {
  await api(`/developments/${id}`, { method: "DELETE" });
  return true;
}
