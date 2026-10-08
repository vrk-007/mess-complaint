import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const SITE_URL = "https://messportal.vercel.app";
const SITE_NAME = "Mess Complaint Portal";
const SITE_DESCRIPTION =
  "Easily submit and track mess food complaints at your hostel. Powered by Nexalaya — making hostel dining better, one complaint at a time.";

export const metadata: Metadata = {
  // ── Core ─────────────────────────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Hostel Mess Complaint System`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "VNIT mess portal",
    "vnit mess",
    "mess complaint portal",
    "hostel mess complaint",
    "mess food complaint",
    "hostel complaint system",
    "college mess portal",
    "university hostel mess",
    "mess complaint online",
    "Nexalaya",
    "mess portal",
    "food complaint hostel",
  ],
  authors: [{ name: "Nexalaya" }],
  creator: "Nexalaya",
  publisher: "Nexalaya",
  category: "Education",

  // ── Open Graph (WhatsApp, Facebook, LinkedIn previews) ───────────────────
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Hostel Mess Complaint System`,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
  },

  // ── Twitter / X card ─────────────────────────────────────────────────────
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | Hostel Mess Complaint System`,
    description: SITE_DESCRIPTION,
    creator: "@nexalaya",
  },

  // ── Robots ───────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
    },
  },

  // ── Canonical ────────────────────────────────────────────────────────────
  alternates: {
    canonical: SITE_URL,
  },

  // ── Icons ─────────────────────────────────────────────────────────────────
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data — helps Google show a rich result */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              provider: {
                "@type": "Organization",
                name: "Nexalaya",
              },
            }),
          }}
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
