"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { systems } from "@/content/services";
import PageHero from "@/components/sections/PageHero";
import StrategyCall from "@/components/sections/StrategyCall";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

/**
 * The services index. Four chapters, one per system, alternating the scene and the text so the page reads like
 * a sequence of spreads rather than a list. Then the four reasons venues choose Revolt.
 */
export default function ServicesPage() {
  const chapters = useReveals<HTMLElement>();
  const why = useReveals<HTMLElement>();
  return (
    <main id="main">
      <PageHero
        title="Marketing built for golf simulator venues."
        standfirst="The only marketing firm built exclusively for golf simulator entertainment venues across North America. Four systems, each with its own page, all working on the same calendar."
        eyebrow="Services · four systems"
        titleClass="t-display-l"
        aside={
          <Link href="/contact-us" data-label="Free Strategy Call" className="btn">
            Free Strategy Call
            <Arrow />
          </Link>
        }
      />

      <section ref={chapters} data-theme="ink" className="relative" aria-label="The four systems">
        <div className="wrap pb-8">
          {systems.map((s, i) => (
            <article key={s.slug} className={`grid-12 gap-y-10 border-t border-line-dark py-16 lg:py-24 ${i === systems.length - 1 ? "border-b" : ""}`} aria-labelledby={`sys-${s.n}`}>
              <div className={`col-span-12 lg:col-span-6 ${i % 2 ? "lg:order-2 lg:col-start-7" : ""}`}>
                <div className="media-cover aspect-[4/3]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
                  <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="scale-[1.06]" data-parallax="0.05" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  <span className="t-mono t-small absolute bottom-5 left-6 text-green-soft">{s.n}</span>
                </div>
              </div>
              <div className={`col-span-12 lg:col-span-5 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"} lg:self-center`}>
                <TracerMark />
                <h2 id={`sys-${s.n}`} className="t-display-m mt-5">
                  <Link href={s.slug} data-label={s.short} className="transition-colors duration-500 hover:text-green-soft">{s.name}</Link>
                </h2>
                <p className="t-standfirst mt-3 text-paper/90" data-reveal>{s.subline}</p>
                <p className="t-body t-muted mt-5 max-w-[48ch]" data-reveal data-delay="0.08">{s.summary}</p>
                <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2" data-reveal data-delay="0.12">
                  {s.children.map((c) => (
                    <li key={c.slug}><Link href={c.slug} data-label={s.short} className="link-quiet t-small t-muted hover:text-paper">{c.name}</Link></li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4" data-reveal data-delay="0.16">
                  <Link href={s.slug} data-label={s.short} className="btn btn-secondary">
                    Learn more
                    <Arrow />
                  </Link>
                  <Link href="/contact-us" data-label="Free Strategy Call" className="link t-small font-medium">Free Strategy Call</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section ref={why} data-theme="paper" className="relative" aria-labelledby="why-title">
        <div className="wrap sect">
          <div className="grid-12 items-end gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <TracerMark />
              <h2 id="why-title" className="t-display-l mt-6 max-w-[14ch]" data-split>Why golf simulator venues choose Revolt.</h2>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9" data-reveal data-delay="0.15">
              <div className="media-cover aspect-[4/3]">
                <Image src="/media/golfer.jpg" alt="A golfer mid-swing in front of a simulator screen" fill sizes="(min-width: 1024px) 33vw, 100vw" />
              </div>
            </div>
          </div>
          <ol className="mt-16 grid grid-cols-1 gap-x-6 lg:mt-24 lg:grid-cols-2" data-reveal-group data-stagger="0.1">
            {site.why.map((w, i) => (
              <li key={w.title} className="grid grid-cols-[3ch_1fr] gap-x-5 border-t border-line py-8 sm:grid-cols-[4ch_1fr]">
                <span className="t-mono t-small t-green pt-1.5">0{i + 1}</span>
                <div>
                  <h3 className="t-display-s max-w-[22ch]">{w.title}</h3>
                  <p className="t-body t-muted mt-3 max-w-[44ch]">{w.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <StrategyCall />
    </main>
  );
}
