import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { subServices, systemBySlug, subServiceBySlug } from "@/content/services";
import SubServicePage from "@/components/pages/SubServicePage";

/** Nested sub-service pages: /growth-marketing-systems/seo-ranking and friends. */
type Params = { slug: string; sub: string };

export function generateStaticParams(): Params[] {
  return subServices.filter((s) => s.slug.slice(1).includes("/")).map((s) => { const [slug, sub] = s.slug.slice(1).split("/"); return { slug, sub }; });
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, sub } = await params;
  const s = subServiceBySlug(`/${slug}/${sub}`);
  if (!s) return {};
  return { title: { absolute: s.seoTitle }, description: s.description, alternates: { canonical: s.slug } };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug, sub } = await params;
  const s = subServiceBySlug(`/${slug}/${sub}`);
  if (!s) notFound();
  return <SubServicePage service={s} system={systemBySlug(s.parent)!} />;
}
