import type { MetadataRoute } from "next";
import { SITE_URL, fetchApprovedProductIds } from "../lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/plans`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/suporte`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productIds = await fetchApprovedProductIds();
  const productPages: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${SITE_URL}/anuncio/${id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
