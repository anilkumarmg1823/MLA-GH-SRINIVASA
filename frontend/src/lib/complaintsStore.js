import { api } from "@/lib/api";

const LIST_LIMIT = 100;

export async function submitComplaint(payload) {
  const { data } = await api("/complaints", {
    method: "POST",
    body: {
      name: (payload.name || "").trim(),
      phone: String(payload.phone || "").replace(/\D/g, ""),
      village: (payload.village || "").trim(),
      subject: (payload.subject || "").trim(),
      message: (payload.message || "").trim(),
    },
    token: null,
  });
  return data;
}

export async function loadComplaints(params = {}) {
  const qs = new URLSearchParams({ limit: String(LIST_LIMIT), ...params });
  const { data } = await api(`/complaints?${qs}`);
  return Array.isArray(data) ? data : [];
}

export async function getAllComplaints() {
  return loadComplaints();
}

export async function updateComplaintStatus(id, status) {
  const { data } = await api(`/complaints/${id}`, {
    method: "PATCH",
    body: { status },
  });
  return data;
}

export async function deleteComplaint(id) {
  await api(`/complaints/${id}`, { method: "DELETE" });
  return true;
}
