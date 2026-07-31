/** Pure helpers for Demands / Bedke create & update payloads */

export const BEDKE_APPROACHES = ["civil", "personal"];
export const BEDKE_STATUSES = [
  "Pending",
  "InProgress",
  "Completed",
  "Rejected",
];

export function normalizeApproach(approach) {
  return approach === "personal" ? "personal" : "civil";
}

export function normalizeStatus(status) {
  if (BEDKE_STATUSES.includes(status)) return status;
  return "Pending";
}

export function buildBedkeCreatePayload(record) {
  const name = String(record?.name || "").trim();
  const subject = String(record?.subject || "").trim();
  const gramPanchayat = String(record?.gramPanchayat || "").trim();
  const village = String(record?.village || "").trim();

  if (!gramPanchayat) throw new Error("gramPanchayat required");
  if (!village) throw new Error("village required");
  if (!name) throw new Error("name required");
  if (!subject) throw new Error("subject required");

  return {
    gramPanchayat,
    village,
    name,
    approach: normalizeApproach(record?.approach),
    subject,
    status: normalizeStatus(record?.status),
  };
}

export function buildBedkeUpdatePayload(patch) {
  const out = {};
  if (patch.gramPanchayat != null) {
    out.gramPanchayat = String(patch.gramPanchayat).trim();
  }
  if (patch.village != null) out.village = String(patch.village).trim();
  if (patch.name != null) out.name = String(patch.name).trim();
  if (patch.subject != null) out.subject = String(patch.subject).trim();
  if (patch.approach != null) out.approach = normalizeApproach(patch.approach);
  if (patch.status != null) out.status = normalizeStatus(patch.status);

  if (out.name === "") throw new Error("name required");
  if (out.subject === "") throw new Error("subject required");
  if (Object.keys(out).length === 0) throw new Error("no fields to update");
  return out;
}
