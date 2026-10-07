import type { Metadata } from "next";
import { notFound } from "next/navigation";
import posts from "@/content/posts.json";
import PostPage, { type Post } from "@/components/pages/PostPage";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";
import { blogDate } from "@/lib/dates";

type Params = { slug: string };
const all = posts as Omit<Post, "dateText">[];

export function generateStaticParams(): Params[] {
  return all.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return seoFor(`/post/${slug}`);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();
  // Recent Posts: the three newest others, as the live blog shows them
  const recent = all.filter((x) => x.slug !== p.slug).slice(0, 3).map(({ slug, title, excerpt, date, readTime, cover, author }) => ({ slug, title, excerpt, date, dateText: blogDate(date), readTime, cover, author }));
  return (
    <>
      <JsonLd route={`/post/${p.slug}`} />
      <PostPage post={{ ...p, dateText: blogDate(p.date) }} recent={recent} />
    </>
  );
}
