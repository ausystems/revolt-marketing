"use client";

import Image from "next/image";
import Link from "next/link";
import type { LiveSystem } from "@/content/live";
import type { System } from "@/content/services";
import { subServices } from "@/content/services";
import PageHero from "@/components/sections/PageHero";
import { useReveals } from "@/components/motion/useReveals";
import Diagram from "@/components/ui/Diagram";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";
import { hrefFor } from "@/components/ui/Rich";

/**
 * A system page, as the live page has it: the system and its promise, then every service inside it as a chapter of
 * its own (a drawing, the name, the words, and the two buttons).
 */
export default function SystemPage({ page, system }: { page: LiveSystem; system: System }) {
  const stage = useReveals<HTMLElement>();
  const index = useReveals<HTMLElement>();
  return (
    <main id="main">
      <PageHero title={page.h1} standfirst={page.intro} />

      {/* The scene */}
      <section ref={stage} data-theme="ink" className="relative" aria-hidden="true">
        <div className="wrap pb-20 lg:pb-28">
          <div className="media-cover aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
            <Image src={system.image} alt="" fill priority sizes="100vw" className="scale-[1.08]" data-parallax="0.06" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Each service as a chapter */}
      <section ref={index} data-theme="paper" className="relative" aria-label={page.h1}>
        <div className="wrap sect">
          <ul>
            {page.items.map((item, i) => {
              const sub = subServices.find((s) => s.name === item.title);
              return (
                <li key={item.title} className={`grid-12 gap-y-8 border-t border-line py-12 lg:py-16 ${i === page.items.length - 1 ? "border-b" : ""}`} data-reveal>
                  <div className={`col-span-12 lg:col-span-5 ${i % 2 ? "lg:order-2 lg:col-start-8" : ""}`}>
                    <div className="panel bg-paper-2 p-5 text-ink sm:p-8" aria-hidden="true">
                      {sub && <Diagram kind={sub.diagram} />}
                    </div>
                  </div>
                  <div className={`col-span-12 lg:col-span-6 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"}`}>
                    <TracerMark />
                    <h3 className="t-display-m mt-4">{item.title}</h3>
                    <p className="t-body t-muted mt-5 max-w-[56ch]">{item.text}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                      {item.buttons.map((b, k) => (
                        <Link key={b.text} href={k === 0 ? hrefFor(b.text, b.href) : b.href ?? sub?.slug ?? page.slug} className={k === 0 ? "btn" : "btn btn-ink"}>
                          {b.text}
                          {k === 0 && <Arrow />}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
