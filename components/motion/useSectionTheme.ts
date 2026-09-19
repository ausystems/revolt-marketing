"use client";

import { useEffect, useState } from "react";

export type Tone = "ink" | "paper";

/**
 * Reports which chapter tone currently sits underneath the fixed navigation,
 * so the nav can switch between paper-on-ink and ink-on-paper without a backdrop.
 * `paper` and `paper-2` themes read as paper; `ink` and `field` read as ink.
 */
export function useSectionTheme(probeOffset = 36): Tone {
  const [tone, setTone] = useState<Tone>("ink");
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      let current: Tone = "ink";
      // Re-queried every time: chapters change on every client-side navigation.
      for (const s of document.querySelectorAll<HTMLElement>("[data-theme]")) {
        const r = s.getBoundingClientRect();
        if (r.top <= probeOffset && r.bottom > probeOffset) {
          const t = s.dataset.theme || "ink";
          current = t.startsWith("paper") ? "paper" : "ink";
          break;
        }
      }
      setTone((t) => (t === current ? t : current));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // The hero flips its own theme during the pinned shot; route changes swap the whole chapter list.
    const mo = new MutationObserver(onScroll);
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [probeOffset]);
  return tone;
}
