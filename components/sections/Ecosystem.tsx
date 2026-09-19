"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { systems } from "@/content/services";
import { useReveals } from "@/components/motion/useReveals";
import { hasWebGL2, isTouchDevice, prefersReducedMotion, registerGsap } from "@/lib/motion";
import TracerMark from "@/components/ui/TracerMark";
import type { EcosystemScene } from "@/components/scenes/EcosystemScene";

/**
 * The growth ecosystem. Four shots from four systems land on one venue as the visitor scrolls the panel through
 * the viewport. Not pinned: the draw is tied to the panel's own travel. Labels are HTML projected from 3D.
 */
export default function Ecosystem() {
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
    <section ref={ref} id="ecosystem" data-theme="ink" className="relative" aria-labelledby="eco-title">
      <div className="wrap sect pt-0 lg:pt-0">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-6">
            <TracerMark />
            <h2 id="eco-title" className="t-display-l mt-6 max-w-[11ch]" data-split>
              Four shots. One venue.
            </h2>
          </div>
          <p className="t-standfirst t-muted col-span-12 max-w-[42ch] lg:col-span-5 lg:col-start-8" data-reveal data-delay="0.15">
            Branding earns the first look. Growth fills the bays. Automation brings players back. Events fill the weekdays. Every one of them is traced to the same place: your venue.
          </p>
        </div>

        <div ref={stage} className="panel panel-ink relative mt-14 aspect-[4/5] sm:aspect-[16/11] lg:mt-20 lg:aspect-[16/8]" data-reveal="scale">
          <canvas ref={canvas} className={`block h-full w-full ${failed ? "hidden" : ""}`} aria-hidden="true" />
          {failed && (
            <div className="absolute inset-0 grid place-items-center p-8 text-center">
              <p className="t-standfirst t-muted max-w-[32ch]">Four systems, one venue: branding, growth, automation and events, all working on the same calendar.</p>
            </div>
          )}
          {/* projected labels */}
          {!failed && <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
            {systems.map((s, i) => (
              <div key={s.slug} ref={(el) => { labels.current[i] = el; }} className="absolute left-0 top-0 opacity-0" style={{ willChange: "transform, opacity" }}>
                <div className="-translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-full bg-ink/70 px-3 py-1.5 backdrop-blur-md">
                  <span className="t-mono t-micro text-green-soft mr-2">{s.n}</span>
                  <span className="t-micro font-medium text-paper">{s.name}</span>
                </div>
              </div>
            ))}
          </div>}
          {!failed && <p className="note absolute bottom-5 right-6 hidden lg:block">scroll · each system takes its shot</p>}
        </div>

        {/* legend: the four systems, lit as they land */}
        <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4" data-reveal-group>
          {systems.map((s, i) => (
            <li key={s.slug} className={`border-t pt-4 transition-colors duration-500 ${active >= i ? "border-green" : "border-line-dark"}`}>
              <Link href={s.slug} data-label={s.short} className="block">
                <span className={`t-mono t-micro transition-colors duration-500 ${active >= i ? "text-green-soft" : "t-muted"}`}>{s.n}</span>
                <span className="t-small mt-1 block font-medium">{s.name}</span>
                <span className="t-small t-muted mt-1 block">{s.subline}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
