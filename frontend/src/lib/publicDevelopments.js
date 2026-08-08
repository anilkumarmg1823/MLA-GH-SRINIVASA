import { api } from "@/lib/api";

/** Map API development rows into the landing map project shape */
export function mapDevToProject(row, index = 0) {
  const amount = Number(row.amountSanctioned) || 0;
  const lakhs = (amount / 100000).toFixed(2);
  const status = row.status || "Ongoing";
  const statusLabel =
    status === "Completed"
      ? "ಪೂರ್ಣಗೊಂಡಿದೆ"
      : status === "Proposed"
        ? "ಪ್ರಸ್ತಾವಿತ"
        : "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ";
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
  const gpKey = String(gp || "").toLowerCase().trim();
  const villageKey = String(village || "").toLowerCase().trim();
  return (rows || []).filter((p) => {
    // GP chip/pin must match gramPanchayat only (not village name)
    const matchesGp =
      !gpKey ||
      gpKey === "all" ||
      String(p.gp || "").toLowerCase() === gpKey;
    const matchesVillage =
      !villageKey ||
      String(p.destGp || "").toLowerCase() === villageKey;
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
  const all = [];
  let page = 1;
  const pageSize = 200;
  try {
    while (page <= 40) {
      const qs = new URLSearchParams({
        limit: String(pageSize),
        page: String(page),
        light: "1",
        ...cleaned,
      });
      const { data, meta } = await api(`/developments/public?${qs}`, {
        token: null,
      });
      const rows = Array.isArray(data) ? data : [];
      all.push(...rows);
      const total = Number(meta?.total) || 0;
      if (!rows.length) break;
      if (total > 0 && all.length >= total) break;
      if (rows.length < pageSize) break;
      page += 1;
    }
    return all.map(mapDevToProject);
  } catch {
    return [];
  }
}
