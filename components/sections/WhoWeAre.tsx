"use client";

import type { ReactNode } from "react";
import { live } from "@/content/live";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";

/** Set a few phrases of a sentence in Revolt green without touching its words. */
export function emphasize(text: string, phrases: string[]): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let k = 0;
  while (rest) {
    const hits = phrases.map((p) => [rest.indexOf(p), p] as const).filter(([i]) => i >= 0).sort((a, b) => a[0] - b[0]);
    if (!hits.length) { out.push(rest); break; }
    const [i, p] = hits[0];
    out.push(rest.slice(0, i), <span key={k++} className="t-green whitespace-nowrap">{p}</span>);
    rest = rest.slice(i + p.length);
  }
  return out;
}

/**
 * Who we are, on paper: the live heading set large, the specialization as the standfirst, and the ecosystem
 * sentence as the statement it is.
 */
export default function WhoWeAre() {
  const ref = useReveals<HTMLElement>();
  const { who } = live.home;
  return (
    <section ref={ref} id="who-we-are" data-theme="paper" className="relative" aria-labelledby="who-title">
      <div className="wrap sect">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <TracerMark />
            <h3 id="who-title" className="t-display-l mt-6" data-split>{who.h3}</h3>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-3">
            <p className="t-standfirst text-ink" data-reveal>{who.ps[0]}</p>
          </div>
        </div>
        <p className="t-display-m mt-20 max-w-[34ch] text-ink lg:mt-[16vh]" data-reveal>
          {emphasize(who.ps[1], ["ecosystem", "more walk-ins", "more events", "more revenue"])}
        </p>
      </div>
    </section>
  );
}
