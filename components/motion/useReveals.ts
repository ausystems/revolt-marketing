"use client";

import { useEffect, useRef } from "react";
import { motion, prefersReducedMotion, registerGsap } from "@/lib/motion";

/**
 * Generic reveal choreography for everything inside a section.
 *  - [data-split]          : headline split into real lines, each rising out of its own mask
 *  - [data-reveal]         : `up` (default) | `fade` | `scale`; optional data-delay
 *  - [data-reveal-group]   : children rise one after another (data-stagger)
 *  - [data-counter="100"]  : counts up from 0 (data-suffix, data-prefix)
 *  - [data-tracer]         : draws the tracer mark inside
 *  - [data-parallax=".12"] : gentle scroll parallax
 * With reduced motion nothing animates; the CSS leaves everything visible.
 */
export function useReveals<T extends HTMLElement>(options?: { start?: string }) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    const { gsap, ScrollTrigger, SplitText } = registerGsap();
    const start = options?.start ?? "top 86%";
    if (reduced) {
      root.querySelectorAll<HTMLElement>("[data-reveal],[data-split],[data-reveal-group] > *").forEach((el) => (el.style.opacity = "1"));
      root.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => (el.textContent = format(el, Number(el.dataset.counter))));
      root.querySelectorAll<HTMLElement>("[data-tracer] .tracer-mark, [data-tracer] .diagram").forEach((el) => el.classList.add("is-drawn"));
      return;
    }
    const splits: InstanceType<typeof SplitText>[] = [];
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        el.style.opacity = "1";
        // autoSplit re-splits on resize and late font loads; the tween lives in onSplit so it follows the new lines.
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line-inner",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.25,
              ease: motion.ease,
              stagger: motion.stagger,
              delay: parseFloat(el.dataset.delay || "0"),
              scrollTrigger: { trigger: el, start, once: true },
            }),
        });
        splits.push(split);
      });

      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const kind = el.dataset.reveal || "up";
        const delay = parseFloat(el.dataset.delay || "0");
        const from = kind === "fade" ? { opacity: 0 } : kind === "scale" ? { opacity: 0, scale: 0.94 } : { opacity: 0, y: motion.rise };
        gsap.fromTo(el, from, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: motion.duration,
          ease: motion.ease,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
          onComplete: () => gsap.set(el, { clearProps: "transform" }),
        });
      });

      root.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[];
        const stagger = Math.min(parseFloat(group.dataset.stagger || "0.08"), 0.8 / Math.max(1, items.length));
        gsap.fromTo(items, { opacity: 0, y: motion.rise }, {
          opacity: 1,
          y: 0,
          duration: motion.duration,
          ease: motion.ease,
          stagger,
          scrollTrigger: { trigger: group, start, once: true },
          onComplete: () => gsap.set(items, { clearProps: "transform" }),
        });
      });

      root.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const to = Number(el.dataset.counter);
        const obj = { v: 0 };
        el.textContent = format(el, 0);
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => gsap.to(obj, { v: to, duration: 1.8, ease: "expo.out", onUpdate: () => (el.textContent = format(el, obj.v)) }),
        });
      });

      root.querySelectorAll<HTMLElement>("[data-tracer]").forEach((holder) => {
        const paths = holder.querySelectorAll<SVGPathElement>(".tracer-mark path, .diagram .trace");
        if (!paths.length) return;
        ScrollTrigger.create({
          trigger: holder,
          start: "top 88%",
          once: true,
          onEnter: () => gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, ease: motion.trace, stagger: 0.12 }),
        });
      });

      root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = parseFloat(el.dataset.parallax || "0.12") * 100;
        gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });
    }, root);
    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      splits.forEach((s) => s.revert());
    };
  }, [options?.start]);
  return ref;
}

function format(el: HTMLElement, v: number) {
  const decimals = Number(el.dataset.decimals || 0);
  const n = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${el.dataset.prefix || ""}${n}${el.dataset.suffix || ""}`;
}
