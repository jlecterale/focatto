import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas autenticadas/privadas não devem ser indexadas.
      disallow: ["/admin", "/profile", "/chat", "/meus-anuncios"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
