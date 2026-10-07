"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { live } from "@/content/live";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import { useReveals } from "@/components/motion/useReveals";

/**
 * The live site's Four Step Process, with its own illustrations: four greens joined by three paths, laid out in
 * the same zig-zag (positions measured from the live page, in a 1240 × 470 frame). Scrolling plays the round:
 * each green rises in, its step is read, then the path draws on to the next.
 */
const FRAME = { x: -130, y: 110, w: 1240, h: 470 };
const pct = (v: number, o: number, d: number) => `${(((v - o) / d) * 100).toFixed(3)}%`;
const box = (x: number, y: number, w: number, h: number) => ({ left: pct(x, FRAME.x, FRAME.w), top: pct(y, FRAME.y, FRAME.h), width: `${((w / FRAME.w) * 100).toFixed(3)}%`, height: `${((h / FRAME.h) * 100).toFixed(3)}%` });

const GREENS = [
  { src: "/media/process/step-1.webp", w: 1000, h: 807, ...{ x: -96.7, y: 138.9, bw: 266.4, bh: 215 } },
  { src: "/media/process/step-2.webp", w: 1000, h: 614, ...{ x: 172.4, y: 374.7, bw: 308.5, bh: 189.5 } },
  { src: "/media/process/step-3.webp", w: 1000, h: 689, ...{ x: 475.9, y: 151.5, bw: 286.5, bh: 197.4 } },
  { src: "/media/process/step-4.webp", w: 1000, h: 636, ...{ x: 806.5, y: 358.1, bw: 285.4, bh: 181.4 } },
];
const PATHS = [
  { src: "/media/process/path-1.webp", w: 952, h: 466, x: 97, y: 317.9, bw: 176.6, bh: 86.5 },
  { src: "/media/process/path-2.webp", w: 1000, h: 667, x: 306, y: 250.8, bw: 281, bh: 203.2 },
  { src: "/media/process/path-3.webp", w: 915, h: 682, x: 706.8, y: 317.4, bw: 143, bh: 106.6 },
];
/** Where each step's number, name and line sit (the live layout's text columns). */
const TEXT = [
  { x: -120, y: 346 },
  { x: 165, y: 126 },
  { x: 477, y: 351 },
  { x: 784, y: 154 },
];

export default function FourStepProcess() {
  const ref = useReveals<HTMLElement>();
  const frame = useRef<HTMLDivElement>(null);
  const { process } = live.home;

  useEffect(() => {
    const el = frame.current;
    if (!el || prefersReducedMotion()) return;
    const big = el.querySelector<HTMLElement>(".process-frame")!;
    const list = el.querySelector<HTMLElement>("ol")!;
    const greens = big.querySelectorAll<HTMLElement>("[data-green]");
    const texts = big.querySelectorAll<HTMLElement>("[data-step]");
    const paths = big.querySelectorAll<HTMLElement>("[data-path]");
    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1280px)", () => {
      gsap.set(greens, { opacity: 0, y: 34, scale: 0.9, transformOrigin: "50% 70%" });
      gsap.set(texts, { opacity: 0, y: 22 });
      gsap.set(paths, { clipPath: "inset(0 100% 0 0)" });
      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 62%", scrub: 0.9 } });
      for (let i = 0; i < 4; i++) {
        tl.to(greens[i], { opacity: 1, y: 0, scale: 1, duration: 1 }, i * 1.25)
          .to(texts[i], { opacity: 1, y: 0, duration: 0.8 }, i * 1.25 + 0.3);
        if (paths[i]) tl.to(paths[i], { clipPath: "inset(0 0% 0 0)", duration: 0.75, ease: "power1.inOut" }, i * 1.25 + 0.7);
      }
    });
    mm.add("(max-width: 1279px)", () => {
      list.querySelectorAll<HTMLElement>("li").forEach((li) => {
        gsap.fromTo(li.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: li, start: "top 85%" } });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} id="process" data-theme="ink" className="relative overflow-hidden" aria-labelledby="process-title">
      {/* the live site's outlined display word */}
      <div aria-hidden="true" className="outline-word pointer-events-none absolute left-1/2 top-[6vh] -translate-x-1/2 text-[22vw]">{process.label}</div>
      <div className="wrap sect relative">
        <div className="grid-12 items-end gap-y-6">
          <div className="col-span-12 flex items-center gap-5 lg:col-span-6">
            <h2 id="process-title" className="t-display-l" data-split>{process.h2}</h2>
            <svg aria-hidden="true" viewBox="0 0 120 24" className="hidden h-6 w-28 shrink-0 text-green sm:block" fill="none">
              <path d="M2 12h112M104 3l10 9-10 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="t-standfirst t-muted col-span-12 max-w-[46ch] lg:col-span-5 lg:col-start-8" data-reveal data-delay="0.12">{process.p}</p>
        </div>

        {/* the round, in the live layout (large screens) */}
        <div ref={frame} className="relative mt-16 lg:mt-20">
          <div className="process-frame relative hidden xl:block" style={{ aspectRatio: `${FRAME.w} / ${FRAME.h}` }}>
            {PATHS.map((p) => (
              <div key={p.src} data-path className="absolute" style={box(p.x, p.y, p.bw, p.bh)}>
                <Image src={p.src} alt="" fill sizes="20vw" className="object-fill" />
              </div>
            ))}
            {GREENS.map((g, i) => (
              <div key={g.src} data-green className="absolute" style={{ ...box(g.x, g.y, g.bw, g.bh), ["--float-delay" as string]: `${i * -1.6}s` }}>
                <Image src={g.src} alt="" fill sizes="25vw" className="process-float object-contain" />
              </div>
            ))}
            {process.steps.map((s, i) => (
              <div key={s.title} data-step className="absolute w-[25%]" style={{ left: pct(TEXT[i].x, FRAME.x, FRAME.w), top: pct(TEXT[i].y, FRAME.y, FRAME.h) }}>
                <p className="process-n">{s.n}</p>
                <p className="process-title">{s.title}</p>
                <p className="process-text">{s.text}</p>
              </div>
            ))}
          </div>

          {/* the same round, one green after another (smaller screens) */}
          <ol className="grid grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-x-10 xl:hidden">
            {process.steps.map((s, i) => (
              <li key={s.title}>
                <div className="relative mx-auto aspect-[3/2] w-full max-w-[380px]">
                  <Image src={GREENS[i].src} alt="" fill sizes="(min-width: 640px) 45vw, 90vw" className="object-contain" />
                </div>
                <div className="mt-6">
                  <p className="process-n">{s.n}</p>
                  <p className="process-title">{s.title}</p>
                  <p className="process-text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
