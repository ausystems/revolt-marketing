"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import PageHero from "@/components/sections/PageHero";
import StrategyCall from "@/components/sections/StrategyCall";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

/**
 * About: two founders, one focus. Each founder is a spread of their own — portrait and words, offset so the two
 * never mirror. Then why Revolt specialized, then the approach as a ledger.
 */
export default function AboutPage() {
  const founders = useReveals<HTMLElement>();
  const story = useReveals<HTMLElement>();
  const approach = useReveals<HTMLElement>();
  const [shayne, tristan] = site.founders;
  return (
    <main id="main">
      <PageHero
        title="Two founders. One focus."
        standfirst="Filling golf simulator venues across North America with clients who book, return, and refer."
        eyebrow="About us · Toronto, Canada"
        aside={
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line-dark pt-4">
            {site.founders.map((f) => (
              <div key={f.name}>
                <dt className="t-small font-medium">{f.name}</dt>
                <dd className="t-micro t-muted mt-1">{f.leads}</dd>
              </div>
            ))}
          </dl>
        }
      />

      <section ref={founders} data-theme="ink" className="relative" aria-label="The founders">
        <div className="wrap pb-24 lg:pb-32">
          {/* Shayne: portrait left, words right */}
          <article className="grid-12 gap-y-10 border-t border-line-dark pt-14 lg:pt-20" aria-labelledby="f-shayne">
            <div className="col-span-12 sm:col-span-8 lg:col-span-5">
              <div className="media-cover aspect-[4/5]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
                <Image src={shayne.photo} alt={`${shayne.name}, co-founder of Revolt Marketing`} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="scale-[1.06]" data-parallax="0.05" />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-10">
              <span className="t-mono t-small t-green">01</span>
              <h2 id="f-shayne" className="t-display-l mt-3" data-split>{shayne.name}</h2>
              <p className="t-standfirst mt-3 text-paper/85" data-reveal>{shayne.role}</p>
              <p className="t-body t-muted mt-8 max-w-[54ch]" data-reveal data-delay="0.1">{shayne.bio}</p>
              <dl className="mt-8 max-w-[54ch] border-t border-line-dark" data-reveal data-delay="0.15">
                {[["Leads", "Growth marketing strategies"], ["Builds", "Google Ads and Meta campaigns"], ["Background", "Scaling e-commerce brands through paid advertising"]].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[10ch_1fr] gap-4 border-b border-line-dark py-3">
                    <dt className="t-small t-muted">{k}</dt>
                    <dd className="t-small">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>

          {/* Tristan: words left, portrait right, set lower */}
          <article className="grid-12 mt-20 gap-y-10 border-t border-line-dark pt-14 lg:mt-28 lg:pt-20" aria-labelledby="f-tristan">
            <div className="col-span-12 lg:order-1 lg:col-span-6 lg:pt-10">
              <span className="t-mono t-small t-green">02</span>
              <h2 id="f-tristan" className="t-display-l mt-3" data-split>{tristan.name}</h2>
              <p className="t-standfirst mt-3 text-paper/85" data-reveal>{tristan.role}</p>
              <p className="t-body t-muted mt-8 max-w-[54ch]" data-reveal data-delay="0.1">{tristan.bio}</p>
              <dl className="mt-8 max-w-[54ch] border-t border-line-dark" data-reveal data-delay="0.15">
                {[["Leads", "Sales, event marketing and local growth"], ["Specializes in", "Corporate events, league memberships, local positioning"], ["Background", "Built one of Toronto’s largest nightlife companies"]].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[10ch_1fr] gap-4 border-b border-line-dark py-3">
                    <dt className="t-small t-muted">{k}</dt>
                    <dd className="t-small">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="col-span-12 sm:col-span-8 sm:col-start-5 lg:order-2 lg:col-span-5 lg:col-start-8">
              <div className="media-cover aspect-[4/5]" data-reveal="scale" style={{ borderRadius: "var(--r-panel)" }}>
                <Image src={tristan.photo} alt={`${tristan.name}, co-founder of Revolt Marketing`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="scale-[1.06]" data-parallax="0.05" />
              </div>
            </div>
          </article>
        </div>
      </section>

      <section ref={story} data-theme="paper" className="relative" aria-labelledby="story-title">
        <div className="wrap sect">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-7">
              <TracerMark />
              <h2 id="story-title" className="t-display-l mt-6 max-w-[14ch]" data-split>Why we built Revolt for golf simulator venues.</h2>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-3">
              {site.story.map((p, i) => (
                <p key={i} className={`t-standfirst ${i === 0 ? "text-ink" : "t-muted mt-6"}`} data-reveal data-delay={String(i * 0.1)}>{p}</p>
              ))}
            </div>
          </div>
          <dl className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 lg:mt-28 lg:grid-cols-4" data-reveal-group>
            <div><dd className="t-display-l t-mono font-medium tracking-tight"><span data-counter="100" data-suffix="+">100+</span></dd><dt className="t-small t-muted mt-2">golf entertainment venues studied</dt></div>
            <div><dd className="t-display-l t-mono font-medium tracking-tight">1</dd><dt className="t-small t-muted mt-2">industry, exclusively</dt></div>
            <div><dd className="t-display-l t-mono font-medium tracking-tight">4</dd><dt className="t-small t-muted mt-2">connected marketing systems</dt></div>
            <div><dd className="t-display-l t-mono font-medium tracking-tight">2</dd><dt className="t-small t-muted mt-2">founders, one focus</dt></div>
          </dl>
        </div>
      </section>

      <section ref={approach} data-theme="paper-2" className="relative" aria-labelledby="approach-title">
        <div className="wrap sect">
          <div className="grid-12 gap-y-10">
            <div className="col-span-12 lg:col-span-4">
              <div className="lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
                <TracerMark />
                <h2 id="approach-title" className="t-display-m mt-5 max-w-[12ch]" data-split>Our approach.</h2>
                <Link href="/services" data-label="Services" className="link-quiet mt-8 inline-flex items-center gap-2 t-small font-medium" data-reveal>
                  See the four systems
                  <Arrow className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <ol className="col-span-12 lg:col-span-7 lg:col-start-6" data-reveal-group data-stagger="0.1">
              {site.approach.map((a, i) => (
                <li key={a.title} className={`grid grid-cols-[3ch_1fr] gap-x-5 border-t border-line py-7 sm:grid-cols-[4ch_1fr] ${i === site.approach.length - 1 ? "border-b" : ""}`}>
                  <span className="t-mono t-small t-green pt-1.5">0{i + 1}</span>
                  <div>
                    <h3 className="t-display-s">{a.title}</h3>
                    <p className="t-body t-muted mt-2.5 max-w-[48ch]">{a.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <StrategyCall />
    </main>
  );
}
