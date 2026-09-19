"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { motion, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { onPageReveal } from "@/components/motion/Curtain";
import TracerMark from "@/components/ui/TracerMark";

type Crumb = { label: string; href: string };

/**
 * The opening of every internal page: one h1, one standfirst, the tracer mark, and an optional trail of crumbs.
 * The entrance waits for the curtain: lines rise out of their masks, the standfirst and aside follow.
 */
export default function PageHero({
  title,
  standfirst,
  crumbs,
  eyebrow,
  aside,
  theme = "ink",
  children,
  titleClass = "t-display-xl",
  titleMax = "max-w-[14ch]",
}: {
  title: ReactNode;
  standfirst?: ReactNode;
  crumbs?: Crumb[];
  eyebrow?: ReactNode;
  aside?: ReactNode;
  theme?: "ink" | "paper";
  children?: ReactNode;
  titleClass?: string;
  titleMax?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap, SplitText } = registerGsap();
    const reduced = prefersReducedMotion();
    const items = el.querySelectorAll<HTMLElement>("[data-enter]");
    const tracer = el.querySelectorAll<SVGPathElement>(".tracer-mark path");
    if (reduced) { gsap.set(items, { clearProps: "all" }); tracer.forEach((p) => p.classList.add("is-drawn")); if (h1.current) h1.current.style.opacity = "1"; return; }
    let split: InstanceType<typeof SplitText> | null = null;
    gsap.set(items, { opacity: 0, y: 18 });
    const off = onPageReveal(() => {
      if (!h1.current) return;
      split = SplitText.create(h1.current, { type: "lines", mask: "lines", linesClass: "split-line-inner" });
      h1.current.style.opacity = "1";
      gsap.timeline({ defaults: { ease: motion.ease } })
        .to(tracer, { strokeDashoffset: 0, duration: 1.2, ease: motion.trace, stagger: 0.1 }, 0)
        .from(split.lines, { yPercent: 110, duration: 1.3, stagger: 0.09 }, 0.1)
        .to(items, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.6);
    });
    return () => { off(); split?.revert(); };
  }, []);

  return (
    <section ref={root} data-theme={theme} className="relative" aria-labelledby="page-title">
      <div className="wrap pb-16 pt-[calc(var(--nav-h)+48px)] lg:pb-24 lg:pt-[calc(var(--nav-h)+88px)]">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" data-enter className="t-small t-muted mb-8 flex flex-wrap items-center gap-2 lg:mb-10">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-2">
                {c.href === pathname ? <span aria-current="page">{c.label}</span> : <Link href={c.href} className="link-quiet">{c.label}</Link>}
                {i < crumbs.length - 1 && <span aria-hidden="true" className="opacity-50">/</span>}
              </span>
            ))}
          </nav>
        )}
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-4">
              <TracerMark />
              {eyebrow && <span data-enter className="t-mono t-small t-muted">{eyebrow}</span>}
            </div>
            <h1 ref={h1} id="page-title" data-hero-title className={`${titleClass} mt-6 ${titleMax}`}>
              {title}
            </h1>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:self-end">
            {standfirst && <p data-enter className="t-standfirst t-muted max-w-[42ch]">{standfirst}</p>}
            {aside && <div data-enter className="mt-6">{aside}</div>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
