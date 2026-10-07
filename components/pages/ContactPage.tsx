"use client";

import { useEffect, useRef } from "react";
import { live } from "@/content/live";
import { motion, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { onPageReveal } from "@/components/motion/Curtain";
import TracerMark from "@/components/ui/TracerMark";
import LeadForm from "@/components/ui/LeadForm";

/**
 * Contact, as the live page has it: book a free strategy call. The heading and what the call gives you on the
 * left, the real booking form (GoHighLevel / LeadConnector) on the right, on the deep green field.
 */
export default function ContactPage() {
  const root = useRef<HTMLElement>(null);
  const { contact } = live;
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap, SplitText } = registerGsap();
    const items = el.querySelectorAll<HTMLElement>("[data-enter]");
    const h1 = el.querySelector<HTMLElement>("h1");
    if (prefersReducedMotion() || !h1) { gsap.set(items, { clearProps: "all" }); if (h1) h1.style.opacity = "1"; return; }
    let split: InstanceType<typeof SplitText> | null = null;
    gsap.set(items, { opacity: 0, y: 18 });
    const off = onPageReveal(() => {
      split = SplitText.create(h1, { type: "lines", mask: "lines" });
      h1.style.opacity = "1";
      gsap.timeline({ defaults: { ease: motion.ease } })
        .from(split.lines, { yPercent: 110, duration: 1.3, stagger: 0.09 }, 0.1)
        .to(items, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.5);
    });
    return () => { off(); split?.revert(); };
  }, []);
  return (
    <main id="main">
      <section ref={root} data-theme="field" className="relative overflow-hidden" aria-labelledby="contact-title">
        <div aria-hidden="true" className="pointer-events-none absolute -right-[20vw] -top-[30vh] h-[80vh] w-[80vw] rounded-full opacity-70" style={{ background: "radial-gradient(closest-side, rgba(43,182,30,.28), transparent 70%)" }} />
        {/* the live page's outlined display word */}
        <div aria-hidden="true" className="outline-word pointer-events-none absolute bottom-[4vh] left-1/2 -translate-x-1/2 text-[17vw]">{contact.label}</div>
        <div className="wrap relative pb-24 pt-[calc(var(--nav-h)+56px)] lg:pb-32 lg:pt-[calc(var(--nav-h)+96px)]">
          <div className="grid-12 gap-y-14">
            <div className="col-span-12 lg:col-span-5">
              <TracerMark />
              <h1 id="contact-title" data-hero-title className="t-display-l mt-6 max-w-[12ch]">{contact.h1}</h1>
              <p data-enter className="t-standfirst t-muted mt-7 max-w-[44ch]">{contact.p}</p>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div data-enter className="panel panel-ink p-2 sm:p-3">
                <LeadForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
