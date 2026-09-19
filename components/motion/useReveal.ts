"use client";

import { useEffect, useRef } from "react";
import { motion, prefersReducedMotion, registerGsap } from "@/lib/motion";

/**
 * Reveals descendants on scroll.
 *  - [data-reveal]            : fades and rises as one block
 *  - [data-reveal-lines] > *  : children rise one after another (use with .mask-line for masked text)
 * With prefers-reduced-motion nothing animates; the CSS leaves everything visible.
 */
export function useReveal<T extends HTMLElement>(options?: { start?: string; once?: boolean }) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const start = options?.start ?? "top 82%";
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const delay = Number(el.dataset.reveal) || 0;
        gsap.fromTo(
          el,
          { opacity: 0, y: motion.rise },
          {
            opacity: 1,
            y: 0,
            duration: motion.duration,
            delay,
            ease: motion.ease,
            scrollTrigger: { trigger: el, start, once: options?.once ?? true },
          },
        );
      });
      root.querySelectorAll<HTMLElement>("[data-reveal-lines]").forEach((group) => {
        const lines = Array.from(group.children) as HTMLElement[];
        const targets = lines.map((l) => (l.classList.contains("mask-line") ? l.firstElementChild : l)) as HTMLElement[];
        gsap.set(lines, { opacity: 1 });
        gsap.fromTo(
          targets,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: motion.duration,
            ease: motion.ease,
            stagger: motion.stagger,
            scrollTrigger: { trigger: group, start, once: options?.once ?? true },
          },
        );
      });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [options?.start, options?.once]);
  return ref;
}
