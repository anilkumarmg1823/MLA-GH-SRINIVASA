import { DOC_ROOTS } from "@/data/departmentDocumentTypes";
import { api, apiUpload } from "@/lib/api";

export const MAX_FILE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB
const LIST_LIMIT = 100;

function normalizeDoc(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    dataUrl: doc.dataUrl || doc.url,
  };
}

export async function loadDepartmentRecords(params = {}) {
  const qs = new URLSearchParams({ limit: String(LIST_LIMIT), ...params });
  const { data } = await api(`/department-documents?${qs}`);
  return (Array.isArray(data) ? data : []).map(normalizeDoc);
}

export async function getAllDepartmentRecords() {
  return loadDepartmentRecords();
}

export async function getDocumentsForCategory(root, category) {
  return loadDepartmentRecords({ root, category });
}

export async function countByRootCategory() {
  const list = await loadDepartmentRecords();
  const counts = {};
  DOC_ROOTS.forEach((root) => {
    counts[root.id] = {};
    root.categories.forEach((cat) => {
      counts[root.id][cat.id] = list.filter(
        (d) => d.root === root.id && d.category === cat.id
      ).length;
    });
  });
  return counts;
}

export async function addDepartmentRecord(record) {
  const fd = new FormData();
  fd.append("root", record.root);
  fd.append("category", record.category);
  fd.append("title", record.title || "");
  if (record.titleKn) fd.append("titleKn", record.titleKn);
  if (record.status) fd.append("status", record.status);
  if (record.eGeneratedId) fd.append("eGeneratedId", record.eGeneratedId);
  if (!(record.file instanceof File)) {
    throw new Error("FILE_REQUIRED");
  }
  fd.append("file", record.file);
  const { data } = await apiUpload("/department-documents", fd);
  return normalizeDoc(data);
}

export async function updateDepartmentRecord(id, patch) {
  if (patch.status) {
    const { data } = await api(`/department-documents/${id}/status`, {
      method: "PATCH",
      body: { status: patch.status },
    });
    const next = normalizeDoc(data);
    if (next.root === "follow_ups" && patch.status) {
      next.category = patch.status;
    }
    return next;
  }
  return null;
}

export async function deleteDepartmentRecord(id) {
  await api(`/department-documents/${id}`, { method: "DELETE" });
  return true;
}

/** @deprecated Prefer uploading File via addDepartmentRecord */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file"));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error("FILE_TOO_LARGE"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.readAsDataURL(file);
  });
}
