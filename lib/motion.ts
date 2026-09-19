"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;
export function registerGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.defaults({ ease: "expo.out", duration: 1.1 });
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return { gsap, ScrollTrigger, SplitText };
}

/** Reduced motion: the OS preference, or `?nomotion` for reviewing layouts. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(window.location.search).has("nomotion");
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

/** Shared easing/duration vocabulary so every chapter moves the same way. */
export const motion = {
  ease: "expo.out",
  easeInOut: "expo.inOut",
  trace: "power2.inOut",
  duration: 1.15,
  stagger: 0.07,
  rise: 36,
  scrub: 0.8,
} as const;

/** Pin only on large pointer screens for people who have not asked for less motion. */
export const PIN_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** WebGL2 support, probed on a throwaway canvas so the render canvas keeps three.js's own context attributes. */
export function hasWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
