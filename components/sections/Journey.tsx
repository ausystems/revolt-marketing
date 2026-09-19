"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useReveals } from "@/components/motion/useReveals";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

/** The customer journey as one tracer with five stops. Conceptual, not a chart: no invented figures. */
const STOPS = [
  { n: "01", name: "Discover", text: "They search “golf simulator near me” and find you first.", via: "Growth: SEO, Google Ads, Meta ads" },
  { n: "02", name: "Book", text: "A clear website and landing page turn the search into a reservation.", via: "Branding: website, landing pages, Google profile" },
  { n: "03", name: "Visit", text: "The experience inside your venue does what it does best.", via: "Your venue" },
  { n: "04", name: "Return", text: "Automated reminders and offers bring them back for the next session.", via: "Automation: re-booking, email and SMS" },
  { n: "05", name: "Refer", text: "Leagues, events, memberships and reviews turn regulars into advocates.", via: "Events: leagues, memberships, reviews" },
];
/* x positions along the wide path, matching the five stops */
const XS = [70, 340, 600, 860, 1130];
const YS = [246, 120, 176, 96, 150];

export default function Journey() {
  const ref = useReveals<HTMLElement>();
  const path = useRef<SVGPathElement>(null);
  const glow = useRef<SVGPathElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stops = useRef<(HTMLLIElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const reduced = prefersReducedMotion();
    const light = (upto: number) => {
      stops.current.forEach((s, i) => s?.classList.toggle("is-lit", i <= upto));
      dots.current.forEach((d, i) => d?.setAttribute("opacity", i <= upto ? "1" : "0.25"));
    };
    const draw = (v: number) => { if (path.current) path.current.style.strokeDashoffset = String(v); if (glow.current) glow.current.style.strokeDashoffset = String(v); };
    if (reduced) { draw(0); light(4); if (rail.current) rail.current.style.transform = "scaleY(1)"; return; }
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      const obj = { p: 0 };
      gsap.to(obj, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: host, start: "top 75%", end: "bottom 45%", scrub: 0.8, onUpdate: () => {
          const p = obj.p;
          draw(1 - p);
          if (rail.current) rail.current.style.transform = `scaleY(${p})`;
          light(p < 0.04 ? -1 : p < 0.26 ? 0 : p < 0.5 ? 1 : p < 0.74 ? 2 : p < 0.96 ? 3 : 4);
        } },
      });
    }, host);
    return () => ctx.revert();
  }, []);

  const d = `M${XS[0]} ${YS[0]} C 180 ${YS[0]}, 230 ${YS[1]}, ${XS[1]} ${YS[1]} S 520 ${YS[2]}, ${XS[2]} ${YS[2]} S 780 ${YS[3]}, ${XS[3]} ${YS[3]} S 1040 ${YS[4]}, ${XS[4]} ${YS[4]}`;

  return (
    <section ref={ref} id="journey" data-theme="paper-2" className="relative" aria-labelledby="journey-title">
      <div className="wrap sect">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <TracerMark />
            <h2 id="journey-title" className="t-display-l mt-6 max-w-[14ch]" data-split>
              Why digital marketing matters for golf venues.
            </h2>
          </div>
          <p className="t-standfirst t-muted col-span-12 max-w-[42ch] lg:col-span-5 lg:col-start-8" data-reveal data-delay="0.15">
            Don’t just rely on walk‑ins or word of mouth. Your golf simulator venue needs a solid digital presence to truly grow. Without it, you’re missing out on bookings and revenue. We build a strong foundation that increases your online visibility, keeps customers engaged, and fuels lasting growth.
          </p>
        </div>

        <div ref={stage} className="mt-16 lg:mt-24">
          {/* wide: one tracer through five stops */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <svg viewBox="0 0 1200 300" className="w-full" fill="none">
              <path d={d} stroke="#2BB61E" strokeWidth="8" strokeLinecap="round" opacity="0.18" pathLength={1} ref={glow} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
              <path d={d} stroke="#2BB61E" strokeWidth="1.75" strokeLinecap="round" pathLength={1} ref={path} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
              {XS.map((x, i) => (
                <g key={i}>
                  <circle cx={x} cy={YS[i]} r="14" fill="#F4F5F2" />
                  <circle ref={(el) => { dots.current[i] = el; }} cx={x} cy={YS[i]} r="5" fill="#2BB61E" opacity="0.25" style={{ transition: "opacity .5s" }} />
                </g>
              ))}
            </svg>
          </div>
          <ol className="relative grid grid-cols-1 gap-y-8 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-0">
            {/* small screens: a vertical rail that fills */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line lg:hidden" aria-hidden="true">
              <div ref={rail} className="h-full w-full origin-top bg-green" style={{ transform: "scaleY(0)" }} />
            </div>
            {STOPS.map((s, i) => (
              <li key={s.n} ref={(el) => { stops.current[i] = el; }} className="group relative pl-8 lg:pl-0 [&.is-lit_.dot]:bg-green [&.is-lit_.dot]:scale-100 [&.is-lit_.num]:text-green">
                <span className="dot absolute left-0 top-1.5 h-[15px] w-[15px] scale-75 rounded-full bg-paper-3 ring-4 ring-paper-2 transition-all duration-500 lg:hidden" aria-hidden="true" />
                <span className="num t-mono t-small t-muted transition-colors duration-500">{s.n}</span>
                <h3 className="t-display-s mt-1">{s.name}</h3>
                <p className="t-small mt-2 max-w-[30ch] text-ink/80">{s.text}</p>
                <p className="t-micro t-muted mt-3 max-w-[30ch]">{s.via}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-24 grid-12 items-end gap-y-8 border-t border-line pt-12 lg:mt-32">
          <p className="t-display-m col-span-12 max-w-[22ch] lg:col-span-8" data-split>
            Growth isn’t just about clicks. It’s about building something that <span className="t-green">lasts.</span>
          </p>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:justify-self-end" data-reveal>
            <p className="t-small t-muted max-w-[36ch]">Whether you’re just getting started or ready to scale, we’re here to build the system that brings in leads week after week.</p>
            <Link href="/contact-us" data-label="Free Strategy Call" className="btn btn-ink mt-6">
              Let’s build your growth engine
              <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
