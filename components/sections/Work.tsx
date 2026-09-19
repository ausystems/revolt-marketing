"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { site } from "@/lib/site";
import { registerGsap } from "@/lib/motion";
import { useReveal } from "@/components/motion/useReveal";

/**
 * The image-led chapter. Eight creatives in one long row.
 * On pointer devices the strip pins in the middle of the viewport and slides
 * sideways as the visitor scrolls. On touch, or with reduced motion, it is a
 * native horizontal scroller with snapping. Nothing sits below it.
 */

/** Pin only on large pointer screens for people who have not asked for less motion. */
const PIN_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** PLACEHOLDER descriptions, in the order of site.creatives. Describe what is in each real creative. */
const ALT = [
  "Ad creative one",
  "Ad creative two",
  "Ad creative three",
  "Ad creative four",
  "Ad creative five",
  "Ad creative six",
  "Ad creative seven",
  "Ad creative eight",
];

/** The strip's edge: the page gutter, or the wrap's inset once the page is wider than the content max. */
const stripVars = {
  "--edge": "max(var(--gutter), calc((100% - var(--content-max)) / 2 + var(--gutter)))",
  // Vertical centre of a 72vh row (capped at 760px), plus a little so the title has fully left the frame when the pin starts.
  "--strip-gap": "calc(max(14vh, (100vh - 760px) / 2) + 24px)",
} as CSSProperties;

/**
 * The native scroller (touch, reduced motion, or a pointer screen under 1024px).
 * Keyboard reachable and named as a region. The scrollbar is hidden only where the
 * primary input is touch; pointer devices keep a thin native one so the overflow is
 * discoverable. The row inside rises 32px on reveal, so the clip box extends that far
 * below the frames (padding cancelled by the negative margin) and their rounded
 * bottoms are never cut during the rise.
 */
const SCROLLER_CLASS =
  "-mb-8 snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-8 scroll-pl-(--edge) [scrollbar-width:thin] pointer-coarse:[scrollbar-width:none] pointer-coarse:[&::-webkit-scrollbar]:hidden focus-visible:-outline-offset-2";

export default function Work() {
  const sectionRef = useReveal<HTMLElement>();
  const stripRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const [pinned, setPinned] = useState(false);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const strip = stripRef.current;
    const row = rowRef.current;
    if (!section || !strip || !row) return;
    const { gsap, ScrollTrigger } = registerGsap();

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        setPinned(true);
        // The row carries its own left and right edge, so the overflow is simply its width beyond the viewport.
        const distance = () => Math.max(0, row.offsetWidth - document.documentElement.clientWidth);
        const restTop = () => Math.round((window.innerHeight - strip.offsetHeight) / 2);
        gsap.to(row, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: strip,
            start: () => `top ${restTop()}`,
            end: () => `+=${distance()}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        return () => setPinned(false);
      });
    }, section);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [sectionRef]);

  // Warm the whole row once the chapter is within a viewport of the fold, so a fast
  // scrub through the pin never reaches a frame that is still a grey placeholder.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setWarm(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [sectionRef]);

  return (
    <section ref={sectionRef} data-theme="wash" className="relative pt-28 pb-24 lg:pt-[20vh] lg:pb-[18vh]" aria-labelledby="work-title">
      <div className="wrap">
        <div className="grid-12 items-end">
          <h2 id="work-title" className="t-display-l col-span-12 lg:col-span-8" data-reveal-lines>
            <span className="mask-line">
              <span>Work that</span>
            </span>
            <span className="mask-line">
              <span>picks a fight.</span>
            </span>
          </h2>
          <p
            className="t-standfirst col-span-12 mt-8 max-w-[40ch] text-balance text-muted lg:col-span-4 lg:col-start-9 lg:mt-0 lg:max-w-none"
            data-reveal="0.15"
          >
            Hooks, angles and formats tested in a structured system, so your best offers stop dying to ad fatigue.
          </p>
        </div>
      </div>

      {/* The strip. Full bleed, starting at the left gutter. */}
      <div className="mt-12 lg:mt-(--strip-gap)" style={stripVars}>
        <div
          ref={stripRef}
          className={pinned ? "overflow-x-clip" : SCROLLER_CLASS}
          tabIndex={pinned ? undefined : 0}
          role={pinned ? undefined : "region"}
          aria-label={pinned ? undefined : "Ad creatives"}
        >
          <ul ref={rowRef} role="list" aria-label={pinned ? "Ad creatives" : undefined} className="flex w-max gap-4 px-(--edge)" data-reveal>
            {site.creatives.map((src, i) => (
              <li key={src} className="media-cover aspect-[9/16] w-[72vw] shrink-0 snap-start md:h-[72vh] md:max-h-[760px] md:w-auto">
                <Image src={src} alt={ALT[i]} fill sizes="(min-width: 768px) 40vh, 72vw" loading={warm ? "eager" : "lazy"} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
