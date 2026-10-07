"use client";

import { useEffect, useRef, useState } from "react";
import { live } from "@/content/live";
import { useReveals } from "@/components/motion/useReveals";
import { hasWebGL2, isTouchDevice, prefersReducedMotion, registerGsap } from "@/lib/motion";
import TracerMark from "@/components/ui/TracerMark";
import type { EcosystemScene } from "@/components/scenes/EcosystemScene";

/**
 * Why golf simulator venues choose Revolt Marketing: four shots, one for each reason, land on one venue as the
 * visitor scrolls the panel through the viewport. Not pinned: the draw is tied to the panel's own travel.
 * Labels are HTML projected from 3D; the legend beneath carries each reason in full.
 */
export default function Ecosystem() {
  const { why } = live.home;
  const ref = useReveals<HTMLElement>();
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<EcosystemScene | null>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const lastProgress = useRef(0);

  const place = () => {
    const s = scene.current, host = stage.current;
    if (!s || !host) return;
    const pts = s.projectLaunch();
    const w = host.clientWidth, h = host.clientHeight;
    pts.forEach((p, i) => {
      const el = labels.current[i];
      if (!el) return;
      el.style.transform = `translate(${(p.x * w).toFixed(1)}px, ${(p.y * h).toFixed(1)}px)`;
      el.style.opacity = String(Math.min(1, p.active));
    });
  };

  useEffect(() => {
    let alive = true;
    const el = canvas.current, host = stage.current;
    if (!el || !host) return;
    if (!hasWebGL2()) { const id = requestAnimationFrame(() => setFailed(true)); return () => cancelAnimationFrame(id); }
    const reduced = prefersReducedMotion();
    let io: IntersectionObserver | null = null;
    const mount = async () => {
      try {
        const { EcosystemScene } = await import("@/components/scenes/EcosystemScene");
        if (!alive) return;
        const s = new EcosystemScene(el, host, { touch: isTouchDevice(), onFirstFrame: () => setReady(true), onContextLost: () => setFailed(true), onResize: () => place() });
        scene.current = s;
        // the visitor may already be past the panel: apply the progress the trigger has reached
        if (reduced) { s.setProgress(1); place(); setActive(3); } else { s.setProgress(lastProgress.current); place(); }
      } catch (e) { console.error(e); setFailed(true); }
    };
    // mount only once the panel is within a viewport of the fold
    io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io?.disconnect(); mount(); } }, { rootMargin: "80% 0px" });
    io.observe(host);
    return () => { alive = false; io?.disconnect(); scene.current?.dispose(); scene.current = null; };
  }, []);

  useEffect(() => {
    const host = stage.current;
    if (!host || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: host,
        start: "top 85%",
        end: "bottom 30%",
        scrub: 0.8,
        onUpdate: (self) => {
          lastProgress.current = self.progress;
          scene.current?.setProgress(self.progress);
          place();
          const p = self.progress;
          setActive(p < 0.06 ? -1 : p < 0.24 ? 0 : p < 0.42 ? 1 : p < 0.6 ? 2 : 3);
        },
      });
    }, host);
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    return () => { ctx.revert(); window.removeEventListener("resize", onResize); };
  }, []);

  useEffect(() => { if (ready) place(); }, [ready]);

  return (
    <section ref={ref} id="why-revolt" data-theme="ink" className="relative overflow-hidden" aria-labelledby="eco-title">
      {/* the live site's outlined display word */}
      <div aria-hidden="true" className="outline-word pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-[16vw]">{why.label}</div>
      <div className="wrap sect relative">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-9">
            <TracerMark />
            <h2 id="eco-title" className="t-display-l mt-6 max-w-[18ch]" data-split>
              {why.h2}
            </h2>
          </div>
        </div>

        <div ref={stage} className="panel panel-ink relative mt-14 aspect-[4/5] sm:aspect-[16/11] lg:mt-20 lg:aspect-[16/8]" data-reveal="scale">
          <canvas ref={canvas} className={`block h-full w-full ${failed ? "hidden" : ""}`} aria-hidden="true" />
          {/* projected labels */}
          {!failed && <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
            {why.items.map((w, i) => (
              <div key={w.title} ref={(el) => { labels.current[i] = el; }} className="absolute left-0 top-0 opacity-0" style={{ willChange: "transform, opacity" }}>
                <div className="w-max max-w-[17rem] -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-[14px] bg-ink/70 px-3.5 py-2 text-center backdrop-blur-md">
                  <span className="t-micro font-medium leading-snug text-paper">{w.title}</span>
                </div>
              </div>
            ))}
          </div>}
        </div>

        {/* the four reasons, each lit as its shot lands */}
        <ol className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
          {why.items.map((w, i) => (
            <li key={w.title} className={`border-t pt-5 transition-colors duration-500 ${active >= i ? "border-green" : "border-line-dark"}`}>
              <p className="t-display-s text-[1.15rem]">{w.title}</p>
              <p className="t-small t-muted mt-3 max-w-[36ch]">{w.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
