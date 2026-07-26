import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/reset-password", "/verify-email"],
      },
    ],
    sitemap: "https://www.learn-hebrew.online/sitemap.xml",
  };
}
