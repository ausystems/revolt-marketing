"use client";

import { useId, useState } from "react";

/** FAQ accordion. Animated height via grid-template-rows; one open at a time; fully keyboard operable. */
export default function Accordion({ items, className = "" }: { items: { q: string; a: string }[]; className?: string }) {
  const [open, setOpen] = useState<number>(0);
  const id = useId();
  return (
    <div className={`hairline ${className}`}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`acc-item border-b border-line ${isOpen ? "is-open" : ""}`}>
            <h3 className="m-0">
              <button
                type="button"
                id={`${id}-${i}-btn`}
                className="grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-5 py-6 text-left"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="t-mono t-small t-green">{String(i + 1).padStart(2, "0")}</span>
                <span className="t-display-s">{it.q}</span>
                <span className="acc-icon relative mt-1 block h-4 w-4 self-center" aria-hidden="true">
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                </span>
              </button>
            </h3>
            <div id={`${id}-${i}`} className="acc-panel" role="region" aria-labelledby={`${id}-${i}-btn`} inert={!isOpen}>
              <div>
                <p className="t-body t-muted max-w-[62ch] pb-7 pl-[calc(2ch+1.25rem)]">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
