"use client";

import Image from "next/image";
import Link from "next/link";
import { live } from "@/content/live";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";

/** A post as a card shows it. `dateText` is printed at build time, the way the live blog prints dates. */
export type PostCard = { slug: string; title: string; excerpt: string; date: string | null; dateText: string; readTime: string; cover: string | null; author: string };

/** Author, date and read time, as the live blog lines them up. */
export function Meta({ p, className = "" }: { p: Pick<PostCard, "author" | "dateText" | "readTime">; className?: string }) {
  return (
    <p className={`t-small t-muted flex flex-wrap gap-x-3 gap-y-1 ${className}`}>
      <span>{p.author}</span>{" "}
      <span aria-hidden="true">·</span>{" "}
      <span>{p.dateText}</span>{" "}
      <span aria-hidden="true">·</span>{" "}
      <span>{p.readTime}</span>
    </p>
  );
}

/**
 * The blog, as the live feed lays it out: All Posts, then every post with its cover, title, the opening of its text,
 * author, date and read time. The newest is set as a spread.
 */
export default function BlogIndex({ posts }: { posts: PostCard[] }) {
  const ref = useReveals<HTMLElement>();
  const [lead, ...rest] = posts;
  return (
    <main id="main">
      <section data-theme="ink" className="relative" aria-label={live.blog.allPosts}>
        <div className="wrap pb-14 pt-[calc(var(--nav-h)+48px)] lg:pb-20 lg:pt-[calc(var(--nav-h)+88px)]">
          <TracerMark />
          <p className="t-display-xl mt-6">
            <Link href="/blog" aria-current="page">{live.blog.allPosts}</Link>
          </p>
        </div>
      </section>
      <section ref={ref} data-theme="paper" className="relative" aria-label={live.blog.allPosts}>
        <div className="wrap sect">
          {lead && (
            <article className="grid-12 gap-y-8 border-b border-line pb-16 lg:pb-24" aria-labelledby="lead-title">
              <div className="col-span-12 lg:col-span-7">
                <Link href={`/post/${lead.slug}`} aria-hidden="true" tabIndex={-1} className="media-cover block aspect-[16/9]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
                  {lead.cover && <Image src={lead.cover} alt="" fill priority sizes="(min-width: 1024px) 58vw, 100vw" />}
                </Link>
              </div>
              <div className="col-span-12 lg:col-span-5 lg:self-end">
                <Meta p={lead} />
                <h2 id="lead-title" className="t-display-m mt-4">
                  <Link href={`/post/${lead.slug}`} className="transition-colors duration-500 hover:text-green">{lead.title}</Link>
                </h2>
                <p className="t-body t-muted mt-5 line-clamp-5 max-w-[52ch]">{lead.excerpt}</p>
              </div>
            </article>
          )}
          <ul className="mt-16 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <li key={p.slug} data-reveal data-delay={String((i % 3) * 0.08)}>
                <article aria-labelledby={`p-${i}`}>
                  <Link href={`/post/${p.slug}`} className="group block">
                    <div className="media-cover aspect-[16/10]">
                      {p.cover && <Image src={p.cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />}
                    </div>
                    <Meta p={p} className="mt-5" />
                    <h2 id={`p-${i}`} className="t-display-s mt-2 text-[1.2rem] transition-colors duration-500 group-hover:text-green">{p.title}</h2>
                    <p className="t-small t-muted mt-3 line-clamp-3">{p.excerpt}</p>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
