"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { live } from "@/content/live";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import { Arrow } from "@/components/ui/Button";

/**
 * The foot of every page, as the live site has it: how to reach Revolt, the links, the services, a call to book
 * one, and the privacy policy; then the wordmark running off the page with the tracer drawing beneath it.
 */
export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const tracer = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) { if (tracer.current) tracer.current.style.strokeDashoffset = "0"; return; }
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(mark.current, { yPercent: 28 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: mark.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 } });
      ScrollTrigger.create({
        trigger: mark.current,
        start: "top 92%",
        once: true,
        onEnter: () => gsap.to(tracer.current, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }),
      });
    }, el);
    return () => ctx.revert();
  }, []);
  const { footer } = live;
  const icons = [
    <path key="phone" d="M5 3.5h3l1.5 4-2 1.2a10 10 0 0 0 4.8 4.8l1.2-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15 15 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5Z" />,
    <g key="mail"><rect x="3" y="5" width="16" height="12" rx="2" /><path d="m3.5 6 7.5 6 7.5-6" /></g>,
    <g key="pin"><path d="M11 19s-6-5.4-6-10a6 6 0 0 1 12 0c0 4.6-6 10-6 10Z" /><circle cx="11" cy="9" r="2.2" /></g>,
  ];
  return (
    <footer ref={ref} data-theme="ink" className="relative overflow-hidden">
      <div className="wrap pt-20 lg:pt-28">
        {/* how to reach Revolt */}
        <ul className="grid grid-cols-1 gap-6 border-b border-line-dark pb-12 sm:grid-cols-3">
          {footer.contact.map((c, i) => (
            <li key={c.label} className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-dark text-green">
                <svg viewBox="0 0 22 22" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[i]}</svg>
              </span>
              <div className="min-w-0">
                <p className="t-small t-muted">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="link t-body mt-1 inline-block font-medium [overflow-wrap:anywhere]">{c.value}</a>
                ) : (
                  <p className="t-body mt-1 font-medium">{c.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="grid-12 gap-y-14 pt-14">
          <div className="col-span-12 lg:col-span-4">
            <Link href="/" aria-label="Revolt Marketing, home" className="relative block h-[22px] w-[138px]">
              <Image src="/media/wordmark.png" alt="" fill sizes="138px" className="object-contain object-left" />
            </Link>
            <p className="t-body t-muted mt-6 max-w-[38ch]">{footer.tagline}</p>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {[footer.links, footer.services].map((group) => (
              <div key={group.heading}>
                <p className="t-small font-medium">{group.heading}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((l) => (
                    <li key={l.label}><Link href={l.href} className="link-quiet t-small t-muted">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-1">
              <p className="t-small font-medium">{footer.book.heading}</p>
              <Link href={footer.book.button.href} className="btn mt-4">
                {footer.book.button.label}
                <Arrow />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-line-dark pt-6">
          <Link href={footer.privacy.href} className="link-quiet t-micro t-muted">{footer.privacy.label}</Link>
        </div>
      </div>

      {/* The wordmark leaves the page; the tracer draws beneath it. */}
      <div ref={mark} className="relative mt-10 h-[19vw] overflow-hidden sm:h-[16vw]" aria-hidden="true">
        <Image src="/media/wordmark.png" alt="" width={1157} height={184} className="footer-wordmark absolute left-0 top-0" sizes="126vw" />
        <svg className="absolute bottom-[8%] left-[6vw] w-[88vw]" viewBox="0 0 880 40" fill="none" preserveAspectRatio="none">
          <path ref={tracer} d="M0 38 C 220 2, 620 2, 880 30" stroke="#2BB61E" strokeWidth="1.5" strokeLinecap="round" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </footer>
  );
}
