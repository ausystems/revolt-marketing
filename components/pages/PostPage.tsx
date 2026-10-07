"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { live } from "@/content/live";
import { useReveals } from "@/components/motion/useReveals";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import { Inline } from "@/components/ui/Rich";
import { Meta, type PostCard } from "./BlogIndex";

export type PostBlock = { t: string; text?: string; items?: string[]; src?: string; alt?: string; links?: { href: string | null; text: string }[] };
export type Post = PostCard & { seoTitle: string; description: string | null; modified: string | null; blocks: PostBlock[] };

/**
 * An article, as the live blog sets it: All Posts, the title, author, date and read time, the cover, the text at a
 * reading measure (with a thin reading-progress tracer at the top of the viewport), then Recent Posts.
 */
export default function PostPage({ post, recent }: { post: Post; recent: PostCard[] }) {
  const body = useReveals<HTMLElement>();
  const bar = useRef<HTMLDivElement>(null);
  const { blog } = live;

  useEffect(() => {
    const el = body.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 80%", onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleX(${s.progress})`) });
    }, el);
    return () => ctx.revert();
  }, [body]);

  // Wix articles use heading levels loosely; the shallowest body heading becomes h2 and the rest keep their distance.
  const levels = post.blocks.filter((b) => /^h[1-6]$/.test(b.t)).map((b) => (b.t === "h1" ? 2 : Number(b.t[1])));
  const shift = levels.length ? Math.max(0, Math.min(...levels) - 2) : 0;
  const headingTag = (t: string) => `h${Math.min(6, Math.max(2, (t === "h1" ? 2 : Number(t[1])) - shift))}` as "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <main id="main">
      <div ref={bar} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-[2px] origin-left bg-green" style={{ transform: "scaleX(0)" }} />
      <section data-theme="ink" className="relative" aria-labelledby="post-title">
        <div className="wrap pb-12 pt-[calc(var(--nav-h)+40px)] lg:pb-16 lg:pt-[calc(var(--nav-h)+72px)]">
          <Link href="/blog" className="link-quiet t-small t-muted">{blog.allPosts}</Link>
          <h1 id="post-title" className="t-display-m mt-8 max-w-[24ch] lg:text-[3.4rem]">{post.title}</h1>
          <Meta p={post} className="mt-6" />
          {post.cover && (
            <div className="media-cover mt-12 aspect-[16/9] lg:mt-16" style={{ borderRadius: "var(--r-panel)" }}>
              <Image src={post.cover} alt="" fill priority sizes="100vw" />
            </div>
          )}
        </div>
      </section>

      <section ref={body} data-theme="paper" className="relative" aria-label={post.title}>
        <div className="wrap sect">
          <article className="prose-revolt mx-auto max-w-[70ch]">
            {post.blocks.map((b, i) => {
              if (b.t === "img" && b.src) return (
                <figure key={i}>
                  <Image src={b.src} alt={b.alt || ""} width={1600} height={900} sizes="(min-width: 1024px) 60vw, 100vw" style={{ height: "auto" }} />
                </figure>
              );
              if (b.t === "ul" || b.t === "ol") { const T = b.t as "ul" | "ol"; return <T key={i}>{b.items?.map((it, k) => <li key={k}>{it}</li>)}</T>; }
              if (b.t === "quote" || b.t === "blockquote") return <blockquote key={i}>{b.text}</blockquote>;
              if (/^h[1-6]$/.test(b.t)) { const H = headingTag(b.t); return <H key={i}>{b.text}</H>; }
              return <p key={i}><Inline text={b.text || ""} links={b.links?.map((l) => ({ text: l.text, href: l.href }))} /></p>;
            })}
          </article>
        </div>
      </section>

      {recent.length > 0 && (
        <section data-theme="paper-2" className="relative" aria-labelledby="recent-title">
          <div className="wrap sect-sm">
            <div className="flex items-end justify-between gap-6">
              <h2 id="recent-title" className="t-display-m">{blog.recentPosts}</h2>
              <Link href="/blog" className="link-quiet t-small font-medium">{blog.seeAll}</Link>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
              {recent.map((p) => (
                <li key={p.slug}>
                  <Link href={`/post/${p.slug}`} className="group block">
                    <div className="media-cover aspect-[16/10]">{p.cover && <Image src={p.cover} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="transition-transform duration-[900ms] group-hover:scale-[1.04]" />}</div>
                    <h3 className="t-display-s mt-4 text-[1.1rem] transition-colors duration-500 group-hover:text-green">{p.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
