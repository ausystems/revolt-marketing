"use client";

import { Fragment } from "react";
import type { RichPage, TextBlock } from "@/content/live";
import PageHero from "@/components/sections/PageHero";
import { useReveals } from "@/components/motion/useReveals";

/** The privacy policy, verbatim: its heading and dates, then the text at a reading measure. */
export default function PrivacyPage({ page }: { page: RichPage }) {
  const ref = useReveals<HTMLElement>();
  const [h1, dates, ...rest] = page.blocks as TextBlock[];
  return (
    <main id="main">
      <PageHero
        title={h1.text}
        titleClass="t-display-l"
        standfirst={dates?.lines ? <>{dates.lines.map((l, i) => <span key={i} className="block">{l}</span>)}</> : dates?.text}
      />
      <section ref={ref} data-theme="paper" className="relative" aria-label={h1.text}>
        <div className="wrap sect">
          <div className="prose-revolt prose-legal mx-auto max-w-[72ch]">
            {rest.map((b, i) => {
              const blk = b as unknown as { t: string; text?: string; items?: string[]; lines?: string[] };
              if (blk.t === "ul") return <ul key={i}>{blk.items?.map((it, k) => <li key={k}>{it}</li>)}</ul>;
              // lines the policy breaks by hand stay broken (a space between them, so the words never run together)
              const lines = blk.lines && blk.lines.length > 1 ? blk.lines.map((l, k) => <Fragment key={k}>{k > 0 && " "}<span className="block">{l}</span></Fragment>) : null;
              if (/^h[1-6]$/.test(blk.t)) { const H = blk.t as "h2"; return <H key={i} className={lines ? "legal-lines" : undefined}>{lines ?? blk.text}</H>; }
              return <p key={i}>{lines ?? blk.text}</p>;
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
