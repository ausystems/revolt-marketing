"use client";

import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";

/**
 * Who we are, as an editorial statement on paper: the philosophy is the composition.
 * The claim on the left, the specialization on the right, and the outcomes written as one sentence.
 */
export default function WhoWeAre() {
  const ref = useReveals<HTMLElement>();
  return (
    <section ref={ref} id="who-we-are" data-theme="paper" className="relative" aria-labelledby="who-title">
      <div className="wrap sect">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            <TracerMark />
            <h2 id="who-title" className="t-display-l mt-6 max-w-[14ch]" data-split>
              Marketing isn’t a set of disconnected tasks. It’s an <span className="t-green">ecosystem.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-3">
            <p className="t-standfirst text-ink" data-reveal>
              We’re a specialized golf simulator marketing firm built exclusively for golf simulator entertainment venues across North America. We help venues fill their bays, book corporate events, and maximize revenue through proven digital strategies.
            </p>
            <dl className="mt-10 border-t border-line" data-reveal data-delay="0.1">
              {[
                ["Built for", "Golf simulator entertainment venues"],
                ["Working across", "United States and Canada"],
                ["Based in", "Toronto, Canada"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9ch_1fr] gap-4 border-b border-line py-3.5">
                  <dt className="t-small t-muted">{k}</dt>
                  <dd className="t-small font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <p className="t-display-m mt-24 max-w-[30ch] text-ink lg:mt-[18vh]" data-split>
          When that system works in sync, everything runs better: <span className="t-green">more walk‑ins</span>, <span className="t-green">more events</span>, <span className="t-green">more revenue</span>, less stress.
        </p>
      </div>
    </section>
  );
}
