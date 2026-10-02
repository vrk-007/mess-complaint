import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: ["/admin", "/superadmin", "/dashboard", "/onboarding", "/api/"],
    },
    sitemap: "https://messportal.vercel.app/sitemap.xml",
  };
}
