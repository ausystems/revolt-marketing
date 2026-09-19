"use client";

import Link from "next/link";
import { site } from "@/content/site";
import { systems } from "@/content/services";
import StrategyCall from "@/components/sections/StrategyCall";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

/**
 * Contact. The strategy-call chapter is the page: the form, what happens on the call, every way to reach Revolt.
 * Beneath it, the four systems for anyone who wants to read before they book.
 */
export default function ContactPage() {
  const ref = useReveals<HTMLElement>();
  return (
    <main id="main">
      <StrategyCall asHero heading="Book a free strategy call." id="book" />
      <section ref={ref} data-theme="paper" className="relative" aria-labelledby="reach-title">
        <div className="wrap sect">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-5">
              <TracerMark />
              <h2 id="reach-title" className="t-display-l mt-6 max-w-[12ch]" data-split>Or reach us directly.</h2>
              <p className="t-standfirst t-muted mt-6 max-w-[40ch]" data-reveal>
                Get a custom growth plan to increase bookings, boost retention, and dominate your local market. Built by the only marketing company specialized in golf simulator businesses.
              </p>
            </div>
            <dl className="col-span-12 lg:col-span-6 lg:col-start-7" data-reveal-group>
              {[
                { k: "Call us now", v: site.phone.display, href: site.phone.href },
                { k: "Email address", v: site.email, href: `mailto:${site.email}` },
                { k: "Location", v: site.location },
                { k: "Instagram", v: "@revolt.marketing", href: site.social[0].href, ext: true },
                { k: "Facebook", v: "Revolt Marketing", href: site.social[1].href, ext: true },
              ].map((r) => (
                <div key={r.k} className="grid grid-cols-[12ch_1fr_auto] items-baseline gap-4 border-t border-line py-5 last:border-b sm:grid-cols-[16ch_1fr_auto]">
                  <dt className="t-small t-muted">{r.k}</dt>
                  <dd className="t-display-s text-[1.15rem] break-all sm:break-normal">
                    {r.href ? <a href={r.href} className="link-quiet" target={r.ext ? "_blank" : undefined} rel={r.ext ? "noopener" : undefined}>{r.v}</a> : r.v}
                  </dd>
                  <dd>{r.href && <Arrow className="h-4 w-4 opacity-50" />}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-24 grid-12 items-end gap-y-6 border-t border-line pt-12 lg:mt-32">
            <h2 className="t-display-m col-span-12 max-w-[16ch] lg:col-span-6" data-split>Not sure where to start?</h2>
            <p className="t-small t-muted col-span-12 max-w-[40ch] lg:col-span-4 lg:col-start-9" data-reveal>Read about the four systems first. Every one of them ends in the same place: a call.</p>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
            {systems.map((s) => (
              <li key={s.slug} className="border-t border-line">
                <Link href={s.slug} data-label={s.short} className="group block py-6">
                  <span className="t-mono t-micro t-green">{s.n}</span>
                  <span className="t-display-s mt-1 flex items-baseline justify-between gap-3 text-[1.1rem]">
                    {s.name}
                    <Arrow className="h-4 w-4 shrink-0 opacity-50 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100" />
                  </span>
                  <span className="t-small t-muted mt-2 block">{s.subline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
