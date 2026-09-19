"use client";

import { site } from "@/lib/site";
import { useReveal } from "@/components/motion/useReveal";

/**
 * A pause between the work and the voices. Two quiet rows of names, still.
 * Set as type rather than logo files, so every name reads at one size the
 * way a typeset line does. Swap a name for an <Image> when a real mark exists.
 */
function Row({ id, label, names, heading: Heading }: { id: string; label: string; names: readonly string[]; heading: "h2" | "h3" }) {
  return (
    <div className="grid-12" data-reveal>
      <Heading id={id} className="t-small col-span-12 self-start font-normal text-muted lg:col-span-2">
        {label}
      </Heading>
      <ul
        aria-labelledby={id}
        role="list"
        className="no-scrollbar col-span-12 mt-5 flex list-none items-baseline gap-x-8 gap-y-4 max-md:-mx-[var(--gutter)] max-md:flex-nowrap max-md:overflow-x-auto max-md:px-[var(--gutter)] md:flex-wrap md:gap-x-12 lg:col-span-10 lg:col-start-3 lg:mt-0"
      >
        {names.map((n) => (
          <li
            key={n}
            className="t-display-s shrink-0 whitespace-nowrap font-semibold text-ink/40 transition-colors duration-[400ms] hover:text-ink"
          >
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Channels() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-theme="wash" className="relative" aria-labelledby="channels-label">
      <div className="wrap py-24 lg:py-[14vh]">
        <Row id="channels-label" label="Channels we run" names={site.channels} heading="h2" />
        {site.clients.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <Row id="clients-label" label="Brands we've worked with" names={site.clients} heading="h3" />
          </div>
        )}
      </div>
    </section>
  );
}
