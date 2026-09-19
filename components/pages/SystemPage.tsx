"use client";

import Image from "next/image";
import Link from "next/link";
import type { System } from "@/content/services";
import { systems, childrenOf } from "@/content/services";
import PageHero from "@/components/sections/PageHero";
import StrategyCall from "@/components/sections/StrategyCall";
import { useReveals } from "@/components/motion/useReveals";
import Diagram from "@/components/ui/Diagram";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

/**
 * A system page: the scene, then every sub-service as a chapter of its own (drawing, name, text, link),
 * then how this system connects to the other three, then the strategy call.
 */
export default function SystemPage({ system }: { system: System }) {
  const stage = useReveals<HTMLElement>();
  const index = useReveals<HTMLElement>();
  const connect = useReveals<HTMLElement>();
  const kids = childrenOf(system.slug);
  const others = systems.filter((s) => s.slug !== system.slug);
  return (
    <main id="main">
      <PageHero
        title={system.name}
        standfirst={system.standfirst}
        eyebrow={`${system.n} · ${kids.length} services`}
        crumbs={[{ label: "Services", href: "/services" }, { label: system.name, href: system.slug }]}
        aside={
          <Link href="/contact-us" data-label="Free Strategy Call" className="btn">
            Free Strategy Call
            <Arrow />
          </Link>
        }
      />

      {/* The scene */}
      <section ref={stage} data-theme="ink" className="relative" aria-label={system.imageAlt}>
        <div className="wrap pb-20 lg:pb-28">
          <div className="media-cover aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
            <Image src={system.image} alt={system.imageAlt} fill priority sizes="100vw" className="scale-[1.08]" data-parallax="0.06" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 lg:p-8">
              <span className="t-mono t-small text-green-soft">{system.n}</span>
              <span className="t-small font-medium text-paper">{system.subline}</span>
            </div>
          </div>
          <p className="t-standfirst t-muted mt-10 max-w-[60ch] lg:mt-14 lg:ml-[calc(100%/12*4+var(--col-gap))]" data-reveal>
            {system.summary}
          </p>
        </div>
      </section>

      {/* Each sub-service as a chapter */}
      <section ref={index} data-theme="paper" className="relative" aria-labelledby="inside-title">
        <div className="wrap sect">
          <div className="grid-12 items-end gap-y-6">
            <div className="col-span-12 lg:col-span-7">
              <TracerMark />
              <h2 id="inside-title" className="t-display-l mt-6 max-w-[12ch]" data-split>
                Inside {system.short.toLowerCase()}.
              </h2>
            </div>
            <p className="t-standfirst t-muted col-span-12 max-w-[40ch] lg:col-span-4 lg:col-start-9" data-reveal data-delay="0.15">
              {kids.length} services, each with its own page. Together they are one system.
            </p>
          </div>

          <ol className="mt-16 lg:mt-24">
            {kids.map((k, i) => (
              <li key={k.slug} className={`group grid-12 gap-y-8 border-t border-line py-12 lg:py-16 ${i === kids.length - 1 ? "border-b" : ""}`} data-reveal>
                <div className={`col-span-12 lg:col-span-5 ${i % 2 ? "lg:col-start-8 lg:order-2" : ""}`}>
                  <div className="panel bg-paper-2 p-5 sm:p-8 text-ink transition-colors duration-500 group-hover:bg-paper-3/70">
                    <Diagram kind={k.diagram} />
                  </div>
                </div>
                <div className={`col-span-12 lg:col-span-6 ${i % 2 ? "lg:col-start-1 lg:order-1" : "lg:col-start-7"}`}>
                  <span className="t-mono t-small t-green">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="t-display-m mt-3">
                    <Link href={k.slug} data-label={system.short} className="transition-colors duration-500 group-hover:text-green">
                      {k.name}
                    </Link>
                  </h3>
                  <p className="t-body t-muted mt-5 max-w-[52ch]">{system.children.find((c) => c.slug === k.slug)?.text ?? k.standfirst}</p>
                  <Link href={k.slug} data-label={system.short} className="link-quiet mt-7 inline-flex items-center gap-2 t-small font-medium">
                    Learn more
                    <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How it connects */}
      <section ref={connect} data-theme="ink" className="relative" aria-labelledby="connect-title">
        <div className="wrap sect-sm">
          <div className="grid-12 items-end gap-y-6">
            <div className="col-span-12 lg:col-span-7">
              <TracerMark />
              <h2 id="connect-title" className="t-display-m mt-5 max-w-[18ch]" data-split>
                One of four connected systems.
              </h2>
            </div>
            <p className="t-small t-muted col-span-12 max-w-[40ch] lg:col-span-4 lg:col-start-9" data-reveal>
              Marketing isn’t a set of disconnected tasks. {system.short} works alongside the other three.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-x-6 sm:grid-cols-3" data-reveal-group>
            {others.map((o) => (
              <li key={o.slug} className="border-t border-line-dark">
                <Link href={o.slug} data-label={o.short} className="group block py-6">
                  <span className="t-mono t-micro t-green">{o.n}</span>
                  <span className="t-display-s mt-1 flex items-baseline justify-between gap-3">
                    {o.name}
                    <Arrow className="h-4 w-4 shrink-0 opacity-50 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100" />
                  </span>
                  <span className="t-small t-muted mt-2 block">{o.subline}</span>
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
