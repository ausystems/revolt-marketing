import type { MetadataRoute } from "next";
import { systems, subServices } from "@/content/services";
import cities from "@/content/cities.json";
import posts from "@/content/posts.json";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const u = (p: string, priority = 0.6, lastModified: Date | string = now) => ({ url: `${site.url}${p}`, lastModified, priority, changeFrequency: "monthly" as const });
  return [
    u("/", 1), u("/services", 0.9), u("/about-us", 0.7), u("/contact-us", 0.9), u("/blog", 0.7), u("/privacypolicy", 0.2),
    ...systems.map((s) => u(s.slug, 0.85)),
    ...subServices.map((s) => u(s.slug, 0.7)),
    ...(cities as { slug: string }[]).map((c) => u(`/${c.slug}`, 0.4)),
    ...(posts as { slug: string; canonical?: string; modified: string; date: string }[]).filter((p) => !p.canonical).map((p) => u(`/post/${p.slug}`, 0.5, p.modified || p.date || now)),
  ];
}
