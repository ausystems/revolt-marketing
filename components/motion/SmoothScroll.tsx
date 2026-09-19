"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { isTouchDevice, prefersReducedMotion, registerGsap } from "@/lib/motion";

/** Module-level handle so the curtain and anchors can drive the same scroller. */
let lenisRef: Lenis | null = null;
export const getLenis = () => lenisRef;

let programmatic = 0;
export const isProgrammaticScroll = () => programmatic > 0;

/** Smooth-scroll to a target; resolves to an absolute position first so the landing spot never depends on scroller state. */
export function scrollToTarget(target: number | string | Element, opts: { offset?: number; duration?: number } = {}) {
  let top = 0;
  if (typeof target === "number") top = target;
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY - (opts.offset ?? 84);
  }
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  top = Math.min(Math.max(0, top), max);
  programmatic++;
  // Lenis only fires onComplete for an uninterrupted scroll; the timer releases the counter if the visitor takes over.
  let settled = false;
  const done = () => { if (settled) return; settled = true; programmatic = Math.max(0, programmatic - 1); };
  const duration = opts.duration ?? 1.4;
  if (lenisRef) { lenisRef.scrollTo(top, { duration, onComplete: done }); setTimeout(done, duration * 1000 + 300); }
  else { window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" }); setTimeout(done, 900); }
}

/**
 * Inertial scrolling on pointer devices, wired into GSAP's ticker so ScrollTrigger and Lenis share one clock.
 * Native scrolling is kept on touch devices and whenever the visitor prefers reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("js");
    html.classList.remove("no-js");
    if (prefersReducedMotion()) html.classList.add("reduced-motion");
    if (isTouchDevice()) html.classList.add("touch");
    if (prefersReducedMotion() || isTouchDevice()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenisRef = lenis;
    // exposed for QA tooling: lets automated checks drive the scroller and the ticker
    (window as unknown as { __revolt: unknown }).__revolt = { lenis, gsap, ScrollTrigger };
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef = null;
    };
  }, []);

  // Same-page anchors glide; the nav offset is respected.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented) return;
      const id = decodeURIComponent(a.getAttribute("href")!.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", `#${id}`);
      scrollToTarget(target);
      // Move focus with the scroll so the skip link and in-page anchors work for keyboard and screen-reader users.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
