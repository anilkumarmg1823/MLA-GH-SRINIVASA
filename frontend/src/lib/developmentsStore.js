import { api, apiUpload } from "@/lib/api";

const LIST_LIMIT = 100;

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
  const qs = new URLSearchParams({ limit: String(LIST_LIMIT), ...params });
  const { data } = await api(`/developments?${qs}`);
  return Array.isArray(data) ? data : [];
}

export async function getDevelopmentsForVillage(gramPanchayat, village) {
  return loadDevelopments({ gramPanchayat, village });
}

export async function getDevelopmentsForGp(gramPanchayat) {
  return loadDevelopments({ gramPanchayat });
}

export async function getAllDevelopments() {
  return loadDevelopments();
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
