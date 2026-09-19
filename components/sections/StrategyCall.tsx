"use client";

import { site } from "@/content/site";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";
import LeadForm from "@/components/ui/LeadForm";

/**
 * The strategy-call chapter. The concluding moment of every page: the deep green field, one headline,
 * what happens on the call, and the real booking form in an ink panel. Never a decorative button.
 */
export default function StrategyCall({ id = "strategy-call", heading = "Book a free strategy call.", asHero = false }: { id?: string; heading?: string; asHero?: boolean }) {
  const ref = useReveals<HTMLElement>();
  const H = asHero ? "h1" : "h2";
  const Step = asHero ? "h2" : "h3";
  return (
    <section ref={ref} id={id} data-theme="field" className="relative overflow-hidden" aria-labelledby={`${id}-title`}>
      {/* the screen glow: one radial, top right, motivated by the simulator screen */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-[20vw] -top-[30vh] h-[80vh] w-[80vw] rounded-full opacity-70" style={{ background: "radial-gradient(closest-side, rgba(43,182,30,.28), transparent 70%)" }} />
      <div className={`wrap relative ${asHero ? "pb-24 pt-[calc(var(--nav-h)+56px)] lg:pb-32 lg:pt-[calc(var(--nav-h)+96px)]" : "sect"}`}>
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <TracerMark />
            <H id={`${id}-title`} className="t-display-l mt-6 max-w-[12ch]" data-split>
              {heading}
            </H>
            <p className="t-standfirst t-muted mt-7 max-w-[44ch]" data-reveal data-delay="0.15">
              {site.strategyCall.text}
            </p>
            <ol className="mt-10 border-t border-line-dark" data-reveal-group>
              {site.strategyCall.steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[3ch_1fr] gap-4 border-b border-line-dark py-5">
                  <span className="t-mono t-small t-green pt-0.5">0{i + 1}</span>
                  <div>
                    <Step className="t-display-s text-[1.15rem]">{s.title}</Step>
                    <p className="t-small t-muted mt-1">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3" data-reveal data-delay="0.1">
              <div>
                <dt className="t-micro t-muted">Call us now</dt>
                <dd className="mt-1"><a href={site.phone.href} className="link t-small font-medium">{site.phone.display}</a></dd>
              </div>
              <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                <dt className="t-micro t-muted">Email address</dt>
                <dd className="mt-1"><a href={`mailto:${site.email}`} className="link t-small font-medium [overflow-wrap:anywhere]">{site.email}</a></dd>
              </div>
              <div>
                <dt className="t-micro t-muted">Location</dt>
                <dd className="t-small mt-1 font-medium">{site.location}</dd>
              </div>
            </dl>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="panel panel-ink p-2 sm:p-3" data-reveal="scale" data-delay="0.2">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <span className="t-small font-medium">Free Strategy Call</span>
                <span className="note hidden sm:inline">free · tell us about your venue</span>
              </div>
              <LeadForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
