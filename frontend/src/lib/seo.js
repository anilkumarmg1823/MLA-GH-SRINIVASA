/** Site-wide SEO defaults — update SITE_URL after you attach a domain. */

export const SITE_NAME = "Dr. Srinivas N. T. — MLA Kudligi";
export const SITE_NAME_SHORT = "MLA Kudligi";
export const MLA_NAME = "Dr. Srinivas N. T.";
export const CONSTITUENCY = "Kudligi";
export const DISTRICT = "Vijayanagara";
export const STATE = "Karnataka";
export const COUNTRY = "IN";

export const DEFAULT_TITLE = "Dr. Srinivas N. T. | MLA Kudligi Official Portal";
export const DEFAULT_DESCRIPTION =
  "Official digital portal of Dr. Srinivas N. T., MLA Kudligi (Vijayanagara, Karnataka). Constituency developments, Gram Panchayat works, complaints, medical referrals, and transparent governance in Kannada & English.";

export const KEYWORDS = [
  "MLA Kudligi",
  "Dr Srinivas NT",
  "ಕೂಡ್ಲಿಗಿ ಶಾಸಕ",
  "Kudligi constituency",
  "Vijayanagara",
  "Karnataka MLA",
  "Gram Panchayat Kudligi",
  "MLA office portal",
];

/** Prefer env; falls back for local/IP testing until domain is purchased. */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const OG_IMAGE_PATH = "/mla_kudligi_official_poster.jpg";

export function buildJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "GovernmentOrganization",
        "@id": `${url}/#office`,
        name: "Office of the MLA, Kudligi",
        alternateName: ["ಕೂಡ್ಲಿಗಿ ಶಾಸಕರ ಕಚೇರಿ", SITE_NAME_SHORT],
        url,
        logo: `${url}/icon.png`,
        image: `${url}${OG_IMAGE_PATH}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: CONSTITUENCY,
          addressRegion: STATE,
          addressCountry: COUNTRY,
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: `${CONSTITUENCY} Assembly Constituency`,
        },
      },
      {
        "@type": "Person",
        "@id": `${url}/#mla`,
        name: MLA_NAME,
        jobTitle: "Member of Legislative Assembly",
        worksFor: { "@id": `${url}/#office` },
        image: `${url}/mla_about_hd_cutout.png`,
        url,
        address: {
          "@type": "PostalAddress",
          addressLocality: CONSTITUENCY,
          addressRegion: STATE,
          addressCountry: COUNTRY,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": `${url}/#office` },
        inLanguage: ["kn", "en"],
      },
    ],
  };
}
