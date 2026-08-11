import { api } from "@/lib/api";
import { hydrateGramPanchayats } from "@/data/gramPanchayats";

const STORAGE_KEY = "kudligi_locations_tree_v1";
let treePromise = null;
let treeCache = null;

function readSessionTree() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSessionTree(tree) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
  } catch {
    /* quota / private mode */
  }
}

function applyTree(tree) {
  treeCache = tree;
  hydrateGramPanchayats(tree);
  writeSessionTree(tree);
  return tree;
}

/** Full GP + villages tree from DB (cached in memory + sessionStorage). */
export async function ensureLocationsTree({ force = false } = {}) {
  if (!force && treeCache?.length) return treeCache;

  if (!force) {
    const fromSession = readSessionTree();
    if (fromSession?.length) {
      return applyTree(fromSession);
    }
  }

  if (!force && treePromise) return treePromise;

  treePromise = (async () => {
    const { data } = await api("/locations/tree", { token: null });
    const tree = Array.isArray(data) ? data : [];
    return applyTree(tree);
  })().finally(() => {
    treePromise = null;
  });

  return treePromise;
}

/** Sync snapshot (may be empty until ensureLocationsTree resolves). */
export function getLocationsTreeSync() {
  return treeCache || [];
}

/** Load all Gram Panchayats (public). */
export async function loadGramPanchayats() {
  const tree = await ensureLocationsTree();
  return tree.map((gp) => ({
    name: gp.name,
    nameKn: gp.nameKn || gp.name,
    villageCount: gp.villages?.length || 0,
  }));
}

/** Load villages for a GP (public). Uses cached tree when available. */
export async function loadVillagesForGp(gpName) {
  if (!gpName) return [];
  const tree = await ensureLocationsTree();
  const gp = tree.find((g) => g.name === gpName);
  if (gp?.villages) return gp.villages;
  const { data } = await api(
    `/locations/gram-panchayats/${encodeURIComponent(gpName)}/villages`,
    { token: null }
  );
  return Array.isArray(data) ? data : [];
}
