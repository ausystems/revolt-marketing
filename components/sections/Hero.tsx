"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { hasWebGL2, isTouchDevice, motion, PIN_QUERY, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { onPageReveal } from "@/components/motion/Curtain";
import { Arrow } from "@/components/ui/Button";
import type { BayScene } from "@/components/scenes/BayScene";

/**
 * Opening chapter. The simulator bay at night behind a typographic statement.
 * On large pointer screens the section pins and scrolling takes the shot: the ball launches, the tracer draws to
 * the screen and the shot ends there, in a bloom of light. On touch the scene follows the page. With reduced motion,
 * one settled frame: the shot complete.
 */
export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const scene = useRef<BayScene | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const lastProgress = useRef(0);

  // Mount the scene lazily; three.js is code-split away from the main bundle.
  useEffect(() => {
    let alive = true;
    const el = canvas.current, host = stage.current;
    if (!el || !host) return;
    if (!hasWebGL2()) { const id = requestAnimationFrame(() => setFailed(true)); return () => cancelAnimationFrame(id); }
    const reduced = prefersReducedMotion();
    (async () => {
      try {
        const { BayScene } = await import("@/components/scenes/BayScene");
        if (!alive) return;
        const s = new BayScene(el, host, { touch: isTouchDevice(), reduced, onFirstFrame: () => setReady(true), onContextLost: () => setFailed(true) });
        scene.current = s;
        s.setProgress(reduced ? 1 : lastProgress.current);
      } catch (e) {
        console.error(e);
        setFailed(true);
      }
    })();
    return () => { alive = false; scene.current?.dispose(); scene.current = null; };
  }, []);

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const reduced = prefersReducedMotion();
    const lines = headline.current?.querySelectorAll<HTMLElement>(".mask-line > span") ?? [];
    const items = copy.current?.querySelectorAll<HTMLElement>("[data-enter]") ?? [];

    const ctx = gsap.context(() => {
      // Entrance: waits for the curtain.
      if (reduced) {
        gsap.set([lines, items, note.current], { clearProps: "all" });
      } else {
        gsap.set(lines, { yPercent: 110 });
        gsap.set(items, { opacity: 0, y: 18 });
        gsap.set(note.current, { opacity: 0 });
        onPageReveal(() => {
          gsap.timeline({ defaults: { ease: motion.ease } })
            .to(lines, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.1)
            .to(items, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.7)
            .to(note.current, { opacity: 1, duration: 1 }, 1.2);
        });
      }

      const mm = gsap.matchMedia();
      // Pinned shot on large pointer screens.
      mm.add(PIN_QUERY, () => {
        if (reduced) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: "+=170%",
            pin: true,
            scrub: motion.scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => { lastProgress.current = self.progress; scene.current?.setProgress(self.progress); },
          },
        });
        tl.to(headline.current, { opacity: 0, y: -60, duration: 0.22, ease: "power1.in" }, 0.02)
          .to(copy.current, { opacity: 0, y: -30, duration: 0.18, ease: "power1.in" }, 0)
          .to(note.current, { opacity: 0, duration: 0.1, ease: "power1.in" }, 0)
          // the type's shade lifts with the type, so the shot plays out in the bay's own light
          .to(veil.current, { opacity: 0, duration: 0.3, ease: "sine.inOut" }, 0.06)
          .to({}, { duration: 0.76 }, 0.24);
      });
      // Everywhere else: the scene follows the page without pinning.
      mm.add("(max-width: 1023px), (hover: none), (pointer: coarse)", () => {
        if (reduced) return;
        ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          end: "bottom top",
          scrub: true,
          // the strike lands by the time half the hero has scrolled away; the rest of the way it holds
          onUpdate: (self) => { const p = Math.min(1, self.progress * 1.9); lastProgress.current = p; scene.current?.setProgress(p); },
        });
      });
    }, sec);

    // Pointer parallax on the stage (desktop only).
    const onMove = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect();
      scene.current?.setPointer(((e.clientX - r.left) / r.width - 0.5) * 2, -((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const onLeave = () => scene.current?.setPointer(0, 0);
    if (!isTouchDevice() && !reduced) { sec.addEventListener("pointermove", onMove); sec.addEventListener("pointerleave", onLeave); }
    ScrollTrigger.refresh();
    return () => { ctx.revert(); sec.removeEventListener("pointermove", onMove); sec.removeEventListener("pointerleave", onLeave); };
  }, []);

  // Fade the poster out once the scene has drawn its first frame.
  useEffect(() => {
    if (!ready || !poster.current) return;
    const { gsap } = registerGsap();
    gsap.to(poster.current, { opacity: 0, duration: 1.2, ease: "power2.out" });
  }, [ready]);
  // If the context is lost after the fade, the photograph comes back as the permanent stage.
  useEffect(() => {
    if (!failed || !poster.current) return;
    const { gsap } = registerGsap();
    gsap.killTweensOf(poster.current);
    gsap.set(poster.current, { opacity: 1 });
  }, [failed]);

  return (
    <section ref={section} data-theme="ink" className="relative flex min-h-[max(640px,100svh)] flex-col overflow-hidden lg:h-[100svh]" aria-label="Introduction">
      {/* The stage: the real-time bay, with the venue photograph as its poster and fallback. */}
      <div ref={stage} className="absolute inset-0" aria-hidden="true">
        <canvas ref={canvas} className={`block h-full w-full ${failed ? "hidden" : ""}`} />
        <div ref={poster} className="absolute inset-0">
          <Image src="/media/hero-bay.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[62%_50%] opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
        </div>
        {/* legibility: quiet gradients beneath the nav and the type, never a scrim over the screen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-ink/70 to-transparent" />
        <div ref={veil} className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-ink/75 via-ink/30 to-transparent" />
        </div>
      </div>

      <div className="wrap relative flex w-full grow flex-col justify-end pb-10 sm:pb-14 lg:h-full lg:pb-16" style={{ paddingTop: "calc(var(--nav-h) + 24px)" }}>
        <h1 ref={headline} className="t-display-xl max-w-[15ch] text-paper">
          <span className="mask-line"><span>Marketing built</span></span>
          <span className="mask-line"><span>exclusively for</span></span>
          <span className="mask-line"><span className="t-green">golf simulator venues.</span></span>
        </h1>
        <div ref={copy} className="mt-8 grid grid-cols-1 gap-7 lg:mt-10 lg:grid-cols-12">
          <p data-enter className="t-standfirst text-paper/85 max-w-[44ch] lg:col-span-6">
            Most golf simulator venues struggle with inconsistent walk-in traffic and empty weekdays. Revolt is the only golf simulator marketing company built exclusively for golf entertainment venues across North America — proven strategies that fill your bays, book corporate events, and maximize revenue.
          </p>
          <div data-enter className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:col-span-6">
            <Link href="/contact-us" data-label="Free Strategy Call" className="btn btn-lg">
              Book a free strategy call
              <Arrow />
            </Link>
            <Link href="/services" data-label="Services" className="link t-small font-medium text-paper">
              See the four systems
            </Link>
          </div>
        </div>
        <p ref={note} className="note hero-note mt-8 hidden lg:block">scroll to take the shot</p>
      </div>
      <p className="sr-only">A real-time rendering of a golf simulator bay at night: as the page scrolls, a ball launches from the hitting mat and its glowing shot tracer arcs through the air until the ball strikes the screen.</p>
    </section>
  );
}
