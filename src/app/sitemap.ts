import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.learn-hebrew.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [texts, grammarTopics] = await Promise.all([
    prisma.hebrewText.findMany({ select: { id: true, createdAt: true } }),
    prisma.grammarTopic.findMany({ select: { id: true, createdAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/texts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/grammar`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/register`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/support`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const textRoutes: MetadataRoute.Sitemap = texts.map((text) => ({
    url: `${BASE_URL}/texts/${text.id}`,
    lastModified: text.createdAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const grammarRoutes: MetadataRoute.Sitemap = grammarTopics.map((topic) => ({
    url: `${BASE_URL}/grammar/${topic.id}`,
    lastModified: topic.createdAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...textRoutes, ...grammarRoutes];
}
