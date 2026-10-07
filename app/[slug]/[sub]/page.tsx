import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { subServices, subServiceBySlug } from "@/content/services";
import { richPage } from "@/content/live";
import RichPageView from "@/components/pages/RichPageView";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";

/** Nested service pages: /growth-marketing-systems/seo-ranking and friends. */
type Params = { slug: string; sub: string };

export function generateStaticParams(): Params[] {
  return subServices.filter((s) => s.slug.slice(1).includes("/")).map((s) => { const [slug, sub] = s.slug.slice(1).split("/"); return { slug, sub }; });
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, sub } = await params;
  return seoFor(`/${slug}/${sub}`);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug, sub } = await params;
  const path = `/${slug}/${sub}`;
  const s = subServiceBySlug(path);
  const page = richPage(path);
  if (!s || !page) notFound();
  return (
    <>
      <JsonLd route={path} />
      <RichPageView page={page} diagram={s.diagram} />
    </>
  );
}
