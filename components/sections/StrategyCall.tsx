"use client";

import { live } from "@/content/live";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";
import LeadForm from "@/components/ui/LeadForm";

/**
 * The Free Strategy Call, as the homepage closes on it: the heading, what happens on the call, and the real booking
 * form (GoHighLevel / LeadConnector) in an ink panel on the deep green field.
 */
export default function StrategyCall() {
  const ref = useReveals<HTMLElement>();
  const { call } = live.home;
  return (
    <section ref={ref} id="strategy-call" data-theme="field" className="relative overflow-hidden" aria-labelledby="strategy-call-title">
      {/* the screen glow: one radial, top right, motivated by the simulator screen */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-[20vw] -top-[30vh] h-[80vh] w-[80vw] rounded-full opacity-70" style={{ background: "radial-gradient(closest-side, rgba(43,182,30,.28), transparent 70%)" }} />
      <div className="wrap sect relative">
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <TracerMark />
            <h1 id="strategy-call-title" className="t-display-l mt-6 max-w-[12ch]" data-split>{call.h1}</h1>
            <p className="t-standfirst t-muted mt-7 max-w-[44ch]" data-reveal data-delay="0.15">{call.p}</p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="panel panel-ink p-2 sm:p-3" data-reveal="scale" data-delay="0.2">
              <LeadForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
