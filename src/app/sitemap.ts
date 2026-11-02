import type { MetadataRoute } from "next";
import { nav, site } from "@/content/site";
import { listNews } from "@/lib/news";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = nav.map((n) => ({
    url: `${site.url}${n.href === "/" ? "" : n.href}`,
    changeFrequency: "weekly",
    priority: n.href === "/" ? 1 : 0.7,
  }));
  const posts = (await listNews()).map((p) => ({
    url: `${site.url}/news/${p.slug}`,
    lastModified: p.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...posts];
}
