import type { Metadata } from "next";
import posts from "@/content/posts.json";
import BlogIndex, { type PostCard } from "@/components/pages/BlogIndex";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";
import { blogDate } from "@/lib/dates";

export const metadata: Metadata = seoFor("/blog");

type Post = Omit<PostCard, "dateText">;

export default function Page() {
  // every post, newest first, as the live feed lists them (re-posts included)
  const list = posts as Post[];
  return (
    <>
      <JsonLd route="/blog" />
      <BlogIndex posts={list.map(({ slug, title, excerpt, date, readTime, cover, author }) => ({ slug, title, excerpt, date, dateText: blogDate(date), readTime, cover, author }))} />
    </>
  );
}
