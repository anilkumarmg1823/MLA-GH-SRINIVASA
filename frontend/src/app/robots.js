import { getSiteUrl } from "@/lib/seo";

/** @returns {import('next').MetadataRoute.Robots} */
export default function robots() {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/e/", "/dashboard/", "/login", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
