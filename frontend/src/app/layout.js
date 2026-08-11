import AppProviders from "@/components/providers/AppProviders";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  KEYWORDS,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_NAME_SHORT,
  buildJsonLd,
  getSiteUrl,
} from "@/lib/seo";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME_SHORT}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "Office of the MLA, Kudligi" }],
  creator: "Office of the MLA, Kudligi",
  publisher: "Office of the MLA, Kudligi",
  category: "government",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "kn-IN": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["kn_IN"],
    url: siteUrl,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Dr. Srinivas N. T. — MLA Kudligi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  other: {
    "geo.region": "IN-KA",
    "geo.placename": "Kudligi, Vijayanagara, Karnataka",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = buildJsonLd();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
