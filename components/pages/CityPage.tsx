"use client";

import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import StrategyCall from "@/components/sections/StrategyCall";
import { useReveals } from "@/components/motion/useReveals";
import Accordion from "@/components/ui/Accordion";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

export type City = {
  slug: string;
  kind: "seo" | "web";
  city: string;
  title: string;
  description: string;
  h1: string;
  standfirst: string;
  intro: string[];
  heroImage: string | null;
  sections: { title: string; paragraphs: string[]; bullets: string[]; image: string | null }[];
  faq: { q: string; a: string }[];
};

/**
 * The local SEO and web design pages for Greater Toronto cities, kept for the search traffic they earn.
 * Typographic compositions: the city name set large, the copy as editorial sections, the FAQ as an accordion.
 */
export default function CityPage({ city }: { city: City }) {
  const intro = useReveals<HTMLElement>();
  const body = useReveals<HTMLElement>();
  const faq = useReveals<HTMLElement>();
  const service = city.kind === "seo" ? "SEO services" : "Web design";
  const related = city.kind === "seo" ? { label: "SEO for golf venues", href: "/growth-marketing-systems/seo-ranking" } : { label: "Our website design approach", href: "/website-design-approach" };
  return (
    <main id="main">
      <PageHero
        title={city.h1}
        standfirst={city.standfirst}
        eyebrow={`${service} · ${city.city}, Ontario`}
        crumbs={[{ label: "Services", href: "/services" }, { label: city.city, href: `/${city.slug}` }]}
        titleClass="t-display-l"
        aside={
          <Link href="/contact-us" data-label="Free Strategy Call" className="btn">
            Book a free strategy call
            <Arrow />
          </Link>
        }
      />

      <section ref={intro} data-theme="paper" className="relative" aria-label="Introduction">
        <div className="wrap sect">
          <div className="grid-12 gap-y-10">
            <div className="col-span-12 lg:col-span-5">
              <p className="t-display-xl text-ink" data-split>{city.city}</p>
              <dl className="mt-8 max-w-[36ch] border-t border-line" data-reveal>
                {[["Service", service], ["Area", `${city.city}, Ontario`], ["Next step", "Free strategy call"]].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[9ch_1fr] gap-4 border-b border-line py-3">
                    <dt className="t-small t-muted">{k}</dt>
                    <dd className="t-small font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-4">
              {city.intro.map((p, i) => (
                <p key={i} className={`t-standfirst ${i === 0 ? "text-ink" : "t-muted mt-6"}`} data-reveal data-delay={String(i * 0.08)}>{p}</p>
              ))}
              <Link href={related.href} className="link-quiet t-small mt-8 inline-flex items-center gap-2 font-medium">
                {related.label}
                <Arrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section ref={body} data-theme="ink" className="relative" aria-label="Details">
        <div className="wrap sect">
          {city.sections.map((sec, i) => (
            <div key={sec.title} className={`grid-12 gap-y-6 py-12 lg:py-16 ${i === 0 ? "border-t" : ""} border-b border-line-dark`}>
              <div className="col-span-12 lg:col-span-5">
                <span className="t-mono t-small t-green">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="t-display-m mt-3 max-w-[18ch]" data-split>{sec.title}</h2>
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                {sec.paragraphs.map((p, k) => (
                  <p key={k} className={`t-body t-muted max-w-[58ch] ${k > 0 ? "mt-5" : ""}`} data-reveal>{p}</p>
                ))}
                {sec.bullets.length > 0 && (
                  <ul className={`max-w-[58ch] ${sec.paragraphs.length ? "mt-7" : ""}`} data-reveal-group>
                    {sec.bullets.map((b, k) => (
                      <li key={b} className="grid grid-cols-[3ch_1fr] gap-4 border-t border-line-dark py-3.5 first:border-t-0">
                        <span aria-hidden="true" className="t-mono t-small t-green pt-[0.15em]">{String(k + 1).padStart(2, "0")}</span>
                        <span className="t-body">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {city.faq.length > 0 && (
        <section ref={faq} data-theme="paper-2" className="relative" aria-labelledby="faq-title">
          <div className="wrap sect">
            <div className="grid-12 gap-y-10">
              <div className="col-span-12 lg:col-span-4">
                <div className="lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
                  <TracerMark />
                  <h2 id="faq-title" className="t-display-m mt-5 max-w-[12ch]" data-split>Questions, answered.</h2>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-7 lg:col-start-6" data-reveal>
                <Accordion items={city.faq} />
              </div>
            </div>
          </div>
        </section>
      )}

      <StrategyCall />
    </main>
  );
}
