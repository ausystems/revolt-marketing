"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { useReveal } from "@/components/motion/useReveal";

/**
 * What Revolt does, as an editorial index of four entries rather than four cards.
 * Draft copy: sharpen it against the company's own positioning before launch.
 */

/** Service page links come from the site map so the index and the nav never drift apart. */
function serviceHref(label: string, fallback: string) {
  return site.nav.services.find((s) => s.label === label)?.href ?? fallback;
}

const entries = [
  {
    n: "01",
    title: "Strategy",
    standfirst: "A position worth defending, before a single dollar goes to media.",
    points: [
      "Audience and category research, not assumptions",
      "A point of view your competitors can't copy",
      "Offer and funnel design built around one metric",
      "A 90-day plan with the bets written down",
      "Measurement set up before launch, not after",
    ],
    link: { label: "Start with a strategy call", href: "#contact" },
  },
  {
    n: "02",
    title: "Paid media",
    standfirst: "Full-funnel media buying that leads the algorithm instead of chasing it.",
    points: [
      "Meta, Google, TikTok, Snapchat and YouTube under one team",
      "Creative testing loops that outpace fatigue",
      "Budgets that move with performance, daily",
      "Winners scaled fast, waste cut faster",
      "Account structures that stay stable as spend grows",
    ],
    link: { label: "Paid media", href: serviceHref("Paid media", "/paid-media") },
  },
  {
    n: "03",
    title: "Creative",
    standfirst: "Ads with an opinion. Built to be noticed, tested until they convert.",
    points: [
      "Concepts shaped around real buyer objections",
      "Hooks, angles and formats tested as a system",
      "UGC, studio and motion, produced in-house",
      "Advertorial and landing pages that finish the sale",
      "A creative pipeline that never runs dry",
    ],
    link: { label: "Creative", href: serviceHref("Creative", "/creative") },
  },
  {
    n: "04",
    title: "Retention",
    standfirst: "Email and SMS that keep the relationship alive after the first order.",
    points: [
      "Welcome and abandoned-cart flows that recover revenue",
      "Post-purchase journeys that lift AOV and LTV",
      "Win-back and re-engagement, timed to intent",
      "Campaign calendars that earn attention, not unsubscribes",
      "Segmentation that treats a first buyer and a fan differently",
    ],
    link: { label: "Retention", href: serviceHref("Retention", "/retention") },
  },
] as const;

export default function Services() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="services" data-theme="paper" className="relative" aria-labelledby="services-title">
      <div className="wrap py-24 lg:py-[20vh]">
        <div className="grid-12">
          <h2 id="services-title" className="t-display-l col-span-12 lg:col-span-10" data-reveal-lines>
            <span className="mask-line">
              <span>Most agencies run a channel.</span>
            </span>
            <span className="mask-line">
              <span>
                We run <span className="t-gradient">the whole fight.</span>
              </span>
            </span>
          </h2>
        </div>

        <ol className="mt-16 lg:mt-[12vh]">
          {entries.map((e, i) => {
            const linkClass = "link link-flame t-small mt-7 inline-block font-medium after:absolute after:inset-0 after:content-['']";
            return (
              <li
                key={e.n}
                className={`group grid-12 relative border-t border-line py-10 lg:py-14 ${i === entries.length - 1 ? "border-b" : ""}`}
                data-reveal
              >
                <span className="t-small t-num col-span-12 text-flame lg:col-span-1">{e.n}</span>
                <h3 className="t-display-m col-span-12 mt-3 font-semibold transition-colors duration-[400ms] group-hover:text-flame lg:col-span-6 lg:col-start-2 lg:mt-0">
                  {e.title}
                </h3>
                <div className="col-span-12 mt-8 lg:col-span-5 lg:col-start-8 lg:mt-0">
                  <p className="t-standfirst max-w-[44ch] text-pretty">{e.standfirst}</p>
                  <ul className="t-body mt-6 max-w-[44ch] list-none space-y-3 text-pretty text-muted lg:space-y-2">
                    {e.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  {/* In-page anchors stay plain <a> so the Lenis click handler glides them, as Hero and Nav do. */}
                  {e.link.href.startsWith("#") ? (
                    <a href={e.link.href} className={linkClass}>
                      {e.link.label}
                    </a>
                  ) : (
                    <Link href={e.link.href} className={linkClass}>
                      {e.link.label}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
