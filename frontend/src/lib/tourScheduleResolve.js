/**
 * Resolve which tour schedule sheet to show for a given YYYY-MM-DD.
 * Exact day wins; otherwise use the most recent upload on or before that date;
 * otherwise the global fallback image.
 */
export function resolveTourScheduleForDate(
  dateStr,
  schedules = [],
  fallbackImage = ""
) {
  const list = (schedules || [])
    .filter((s) => s?.date && s?.imageUrl)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const exact = list.find((s) => s.date === dateStr);
  if (exact) {
    return { ...exact, source: "exact" };
  }

  let recent = null;
  for (const s of list) {
    if (s.date <= dateStr) recent = s;
    else break;
  }
  if (recent) {
    return { ...recent, source: "recent" };
  }

  if (fallbackImage) {
    return {
      id: null,
      date: dateStr,
      imageUrl: fallbackImage,
      title: "",
      titleKn: "",
      source: "fallback",
    };
  }

  return null;
}

export function resolveTourImageForDate(
  dateStr,
  schedules = [],
  fallbackImage = ""
) {
  return (
    resolveTourScheduleForDate(dateStr, schedules, fallbackImage)?.imageUrl ||
    fallbackImage ||
    ""
  );
}
