"use client";

import { site } from "@/lib/site";
import { useReveal } from "@/components/motion/useReveal";

/**
 * Dark chapter, centred like a title card: one claim, then the facts written
 * as a sentence rather than a row of statistics.
 */
export default function Statement() {
  const ref = useReveal<HTMLElement>();
  const f = site.facts;
  return (
    <section ref={ref} data-theme="night" className="relative" aria-labelledby="statement-title">
      <div className="wrap py-28 text-center lg:py-[24vh]">
        <h2 id="statement-title" className="t-display-l mx-auto max-w-[16ch]" data-reveal-lines>
          <span className="mask-line">
            <span>Safe marketing is</span>
          </span>
          <span className="mask-line">
            <span>the risky choice.</span>
          </span>
        </h2>

        <p className="t-display-m mx-auto mt-24 max-w-[24ch] font-medium text-white/[0.92] lg:mt-[16vh]" data-reveal>
          <span className="text-flame-soft">{f.brands}</span> brands have handed us their&nbsp;growth.{" "}
          <span className="text-flame-soft">{f.spend}</span> in ad&nbsp;spend managed.{" "}
          <span className="text-flame-soft">{f.retention}</span> of clients <span className="whitespace-nowrap">stay on.</span>{" "}
          <span className="text-flame-soft">{f.years}</span> years of picking&nbsp;fights <span className="whitespace-nowrap">worth winning.</span>
        </p>
        <p className="t-small mx-auto mt-10 max-w-[56ch] text-muted-dark" data-reveal="0.15">
          Rated {f.rating} out of 5 by the brands we work with.
        </p>
      </div>
    </section>
  );
}
