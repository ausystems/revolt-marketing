import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { systems, subServices, systemBySlug, subServiceBySlug } from "@/content/services";
import cities from "@/content/cities.json";
import SystemPage from "@/components/pages/SystemPage";
import SubServicePage from "@/components/pages/SubServicePage";
import CityPage, { type City } from "@/components/pages/CityPage";

/**
 * Top-level slugs: the four systems, the sub-services that live at the root
 * (Google profile, social setup, website approach) and the local SEO / web design city pages.
 */
type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return [
    ...systems.map((s) => ({ slug: s.slug.slice(1) })),
    ...subServices.filter((s) => !s.slug.slice(1).includes("/")).map((s) => ({ slug: s.slug.slice(1) })),
    ...(cities as City[]).map((c) => ({ slug: c.slug })),
  ];
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const path = `/${slug}`;
  const sys = systemBySlug(path);
  if (sys) return { title: { absolute: sys.seoTitle }, description: sys.description, alternates: { canonical: path }, openGraph: { title: sys.seoTitle, description: sys.description, images: [{ url: sys.image }] } };
  const sub = subServiceBySlug(path);
  if (sub) return { title: { absolute: sub.seoTitle }, description: sub.description, alternates: { canonical: path } };
  const city = (cities as City[]).find((c) => c.slug === slug);
  if (city) return { title: { absolute: city.title }, description: city.description, alternates: { canonical: path } };
  return {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const path = `/${slug}`;
  const sys = systemBySlug(path);
  if (sys) return <SystemPage system={sys} />;
  const sub = subServiceBySlug(path);
  if (sub) return <SubServicePage service={sub} system={systemBySlug(sub.parent)!} />;
  const city = (cities as City[]).find((c) => c.slug === slug);
  if (city) return <CityPage city={city} />;
  notFound();
}
