import type { Metadata } from "next";
import posts from "@/content/posts.json";
import BlogIndex, { type PostMeta } from "@/components/pages/BlogIndex";

export const metadata: Metadata = {
  title: { absolute: "Blog | Revolt" },
  description: "Guides for golf simulator venue owners from Revolt Marketing: local SEO, Google and Meta ads, automation, memberships, corporate events and the numbers behind them.",
  alternates: { canonical: "/blog" },
};

export default function Page() {
  const list = (posts as PostMeta[]).map(({ slug, title, description, date, readTime, cover, author, canonical }) => ({ slug, title, description, date, readTime, cover, author, canonical }));
  return <BlogIndex posts={list} />;
}
