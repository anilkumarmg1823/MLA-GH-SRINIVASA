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
  return img?.url || null;
}

export function isVideoUrl(url) {
  if (!url) return false;
  if (url.startsWith("blob:")) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}
