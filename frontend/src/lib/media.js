/** Thematic placeholders when a development has no uploaded photo */
const DEV_COVER_DEFAULT = "/gp_building_3d_v2.png";
const DEV_COVER_BY_TOPIC = [
  {
    re: /ಶಾಲೆ|ಕಾಲೇಜ್|school|college|classroom|ಕೊಠಡಿ/i,
    src: "/gp_building_3d_v2.png",
  },
  {
    re: /ರಸ್ತೆ|ಸೇತುವೆ|road|bridge|ಸಿಸಿ/i,
    src: "/village_real.png",
  },
  {
    re: /ನೀರು|ಕೆರೆ|ಬೋರ್|tank|water|ಜಲ|ಕೊಳವೆ/i,
    src: "/village_houses_3d_v2.png",
  },
  {
    re: /ಅಂಗನವಾಡಿ|anganwadi|ಮಹಿಳಾ|women|children/i,
    src: "/sector_women_children.png",
  },
  {
    re: /ದೇವಸ್ಥಾನ|temple|ಸಮುದಾಯ|community|ಭವನ|ಶೌಚಾಲಯ/i,
    src: "/gp_office_real.png",
  },
];

export function defaultDevelopmentCover(record) {
  const blob = [
    record?.name,
    record?.nameKn,
    record?.description,
    record?.descriptionKn,
    record?.yojane,
  ]
    .filter(Boolean)
    .join(" ");
  for (const item of DEV_COVER_BY_TOPIC) {
    if (item.re.test(blob)) return item.src;
  }
  return DEV_COVER_DEFAULT;
}

/** Normalize legacy images[] into media[] { id, url, type } */
export function getRecordMedia(record) {
  if (!record) return [];
  if (Array.isArray(record.media) && record.media.length) {
    return record.media;
  }
  return (record.images || []).map((url, i) => ({
    id: `legacy-${i}-${url.slice(-12)}`,
    url,
    type: "image",
  }));
}

export function getCoverImage(record) {
  const media = getRecordMedia(record);
  const img = media.find((m) => m.type === "image");
  return img?.url || defaultDevelopmentCover(record);
}

export function isVideoUrl(url) {
  if (!url) return false;
  if (url.startsWith("blob:")) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}
