"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { systems } from "@/content/services";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import { Arrow } from "@/components/ui/Button";

/**
 * The foot of every page: the index of the site, then the wordmark running off the page
 * with the tracer drawing beneath it as it arrives.
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
  const year = new Date().getFullYear();
  return (
    <footer ref={ref} data-theme="ink" className="relative overflow-hidden" aria-labelledby="footer-title">
      <div className="wrap pt-24 lg:pt-32">
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <h2 id="footer-title" className="t-display-m max-w-[18ch]">
              Schedule a call to learn more about our marketing ecosystems.
            </h2>
            <p className="t-body t-muted mt-5 max-w-[40ch]">And how we can help scale your business to the next level.</p>
            <Link href="/contact-us" data-label="Free Strategy Call" className="btn mt-8">
              {site.cta.label}
              <Arrow />
            </Link>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            <div>
              <h3 className="t-small font-medium">Company</h3>
              <ul className="mt-4 space-y-2.5">
                {[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "About us", href: "/about-us" }, { label: "Blog", href: "/blog" }, { label: "Contact us", href: "/contact-us" }].map((l) => (
                  <li key={l.href}><Link href={l.href} className="link-quiet t-small t-muted">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="t-small font-medium">Our services</h3>
              <ul className="mt-4 space-y-2.5">
                {systems.map((s) => (
                  <li key={s.slug}><Link href={s.slug} data-label={s.short} className="link-quiet t-small t-muted">{s.name}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="t-small font-medium">Contact</h3>
              <ul className="mt-4 space-y-2.5">
                <li><a href={site.phone.href} className="link-quiet t-small t-muted">{site.phone.display}</a></li>
                <li><a href={`mailto:${site.email}`} className="link-quiet t-small t-muted">{site.email}</a></li>
                <li><span className="t-small t-muted">{site.location}</span></li>
                {site.social.map((s) => (
                  <li key={s.label}><a href={s.href} target="_blank" rel="noopener" className="link-quiet t-small t-muted">{s.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-line-dark pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-micro t-muted">© {year} {site.legalName}. {site.location}.</p>
          <div className="t-micro flex gap-6">
            <Link href="/privacypolicy" data-label="Privacy" className="link-quiet t-muted">Privacy Policy</Link>
            <a href="#main" className="link-quiet t-muted">Back to top</a>
          </div>
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
