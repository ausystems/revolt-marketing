"use client";

import Image from "next/image";
import { live } from "@/content/live";
import PageHero from "@/components/sections/PageHero";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";

const PHOTOS: Record<string, string> = { "Shayne Mueller": "/media/founder-shayne.jpg", "Tristan Costa": "/media/founder-tristan.jpg" };

/**
 * About, as the live page has it: meet the team, the two founders (each a spread of their own, offset so they never
 * mirror), why Revolt was built for golf simulator venues, and the approach.
 */
export default function AboutPage() {
  const founders = useReveals<HTMLElement>();
  const story = useReveals<HTMLElement>();
  const approach = useReveals<HTMLElement>();
  const { about } = live;
  return (
    <main id="main">
      <PageHero title={about.h1} standfirst={about.p} />

      <section ref={founders} data-theme="ink" className="relative" aria-label={about.h1}>
        <div className="wrap pb-24 lg:pb-32">
          {about.founders.map((f, i) => (
            <article key={f.name} className={`grid-12 gap-y-10 border-t border-line-dark pt-14 lg:pt-20 ${i ? "mt-20 lg:mt-28" : ""}`} aria-labelledby={`founder-${i}`}>
              <div className={`col-span-12 sm:col-span-8 lg:col-span-5 ${i ? "sm:col-start-5 lg:order-2 lg:col-start-8" : ""}`}>
                <div className="media-cover aspect-[4/5]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
                  <Image src={PHOTOS[f.name] ?? "/media/founder-shayne.jpg"} alt={f.name} fill priority={!i} sizes="(min-width: 1024px) 40vw, 100vw" className="scale-[1.06]" data-parallax="0.05" />
                </div>
              </div>
              <div className={`col-span-12 lg:col-span-6 lg:pt-10 ${i ? "lg:order-1" : "lg:col-start-7"}`}>
                <TracerMark />
                <h3 id={`founder-${i}`} className="t-display-l mt-5" data-split>{f.name}</h3>
                <p className="t-standfirst t-muted mt-8 max-w-[54ch]" data-reveal data-delay="0.1">{f.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section ref={story} data-theme="paper" className="relative" aria-labelledby="story-title">
        <div className="wrap sect">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-6">
              <TracerMark />
              <h3 id="story-title" className="t-display-l mt-6 max-w-[16ch]" data-split>{about.why.h3}</h3>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-3">
              {about.why.ps.map((p, i) => (
                <p key={i} className={`t-standfirst ${i === 0 ? "text-ink" : "t-muted mt-6"}`} data-reveal data-delay={String(i * 0.1)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={approach} data-theme="paper-2" className="relative" aria-labelledby="approach-title">
        <div className="wrap sect">
          <div className="grid-12 gap-y-10">
            <div className="col-span-12 lg:col-span-4">
              <div className="lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
                <TracerMark />
                <h3 id="approach-title" className="t-display-m mt-5 max-w-[12ch]" data-split>{about.approach.h3}</h3>
              </div>
            </div>
            <ul className="col-span-12 lg:col-span-7 lg:col-start-6" data-reveal-group data-stagger="0.1">
              {about.approach.items.map((a, i) => (
                <li key={a.title} className={`border-t border-line py-7 ${i === about.approach.items.length - 1 ? "border-b" : ""}`}>
                  <p className="t-display-s">{a.title}</p>
                  <p className="t-body t-muted mt-2.5 max-w-[48ch]">{a.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
