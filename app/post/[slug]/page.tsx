import type { Metadata } from "next";
import { notFound } from "next/navigation";
import posts from "@/content/posts.json";
import PostPage, { type Post } from "@/components/pages/PostPage";
import { site } from "@/content/site";

type Params = { slug: string };
const all = posts as Post[];

export function generateStaticParams(): Params[] {
  return all.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = all.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: { absolute: p.seoTitle || p.title },
    description: p.description,
    alternates: { canonical: `/post/${p.canonical || p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.description, publishedTime: p.date, modifiedTime: p.modified, images: p.cover ? [{ url: p.cover }] : undefined },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();
  const related = all.filter((x) => x.slug !== p.slug && !x.canonical && x.slug !== p.canonical).slice(0, 3).map(({ slug, title, description, date, readTime, cover, author }) => ({ slug, title, description, date, readTime, cover, author }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.modified || p.date,
    author: { "@type": "Organization", name: p.author },
    publisher: { "@type": "Organization", name: "Revolt", url: site.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/post/${p.canonical || p.slug}` },
    image: p.cover ? `${site.url}${p.cover}` : undefined,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PostPage post={p} related={related} />
    </>
  );
}
