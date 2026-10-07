import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { systems, subServices, systemBySlug, subServiceBySlug } from "@/content/services";
import { liveSystem, richPage, richRoutes } from "@/content/live";
import SystemPage from "@/components/pages/SystemPage";
import RichPageView from "@/components/pages/RichPageView";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";

/**
 * Top-level slugs: the four systems, the services that live at the root (Google profile, social setup, website
 * approach) and the local SEO / web design city pages.
 */
type Params = { slug: string };

const rootServices = subServices.filter((s) => !s.slug.slice(1).includes("/"));
const cityRoutes = () => richRoutes().filter((r) => !r.slice(1).includes("/") && r !== "/privacypolicy" && !rootServices.some((s) => s.slug === r));

export function generateStaticParams(): Params[] {
  return [...systems.map((s) => s.slug), ...rootServices.map((s) => s.slug), ...cityRoutes()].map((r) => ({ slug: r.slice(1) }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return seoFor(`/${slug}`);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const path = `/${slug}`;
  const sys = systemBySlug(path), sysPage = liveSystem(path);
  const sub = subServiceBySlug(path);
  const rich = richPage(path);
  let view: React.ReactNode = null;
  if (sys && sysPage) view = <SystemPage page={sysPage} system={sys} />;
  else if (rich) view = <RichPageView page={rich} diagram={sub?.diagram} />;
  else notFound();
  return (
    <>
      <JsonLd route={path} />
      {view}
    </>
  );
}
