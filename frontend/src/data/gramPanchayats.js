/**
 * Gram Panchayat → Villages master (hydrated from API / DB).
 * Do not ship the full list in the JS bundle — see lib/locations.js.
 */

/** Mutable list filled by `hydrateGramPanchayats` after `/locations/tree` loads. */
export const gramPanchayats = [];

/** Replace in-place so existing imports keep working. */
export function hydrateGramPanchayats(list) {
  gramPanchayats.length = 0;
  if (!Array.isArray(list)) return;
  for (const gp of list) {
    gramPanchayats.push({
      name: gp.name,
      nameKn: gp.nameKn || gp.name,
      villages: Array.isArray(gp.villages)
        ? gp.villages.map((v) => ({
            name: v.name,
            nameKn: v.nameKn || v.name,
          }))
        : [],
    });
  }
}

/** Kudligi constituency overview figures for admin dashboard */
export const CONSTITUENCY_POPULATION = 268420;

export function getGramPanchayatCount() {
  return gramPanchayats.length;
}

export function getVillageCount() {
  return gramPanchayats.reduce((sum, gp) => sum + (gp.villages?.length || 0), 0);
}

export function getVillagesForGp(gpName) {
  const gp = gramPanchayats.find((g) => g.name === gpName);
  return gp ? gp.villages : [];
}

export function getGpLabel(gpName, lang) {
  const gp = gramPanchayats.find((g) => g.name === gpName);
  if (!gp) return gpName;
  return lang === "kn" ? gp.nameKn : gp.name;
}

export function getVillageLabel(gpName, villageName, lang) {
  const villages = getVillagesForGp(gpName);
  const v = villages.find((x) => x.name === villageName);
  if (!v) return villageName;
  return lang === "kn" ? v.nameKn : v.name;
}
