"use client";

import Image from "next/image";
import Link from "next/link";
import { live } from "@/content/live";
import { systems } from "@/content/services";
import PageHero from "@/components/sections/PageHero";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";
import { hrefFor } from "@/components/ui/Rich";

/**
 * The services index, as the live page has it: the four systems as alternating spreads (scene and words), then why
 * golf simulator venues choose Revolt.
 */
export default function ServicesPage() {
  const chapters = useReveals<HTMLElement>();
  const why = useReveals<HTMLElement>();
  const { services } = live;
  return (
    <main id="main">
      <PageHero title={services.h1} standfirst={services.p} titleClass="t-display-l" />

      <section ref={chapters} data-theme="ink" className="relative" aria-label={services.h1}>
        <div className="wrap pb-8">
          {services.systems.map((s, i) => {
            const image = systems.find((x) => x.name === s.name)?.image ?? systems[i].image;
            return (
              <article key={s.name} className={`grid-12 gap-y-10 border-t border-line-dark py-16 lg:py-24 ${i === services.systems.length - 1 ? "border-b" : ""}`} aria-labelledby={`sys-${i}`}>
                <div className={`col-span-12 lg:col-span-6 ${i % 2 ? "lg:order-2 lg:col-start-7" : ""}`}>
                  <div className="media-cover aspect-[4/3]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
                    <Image src={image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="scale-[1.06]" data-parallax="0.05" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                  </div>
                </div>
                <div className={`col-span-12 lg:col-span-5 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"} lg:self-center`}>
                  <TracerMark />
                  <h3 id={`sys-${i}`} className="t-display-m mt-5">{s.name}</h3>
                  <p className="t-standfirst mt-3 text-paper/90" data-reveal>{s.subtitle}</p>
                  <p className="t-body t-muted mt-5 max-w-[48ch]" data-reveal data-delay="0.08">{s.text}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4" data-reveal data-delay="0.16">
                    {s.buttons.map((b, k) => (
                      <Link key={b.text} href={hrefFor(b.text, b.href)} className={k === 0 ? "btn" : "btn btn-secondary"}>
                        {b.text}
                        {k === 0 && <Arrow />}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section ref={why} data-theme="paper" className="relative overflow-hidden" aria-labelledby="why-title">
        <div aria-hidden="true" className="outline-word pointer-events-none absolute left-1/2 top-[4vh] -translate-x-1/2 text-[16vw]">{services.why.label}</div>
        <div className="wrap sect relative">
          <div className="grid-12 items-end gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <TracerMark />
              <h2 id="why-title" className="t-display-l mt-6 max-w-[16ch]" data-split>{services.why.h2}</h2>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9" data-reveal data-delay="0.15">
              <div className="media-cover aspect-[4/3]">
                <Image src="/media/golfer.jpg" alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" />
              </div>
            </div>
          </div>
          <ul className="mt-16 grid grid-cols-1 gap-x-6 lg:mt-24 lg:grid-cols-2" data-reveal-group data-stagger="0.1">
            {services.why.items.map((w) => (
              <li key={w.title} className="border-t border-line py-8">
                <p className="t-display-s max-w-[24ch]">{w.title}</p>
                <p className="t-body t-muted mt-3 max-w-[44ch]">{w.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
