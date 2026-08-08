import { gramPanchayats } from "@/data/gramPanchayats";

/**
 * Official constituency GPs for the public development map.
 * Matches xlsx / seed developments (33 sheets). Rampura is in the
 * village master but has no kamagari sheet, so it is omitted here.
 */
const MAP_EXCLUDE = new Set(["Rampura"]);

/** Approximate pin positions on kudligi_taluk_map_v2.png (% of box) */
const PIN_XY = {
  Alur: { x: 22, y: 42 },
  Appenahalli: { x: 58, y: 28 },
  Badeladaku: { x: 34, y: 48 },
  Banavikallu: { x: 44, y: 38 },
  Bellagatta: { x: 26, y: 34 },
  Chirathagundu: { x: 70, y: 44 },
  Chowdapur: { x: 38, y: 28 },
  Gambommanahalli: { x: 50, y: 30 },
  Gudekote: { x: 82, y: 48 },
  Gundumunugu: { x: 62, y: 36 },
  Harakbavi: { x: 74, y: 58 },
  Hirehegdal: { x: 18, y: 52 },
  Hirekumbalgunte: { x: 36, y: 78 },
  Hosahalli: { x: 68, y: 58 },
  Hudem: { x: 78, y: 36 },
  Huralihal: { x: 54, y: 34 },
  Jarmali: { x: 52, y: 68 },
  Jummobanahalli: { x: 64, y: 48 },
  Kakkuppi: { x: 28, y: 62 },
  Kalapur: { x: 42, y: 58 },
  "Kudligi Constituency": { x: 48, y: 52 },
  "Kudligi Town": { x: 48, y: 46 },
  Makanadaku: { x: 20, y: 68 },
  Moraba: { x: 64, y: 72 },
  Nagarkatte: { x: 76, y: 68 },
  Nimbalagere: { x: 30, y: 70 },
  Pujarahalli: { x: 56, y: 62 },
  Ramdurga: { x: 72, y: 28 },
  Shivpur: { x: 56, y: 54 },
  Suladahalli: { x: 42, y: 72 },
  Sunkadakallu: { x: 40, y: 44 },
  Tulahalli: { x: 24, y: 76 },
  Ujjini: { x: 30, y: 75 },
};

function slugId(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Chip bar labels — English GP names in A–Z order */
export const MAP_GRAM_PANCHAYATS = gramPanchayats
  .filter((g) => !MAP_EXCLUDE.has(g.name))
  .map((g) => g.name)
  .sort((a, b) => a.localeCompare(b));

/** Map pins driven by official master + development GP names */
export const MAP_VILLAGE_PINS = MAP_GRAM_PANCHAYATS.map((name, index) => {
  const gp = gramPanchayats.find((g) => g.name === name);
  const xy = PIN_XY[name] || {
    x: 18 + (index % 8) * 9,
    y: 22 + Math.floor(index / 8) * 14,
  };
  const nameKn = gp?.nameKn || name;
  return {
    id: slugId(name),
    gpName: name,
    name: nameKn,
    fullName: `${nameKn} (${name})`,
    hobli: "Kudligi",
    x: xy.x,
    y: xy.y,
  };
});
