import { api, apiUpload } from "@/lib/api";

export const MAX_AQ_FILE_BYTES = 2.5 * 1024 * 1024;
const LIST_LIMIT = 100;

export async function loadAssemblyQa(params = {}) {
  const qs = new URLSearchParams({ limit: String(LIST_LIMIT), ...params });
  const { data } = await api(`/assembly-qa?${qs}`);
  return Array.isArray(data) ? data : [];
}

export async function getAllAssemblyQa() {
  return loadAssemblyQa();
}

export async function getAssemblyQaByAskedBy(askedBy) {
  if (!askedBy || askedBy === "all") return loadAssemblyQa();
  return loadAssemblyQa({ askedBy });
}

export async function addAssemblyQa(record) {
  const files = Array.isArray(record.files) ? record.files : [];
  const { files: _f, ...body } = record;
  const payload = {
    questionNo: (body.questionNo || "").trim(),
    sessionLabel: (body.sessionLabel || "").trim(),
    sessionDate: body.sessionDate || null,
    askedBy: body.askedBy,
    askedByName: (body.askedByName || "").trim(),
    partyName: (body.partyName || "").trim(),
    question: (body.question || "").trim(),
    questionKn: body.questionKn || "",
    answer: (body.answer || "").trim(),
    answerKn: body.answerKn || "",
    status: body.status || ((body.answer || "").trim() ? "answered" : "pending"),
  };
  const { data } = await api("/assembly-qa", { method: "POST", body: payload });

  const uploadFiles = files
    .map((f) => f.file || f)
    .filter((f) => f instanceof File);
  if (uploadFiles.length) {
    const fd = new FormData();
    uploadFiles.forEach((f) => fd.append("files", f));
    await apiUpload(`/assembly-qa/${data.id}/files`, fd);
    const refreshed = await api(`/assembly-qa/${data.id}`);
    return refreshed.data;
  }
  return data;
}

export async function updateAssemblyQa(id, patch) {
  const { files: _f, ...body } = patch || {};
  const { data } = await api(`/assembly-qa/${id}`, {
    method: "PUT",
    body,
  });
  return data;
}

export async function deleteAssemblyQa(id) {
  await api(`/assembly-qa/${id}`, { method: "DELETE" });
  return true;
}

/** Keep File objects for later multipart upload (preview via object URL). */
export async function filesToAttachments(fileList) {
  const files = Array.from(fileList || []);
  return files.map((file) => ({
    id: `aqf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    file,
    dataUrl: URL.createObjectURL(file),
  }));
}
