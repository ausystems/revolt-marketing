"use client";

import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import StrategyCall from "@/components/sections/StrategyCall";
import { useReveals } from "@/components/motion/useReveals";
import { Arrow } from "@/components/ui/Button";

export type PostMeta = { slug: string; title: string; description: string; date: string; readTime: string; cover: string | null; author: string; canonical?: string };

const fmt = (d: string) => (d ? new Date(d + "T12:00:00Z").toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }) : "");

/**
 * The blog: the latest article as a spread, then the archive as a grid of covers with dates set in mono.
 * Wix duplicates are hidden from the index but keep their URLs (they canonicalise to the original).
 */
export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const ref = useReveals<HTMLElement>();
  const visible = posts.filter((p) => !p.canonical);
  const [lead, ...rest] = visible;
  return (
    <main id="main">
      <PageHero
        title="Notes on filling bays."
        standfirst="Guides for golf simulator venue owners: local SEO, Google and Meta ads, automation, memberships, corporate events and the numbers behind them."
        eyebrow={`Blog · ${visible.length} articles`}
        titleClass="t-display-l"
      />
      <section ref={ref} data-theme="paper" className="relative" aria-label="Articles">
        <div className="wrap sect">
          {lead && (
            <article className="grid-12 gap-y-8 border-b border-line pb-16 lg:pb-24" aria-labelledby="lead-title">
              <div className="col-span-12 lg:col-span-7">
                <Link href={`/post/${lead.slug}`} data-label="Blog" aria-hidden="true" tabIndex={-1} className="media-cover block aspect-[16/9]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
                  {lead.cover && <Image src={lead.cover} alt="" fill priority sizes="(min-width: 1024px) 58vw, 100vw" />}
                </Link>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:self-end">
                <p className="t-mono t-small t-muted" data-reveal>{fmt(lead.date)} · {lead.readTime}</p>
                <h2 id="lead-title" className="t-display-m mt-4" data-split>
                  <Link href={`/post/${lead.slug}`} data-label="Blog" className="transition-colors duration-500 hover:text-green">{lead.title}</Link>
                </h2>
                <p className="t-body t-muted mt-5 max-w-[44ch]" data-reveal>{lead.description}</p>
                <Link href={`/post/${lead.slug}`} data-label="Blog" className="link-quiet mt-6 inline-flex items-center gap-2 t-small font-medium" data-reveal>
                  Read the article
                  <Arrow className="h-4 w-4" />
                </Link>
              </div>
            </article>
          )}
          <ul className="mt-16 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <li key={p.slug} data-reveal data-delay={String((i % 3) * 0.08)}>
                <article aria-labelledby={`p-${i}`}>
                  <Link href={`/post/${p.slug}`} data-label="Blog" className="group block">
                    <div className="media-cover aspect-[16/10]">
                      {p.cover && <Image src={p.cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />}
                    </div>
                    <p className="t-mono t-micro t-muted mt-5">{fmt(p.date)} · {p.readTime}</p>
                    <h2 id={`p-${i}`} className="t-display-s mt-2 text-[1.2rem] transition-colors duration-500 group-hover:text-green">{p.title}</h2>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <StrategyCall />
    </main>
  );
}
