"use client";

import Image from "next/image";
import { site } from "@/content/site";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";

/**
 * Why venues choose Revolt: the four real differentiators as an editorial ledger beside the swing photograph,
 * then the facts the site actually states, set large.
 */
export default function WhyRevolt() {
  const ref = useReveals<HTMLElement>();
  return (
    <section ref={ref} id="why-revolt" data-theme="paper" className="relative" aria-labelledby="why-title">
      <div className="wrap sect">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <TracerMark />
            <h2 id="why-title" className="t-display-l mt-6 max-w-[14ch]" data-split>
              Why golf simulator venues choose Revolt.
            </h2>
          </div>
          <p className="t-standfirst t-muted col-span-12 max-w-[40ch] lg:col-span-4 lg:col-start-9" data-reveal data-delay="0.15">
            Built for automated venues. Judged on bookings and revenue, not followers.
          </p>
        </div>

        <div className="grid-12 mt-16 gap-y-12 lg:mt-24">
          <div className="col-span-12 lg:col-span-5">
            <div className="media-cover aspect-[4/3] lg:sticky lg:top-[calc(var(--nav-h)+24px)]" data-reveal="scale">
              <Image src="/media/golfer.jpg" alt="A golfer mid-swing in front of a simulator screen" fill sizes="(min-width: 1024px) 40vw, 100vw" data-parallax="0.08" className="scale-[1.12]" />
            </div>
          </div>
          <ol className="col-span-12 lg:col-span-6 lg:col-start-7" data-reveal-group data-stagger="0.12">
            {site.why.map((w, i) => (
              <li key={w.title} className={`grid grid-cols-[3ch_1fr] gap-x-5 border-t border-line py-8 sm:grid-cols-[4ch_1fr] ${i === site.why.length - 1 ? "border-b" : ""}`}>
                <span className="t-mono t-small t-green pt-1.5">0{i + 1}</span>
                <div>
                  <h3 className="t-display-s max-w-[22ch]">{w.title}</h3>
                  <p className="t-body t-muted mt-3 max-w-[46ch]">{w.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <dl className="mt-24 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 lg:mt-32 lg:grid-cols-4" data-reveal-group>
          <div>
            <dd className="t-display-l t-mono font-medium tracking-tight"><span data-counter="100" data-suffix="+">100+</span></dd>
            <dt className="t-small t-muted mt-2">venues researched</dt>
          </div>
          <div>
            <dd className="t-display-l t-mono font-medium tracking-tight">1</dd>
            <dt className="t-small t-muted mt-2">industry, exclusively</dt>
          </div>
          <div>
            <dd className="t-display-l t-mono font-medium tracking-tight">4</dd>
            <dt className="t-small t-muted mt-2">connected marketing systems</dt>
          </div>
          <div>
            <dd className="t-display-l t-mono font-medium tracking-tight">2</dd>
            <dt className="t-small t-muted mt-2">founders, one focus</dt>
          </div>
        </dl>
      </div>
    </section>
  );
}
