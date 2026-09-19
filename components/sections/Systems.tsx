"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { systems } from "@/content/services";
import { useReveals } from "@/components/motion/useReveals";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

/**
 * The four systems as an editorial index rather than four cards. Each entry names the system, its promise and
 * its sub-services. On large screens a sticky stage on the right shows the active system's scene, crossfading as
 * the visitor scrolls or hovers; on small screens each entry carries its own image.
 */
export default function Systems() {
  const ref = useReveals<HTMLElement>();
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const hover = useRef<number | null>(null);

  // The entry nearest the middle of the viewport is active (so touch devices get the stage too).
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (hover.current !== null) return;
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: 0 },
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  // Crossfade the stage.
  useEffect(() => {
    const { gsap } = registerGsap();
    const reduced = prefersReducedMotion();
    frames.current.forEach((f, i) => {
      if (!f) return;
      const on = i === active;
      if (reduced) { gsap.set(f, { opacity: on ? 1 : 0 }); return; }
      gsap.to(f, { opacity: on ? 1 : 0, scale: on ? 1 : 1.04, duration: 0.9, ease: "power2.out", overwrite: true });
    });
  }, [active]);

  return (
    <section ref={ref} id="systems" data-theme="ink" className="relative" aria-labelledby="systems-title">
      <div className="wrap sect">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <TracerMark />
            <h2 id="systems-title" className="t-display-l mt-6 max-w-[12ch]" data-split>
              Four connected systems.
            </h2>
          </div>
          <p className="t-standfirst t-muted col-span-12 max-w-[40ch] lg:col-span-4 lg:col-start-9" data-reveal data-delay="0.15">
            The only golf simulator marketing company built exclusively for golf simulator entertainment venues across North America. Each system works on its own. Together they fill the calendar.
          </p>
        </div>

        <div className="grid-12 mt-16 lg:mt-24">
          <ol className="col-span-12 lg:col-span-7">
            {systems.map((s, i) => (
              <li
                key={s.slug}
                ref={(el) => { rows.current[i] = el; }}
                data-index={i}
                className={`group relative border-t border-line-dark py-9 transition-colors duration-500 lg:py-12 ${i === systems.length - 1 ? "border-b" : ""}`}
                onMouseEnter={() => { hover.current = i; setActive(i); }}
                onMouseLeave={() => { hover.current = null; }}
                data-reveal
              >
                {/* small screens: the scene sits inside the entry */}
                <div className="media-cover mb-7 aspect-[16/10] lg:hidden">
                  <Image src={s.image} alt={s.imageAlt} fill sizes="100vw" />
                </div>
                <div className="grid grid-cols-[3ch_1fr] gap-x-5 sm:grid-cols-[4ch_1fr]">
                  <span className={`t-mono t-small pt-2 transition-colors duration-500 ${active === i ? "t-green" : "t-muted"}`}>{s.n}</span>
                  <div>
                    <h3 className="t-display-m">
                      <Link href={s.slug} data-label={s.short} className="transition-colors duration-500 group-hover:text-green-soft after:absolute after:inset-0 after:content-['']">
                        {s.name}
                      </Link>
                    </h3>
                    <p className="t-standfirst t-muted mt-4 max-w-[44ch]">{s.promise}</p>
                    <ul className="relative z-10 mt-6 flex flex-wrap gap-x-5 gap-y-2">
                      {s.children.map((c) => (
                        <li key={c.slug}>
                          <Link href={c.slug} data-label={s.short} className="link-quiet t-small t-muted hover:text-paper">{c.name}</Link>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-7 inline-flex items-center gap-2 t-small font-medium text-paper">
                      Explore {s.short.toLowerCase()}
                      <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* the stage */}
          <div className="col-span-12 hidden lg:col-span-4 lg:col-start-9 lg:block">
            <div className="sticky top-[calc(var(--nav-h)+24px)]">
              <div className="panel panel-ink relative aspect-[4/5]" aria-hidden="true">
                {systems.map((s, i) => (
                  <div key={s.slug} ref={(el) => { frames.current[i] = el; }} className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                    <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                      <span className="t-mono t-small text-green-soft">{s.n}</span>
                      <span className="t-small font-medium text-paper">{s.subline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
