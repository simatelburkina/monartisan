import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/data/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const categories = await getCategories();

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/artisans`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
    ...categories.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
