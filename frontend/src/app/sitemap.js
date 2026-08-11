import { getSiteUrl } from "@/lib/seo";

/** Public routes indexed for search engines. */
const PUBLIC_PATHS = [
  "/",
  "/medical-referral",
  "/login",
];

/** @returns {import('next').MetadataRoute.Sitemap} */
export default function sitemap() {
  const base = getSiteUrl();
  const now = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
