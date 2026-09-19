"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { systems } from "@/content/services";
import PageHero from "@/components/sections/PageHero";
import StrategyCall from "@/components/sections/StrategyCall";
import { useReveals } from "@/components/motion/useReveals";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import { Arrow } from "@/components/ui/Button";
import type { PostMeta } from "./BlogIndex";

export type Block = { t: string; text?: string; items?: string[]; src?: string; alt?: string; links?: { href: string; text: string }[] };
export type Post = PostMeta & { blocks: Block[]; seoTitle: string; modified: string };

const fmt = (d: string) => (d ? new Date(d + "T12:00:00Z").toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }) : "");

/** Paragraph text with the original inline links restored. */
function Rich({ text, links }: { text: string; links?: { href: string; text: string }[] }) {
  if (!links?.length) return <>{text}</>;
  const out: React.ReactNode[] = [];
  let rest = text;
  links.forEach((l, i) => {
    const idx = rest.indexOf(l.text);
    if (idx < 0 || !l.text) return;
    out.push(rest.slice(0, idx));
    const internal = l.href.startsWith("/");
    out.push(internal ? <Link key={i} href={l.href}>{l.text}</Link> : <a key={i} href={l.href} target="_blank" rel="noopener">{l.text}</a>);
    rest = rest.slice(idx + l.text.length);
  });
  out.push(rest);
  return <>{out}</>;
}

/**
 * An article. The cover as a spread beneath the title, the body set at a reading measure with a thin reading-
 * progress tracer at the top of the viewport, a sticky aside with the four systems, then the three latest articles.
 */
export default function PostPage({ post, related }: { post: Post; related: PostMeta[] }) {
  const body = useReveals<HTMLElement>();
  const bar = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = body.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 80%", onUpdate: (s) => setProgress(s.progress) });
    }, el);
    return () => ctx.revert();
  }, [body]);

  // Wix articles use h1/h3/h4 inconsistently; the shallowest body heading becomes h2 and the rest keep their distance.
  const levels = post.blocks.filter((b) => /^h[1-6]$/.test(b.t)).map((b) => (b.t === "h1" ? 2 : Number(b.t[1])));
  const shift = levels.length ? Math.max(0, Math.min(...levels) - 2) : 0;
  const headingTag = (t: string) => `h${Math.min(6, Math.max(2, (t === "h1" ? 2 : Number(t[1])) - shift))}` as "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <main id="main">
      <div ref={bar} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-[2px] origin-left bg-green" style={{ transform: `scaleX(${progress})` }} />
      <PageHero
        title={post.title}
        titleClass="t-display-m lg:text-[3.6rem]"
        titleMax="max-w-[24ch]"
        crumbs={[{ label: "Blog", href: "/blog" }]}
        eyebrow={`${fmt(post.date)} · ${post.readTime}`}
        standfirst={post.description}
        aside={<p className="t-mono t-micro t-muted">By {post.author}</p>}
      >
        {post.cover && (
          <div className="media-cover mt-14 aspect-[16/9] lg:mt-20" data-enter style={{ borderRadius: "var(--r-panel)" }}>
            <Image src={post.cover} alt="" fill priority sizes="100vw" />
          </div>
        )}
      </PageHero>

      <section ref={body} data-theme="paper" className="relative" aria-label="Article">
        <div className="wrap sect">
          <div className="grid-12 gap-y-12">
            <article className="prose-revolt col-span-12 lg:col-span-7 lg:col-start-2">
              {post.blocks.map((b, i) => {
                if (b.t === "img" && b.src) return (
                  <figure key={i}>
                    <Image src={b.src} alt={b.alt || ""} width={1600} height={900} sizes="(min-width: 1024px) 58vw, 100vw" style={{ height: "auto" }} />
                  </figure>
                );
                if (b.t === "ul" || b.t === "ol") { const T = b.t as "ul" | "ol"; return <T key={i}>{b.items?.map((it, k) => <li key={k}>{it}</li>)}</T>; }
                if (b.t === "quote") return <blockquote key={i}>{b.text}</blockquote>;
                if (/^h[1-6]$/.test(b.t)) { const H = headingTag(b.t); return <H key={i}>{b.text}</H>; }
                return <p key={i}><Rich text={b.text || ""} links={b.links} /></p>;
              })}
            </article>
            <aside className="col-span-12 lg:col-span-3 lg:col-start-10">
              <div className="lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
                <div className="panel panel-ink p-6">
                  <p className="t-mono t-micro text-green-soft">Free Strategy Call</p>
                  <p className="t-display-s mt-3 text-[1.15rem]">Want this done for your venue?</p>
                  <p className="t-small t-muted mt-2">We’ll audit your marketing and show you exactly how to fill your bays.</p>
                  <Link href="/contact-us" data-label="Free Strategy Call" className="btn btn-sm mt-5">
                    Book a call
                    <Arrow />
                  </Link>
                </div>
                <p className="t-small font-medium mt-8">The four systems</p>
                <ul className="mt-3 border-t border-line">
                  {systems.map((s) => (
                    <li key={s.slug} className="border-b border-line">
                      <Link href={s.slug} data-label={s.short} className="flex items-baseline gap-3 py-3">
                        <span className="t-mono t-micro t-green">{s.n}</span>
                        <span className="t-small">{s.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section data-theme="paper-2" className="relative" aria-labelledby="more-title">
          <div className="wrap sect-sm">
            <div className="flex items-end justify-between gap-6">
              <h2 id="more-title" className="t-display-m">More from the blog.</h2>
              <Link href="/blog" data-label="Blog" className="link-quiet t-small font-medium hidden sm:inline-flex items-center gap-2">All articles <Arrow className="h-4 w-4" /></Link>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/post/${p.slug}`} data-label="Blog" className="group block">
                    <div className="media-cover aspect-[16/10]">{p.cover && <Image src={p.cover} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="transition-transform duration-[900ms] group-hover:scale-[1.04]" />}</div>
                    <p className="t-mono t-micro t-muted mt-4">{fmt(p.date)} · {p.readTime}</p>
                    <h3 className="t-display-s mt-2 text-[1.1rem] transition-colors duration-500 group-hover:text-green">{p.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <StrategyCall />
    </main>
  );
}
