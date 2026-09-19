"use client";

import PageHero from "@/components/sections/PageHero";
import { useReveals } from "@/components/motion/useReveals";
import { site } from "@/content/site";

type Block = { t: string; text?: string; items?: string[] };
type Policy = { title: string; effective: string; sections: { heading: string; blocks: Block[] }[] };

/** The legal text, set to be read: a sticky contents column and a reading measure. Nothing rewritten. */
export default function PrivacyPage({ policy }: { policy: Policy }) {
  const ref = useReveals<HTMLElement>();
  const id = (h: string) => "s-" + h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <main id="main">
      <PageHero title="Privacy Policy" titleClass="t-display-l" eyebrow={policy.effective.replace("Effective Date:", "Effective").replace(" Last Updated:", " · updated")} standfirst={`How ${site.legalName} collects, uses, stores and protects personal information, and the rights you have over it.`} />
      <section ref={ref} data-theme="paper" className="relative" aria-label="Policy">
        <div className="wrap sect">
          <div className="grid-12 gap-y-12">
            <nav className="col-span-12 lg:col-span-3" aria-label="Contents">
              <div className="lg:sticky lg:top-[calc(var(--nav-h)+32px)] lg:max-h-[calc(100svh-var(--nav-h)-48px)] lg:overflow-y-auto [scrollbar-width:thin]">
                <p className="t-small font-medium">Contents</p>
                <ol className="mt-3 border-t border-line">
                  {policy.sections.map((s) => (
                    <li key={s.heading} className="border-b border-line">
                      <a href={`#${id(s.heading)}`} className="t-micro t-muted block py-2 hover:text-ink">{s.heading}</a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
            <div className="prose-revolt col-span-12 lg:col-span-8 lg:col-start-5">
              {policy.sections.map((s) => (
                <section key={s.heading} id={id(s.heading)} className="scroll-mt-28">
                  <h2>{s.heading}</h2>
                  {s.blocks.map((b, i) => b.t === "h3" ? <h3 key={i}>{b.text}</h3> : b.t === "ul" ? <ul key={i}>{b.items?.map((it, k) => <li key={k}>{it}</li>)}</ul> : <p key={i}>{b.text}</p>)}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
