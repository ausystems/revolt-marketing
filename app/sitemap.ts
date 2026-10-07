import type { MetadataRoute } from "next";
import entries from "@/content/live/sitemap.json";
import posts from "@/content/posts.json";
import { site } from "@/content/site";

/** Every page served here, with the live sitemaps' own last-modified dates and, for posts, the cover image. */
export default function sitemap(): MetadataRoute.Sitemap {
  const byRoute = new Map((posts as { slug: string; cover: string | null; modified: string | null; date: string }[]).map((p) => [`/post/${p.slug}`, p]));
  return (entries as { route: string; lastmod: string | null }[]).map(({ route, lastmod }) => {
    const post = byRoute.get(route);
    const modified = lastmod ?? (post ? (post.modified || post.date).slice(0, 10) : null);
    return {
      url: route === "/" ? site.url : `${site.url}${route}`,
      ...(modified ? { lastModified: modified } : {}),
      ...(post?.cover ? { images: [`${site.url}${post.cover}`] } : {}),
    };
  });
}
