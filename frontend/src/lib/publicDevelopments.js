import { api } from "@/lib/api";

/** Map API development rows into the landing map project shape */
export function mapDevToProject(row, index = 0) {
  const amount = Number(row.amountSanctioned) || 0;
  const lakhs = (amount / 100000).toFixed(2);
  const status = row.status || "Ongoing";
  const statusLabel =
    status === "Completed"
      ? "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)"
      : status === "Proposed"
        ? "ಪ್ರಸ್ತಾವಿತ (Proposed)"
        : "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)";
  const images = Array.isArray(row.images)
    ? row.images
    : (row.media || [])
        .filter((m) => m.type === "image" || (m.mimeType || "").startsWith("image/"))
        .map((m) => m.url);
  return {
    id: row.id || `api-${index}`,
    code: row.yojane ? String(row.yojane).slice(0, 12) : `DEV-${index + 1}`,
    name: row.nameKn || row.name,
    nameEn: row.name,
    nameKn: row.nameKn || row.name,
    gp: row.gramPanchayat,
    destGp: row.village,
    type: row.department || "Development",
    department: row.department || "",
    lengthKm: null,
    budget: amount ? `₹${lakhs} ಲಕ್ಷ` : "—",
    amountSanctioned: amount,
    status: statusLabel,
    statusRaw: status,
    description: row.description || row.details || "",
    beneficiaries: row.beneficiaries || "",
    startDate: row.startDate || "",
    locationNote: row.locationNote || "",
    images,
    _source: "api",
    _raw: row,
  };
}

export function filterDevelopmentsByVillage(rows, { gp, village, query } = {}) {
  const q = String(query || "").toLowerCase().trim();
  return (rows || []).filter((p) => {
    const matchesGp =
      !gp ||
      gp === "All" ||
      p.gp?.toLowerCase() === gp.toLowerCase() ||
      p.destGp?.toLowerCase() === gp.toLowerCase();
    const matchesVillage =
      !village ||
      p.destGp?.toLowerCase() === village.toLowerCase() ||
      p.gp?.toLowerCase() === village.toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.nameEn?.toLowerCase().includes(q) ||
      p.gp?.toLowerCase().includes(q) ||
      p.destGp?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
    return matchesGp && matchesVillage && matchesSearch;
  });
}

export async function loadPublicDevelopments(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== "" && v !== "All")
  );
  const qs = new URLSearchParams({ limit: "100", ...cleaned });
  try {
    const { data } = await api(`/developments/public?${qs}`, { token: null });
    const rows = Array.isArray(data) ? data : [];
    return rows.map(mapDevToProject);
  } catch {
    return [];
  }
}
