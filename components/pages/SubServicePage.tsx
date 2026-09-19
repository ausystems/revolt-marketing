"use client";

import Link from "next/link";
import type { SubService, System } from "@/content/services";
import { childrenOf } from "@/content/services";
import PageHero from "@/components/sections/PageHero";
import StrategyCall from "@/components/sections/StrategyCall";
import { useReveals } from "@/components/motion/useReveals";
import Diagram from "@/components/ui/Diagram";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

/**
 * Every sub-service page shares this composition, and each one carries its own drawing.
 * Hero → the drawing beside the introduction → what's included as a numbered ledger → the editorial sections,
 * title left and body right → the rest of the system → the strategy call.
 */
export default function SubServicePage({ service, system }: { service: SubService; system: System }) {
  const intro = useReveals<HTMLElement>();
  const inc = useReveals<HTMLElement>();
  const body = useReveals<HTMLElement>();
  const rest = useReveals<HTMLElement>();
  const siblings = childrenOf(system.slug).filter((s) => s.slug !== service.slug);
  const withText = service.breakdown.some((b) => b.text);
  return (
    <main id="main">
      <PageHero
        title={service.h1}
        standfirst={service.standfirst}
        eyebrow={`${system.n} · ${system.name}`}
        crumbs={[{ label: "Services", href: "/services" }, { label: system.name, href: system.slug }, { label: service.name, href: service.slug }]}
        titleClass="t-display-l"
      />

      {/* The drawing and the introduction */}
      <section ref={intro} data-theme="ink" className="relative" aria-label="Introduction">
        <div className="wrap pb-24 lg:pb-32">
          <div className="grid-12 gap-y-10">
            <div className="col-span-12 lg:col-span-6">
              <div className="panel panel-ink p-6 sm:p-10" data-reveal="scale">
                <Diagram kind={service.diagram} />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-6">
              {service.intro.map((p, i) => (
                <p key={i} className={`t-standfirst ${i === 0 ? "text-paper" : "t-muted mt-6"}`} data-reveal data-delay={String(0.1 * i)}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section ref={inc} data-theme="paper" className="relative" aria-labelledby="included-title">
        <div className="wrap sect">
          <div className="grid-12 gap-y-10">
            <div className="col-span-12 lg:col-span-4">
              <div className="lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
                <TracerMark />
                <h2 id="included-title" className="t-display-m mt-5 max-w-[12ch]" data-split>
                  What’s included.
                </h2>
                <p className="t-small t-muted mt-5 max-w-[32ch]" data-reveal>
                  {service.breakdown.length} parts of {service.name.toLowerCase()}, inside {system.name}.
                </p>
              </div>
            </div>
            <ol className="col-span-12 lg:col-span-7 lg:col-start-6" data-reveal-group data-stagger="0.1">
              {service.breakdown.map((b, i) => (
                <li key={b.title} className={`grid grid-cols-[3ch_1fr] gap-x-5 border-t border-line py-6 sm:grid-cols-[4ch_1fr] ${i === service.breakdown.length - 1 ? "border-b" : ""} ${withText ? "lg:py-8" : ""}`}>
                  <span className="t-mono t-small t-green pt-1">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className={withText ? "t-display-s" : "t-display-s text-[1.25rem]"}>{b.title}</h3>
                    {b.text && <p className="t-body t-muted mt-2.5 max-w-[52ch]">{b.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Editorial sections */}
      <section ref={body} data-theme="ink" className="relative" aria-label="Details">
        <div className="wrap sect">
          {service.sections.map((sec, i) => (
            <div key={sec.title} className={`grid-12 gap-y-6 py-12 lg:py-16 ${i === 0 ? "border-t" : ""} border-b border-line-dark`}>
              <div className="col-span-12 lg:col-span-5">
                <span className="t-mono t-small t-green">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="t-display-m mt-3 max-w-[16ch]" data-split>{sec.title}</h2>
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                {sec.paragraphs?.map((p, k) => (
                  <p key={k} className={`t-body t-muted max-w-[58ch] ${k > 0 ? "mt-5" : ""}`} data-reveal data-delay={String(0.06 * k)}>{p}</p>
                ))}
                {sec.bullets && sec.bullets.length > 0 && (
                  <ul className={`max-w-[58ch] ${sec.paragraphs?.length ? "mt-7" : ""}`} data-reveal-group>
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

      {/* The rest of the system */}
      <section ref={rest} data-theme="paper-2" className="relative" aria-labelledby="rest-title">
        <div className="wrap sect-sm">
          <div className="grid-12 items-end gap-y-6">
            <div className="col-span-12 lg:col-span-6">
              <TracerMark />
              <h2 id="rest-title" className="t-display-m mt-5 max-w-[16ch]" data-split>
                The rest of {system.name}.
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:justify-self-end" data-reveal>
              <Link href={system.slug} data-label={system.short} className="btn btn-ink">
                See the whole system
                <Arrow />
              </Link>
            </div>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
            {siblings.map((s, i) => (
              <li key={s.slug} className="border-t border-line">
                <Link href={s.slug} data-label={system.short} className="group block py-5">
                  <span className="t-mono t-micro t-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-display-s mt-1 flex items-baseline justify-between gap-3 text-[1.1rem]">
                    {s.name}
                    <Arrow className="h-4 w-4 shrink-0 opacity-50 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100" />
                  </span>
                  <span className="t-small t-muted mt-2 block line-clamp-2">{s.standfirst}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StrategyCall />
    </main>
  );
}
