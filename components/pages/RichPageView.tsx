"use client";

import type { RichPage, TextBlock } from "@/content/live";
import type { SubService } from "@/content/services";
import PageHero from "@/components/sections/PageHero";
import { useReveals } from "@/components/motion/useReveals";
import Accordion from "@/components/ui/Accordion";
import Diagram from "@/components/ui/Diagram";
import { chapters, Inline, RichBlock } from "@/components/ui/Rich";

/**
 * A page of the live site's own words, set editorially: its h1 (and the line that follows it) as the hero, then
 * every section as a chapter, the heading on the left and its words on the right, then its questions, if it has
 * any. Used by the sixteen service pages (each with its drawing) and the city pages.
 */
export default function RichPageView({ page, diagram }: { page: RichPage; diagram?: SubService["diagram"] }) {
  const body = useReveals<HTMLElement>();
  const faq = useReveals<HTMLElement>();
  const blocks = page.blocks;
  const h1i = Math.max(0, blocks.findIndex((b) => b.t === "h1"));
  const h1 = blocks[h1i] as TextBlock;
  const next = blocks[h1i + 1];
  const standfirst = next && next.t === "p" ? next : null;
  // the live pages' stock photographs and icons are replaced by our drawing (service pages) or left out (city pages)
  const rest = blocks.slice(h1i + (standfirst ? 2 : 1)).filter((b) => b.t !== "img");
  const parts = chapters(rest);
  return (
    <main id="main">
      <PageHero
        title={h1.text}
        standfirst={standfirst ? <Inline text={standfirst.text} links={standfirst.links} /> : undefined}
        titleClass="t-display-l"
      />

      {diagram && (
        <section data-theme="ink" className="relative" aria-hidden="true">
          <div className="wrap pb-20 lg:pb-28">
            <div className="panel panel-ink mx-auto max-w-[880px] p-6 sm:p-10">
              <Diagram kind={diagram} />
            </div>
          </div>
        </section>
      )}

      <section ref={body} data-theme="paper" className="relative" aria-label={h1.text}>
        <div className="wrap sect">
          {parts.map((c, i) => (
            <div key={i} className={`grid-12 gap-y-6 border-line py-12 lg:py-16 ${i ? "border-t" : ""}`}>
              <div className="col-span-12 lg:col-span-5">
                {c.head && <RichBlock b={c.head} first />}
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7" data-reveal>
                {c.body.map((b, k) => <RichBlock key={k} b={b} first={k === 0} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {page.faq && page.faq.length > 0 && (
        <section ref={faq} data-theme="paper-2" className="relative" aria-label={h1.text}>
          <div className="wrap sect">
            <div className="grid-12">
              <div className="col-span-12 lg:col-span-8 lg:col-start-3" data-reveal>
                <Accordion items={page.faq} />
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
