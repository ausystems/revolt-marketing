"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/content/site";
import { systems } from "@/content/services";
import { useSectionTheme } from "@/components/motion/useSectionTheme";
import { isProgrammaticScroll, getLenis } from "@/components/motion/SmoothScroll";
import { isLeaving } from "@/components/motion/Curtain";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import { Arrow } from "@/components/ui/Button";

const HIDE_AFTER = 200, TRAVEL_TO_HIDE = 90, TRAVEL_TO_SHOW = 40, SHOW_BELOW = 120;

/**
 * Fixed navigation. Reads the tone of the chapter beneath it and inverts; hides after deliberate downward travel
 * and returns on the first deliberate scroll up (direction-locked with hysteresis so momentum tails and trackpad
 * jitter never flip it). On small screens the menu becomes a full-page index.
 */
export default function Nav() {
  const tone = useSectionTheme();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const state = useRef({ lastY: 0, anchorY: 0, dir: 0 });
  const servicesId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const s = state.current;
    s.lastY = s.anchorY = Math.max(0, window.scrollY);
    const onScroll = () => {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.min(Math.max(0, window.scrollY), maxY);
      const delta = y - s.lastY;
      setSolid(y > 24);
      if (Math.abs(delta) < 1) return;
      const dir = delta > 0 ? 1 : -1;
      if (dir !== s.dir) { s.dir = dir; s.anchorY = s.lastY; }
      s.lastY = y;
      const travelled = Math.abs(y - s.anchorY);
      if (menuOpen || isLeaving() || isProgrammaticScroll()) { setHidden(false); return; }
      if (y < SHOW_BELOW) { setHidden(false); return; }
      if (dir === 1 && y > HIDE_AFTER && travelled >= TRAVEL_TO_HIDE) setHidden(true);
      else if (dir === -1 && travelled >= TRAVEL_TO_SHOW) setHidden(false);
    };
    const onResize = () => { s.lastY = s.anchorY = Math.max(0, window.scrollY); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, [menuOpen]);

  // Keyboard users tabbing into a hidden nav get it back.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onFocus = () => { setHidden(false); state.current.anchorY = state.current.lastY; };
    el.addEventListener("focusin", onFocus);
    return () => el.removeEventListener("focusin", onFocus);
  }, []);

  // Close everything on route change (derived during render, per React's guidance).
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) { setSeenPath(pathname); setMenuOpen(false); setServicesOpen(false); }

  // Full-page menu open/close choreography.
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const { gsap } = registerGsap();
    const links = menu.querySelectorAll<HTMLElement>("[data-menu-item]");
    const reduced = prefersReducedMotion();
    if (menuOpen) {
      document.body.classList.add("is-locked");
      getLenis()?.stop();
      menu.setAttribute("aria-hidden", "false");
      if (reduced) { gsap.set(menu, { clipPath: "inset(0 0 0% 0 round 0 0 0px 0px)" }); gsap.set(links, { clearProps: "all" }); return; }
      gsap.timeline()
        .to(menu, { clipPath: "inset(0 0 0% 0 round 0 0 0px 0px)", duration: 0.8, ease: "expo.inOut" })
        .fromTo(links, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "expo.out" }, "-=0.35");
    } else {
      document.body.classList.remove("is-locked");
      getLenis()?.start();
      const done = () => menu.setAttribute("aria-hidden", "true");
      if (reduced) { gsap.set(menu, { clipPath: "inset(0 0 100% 0 round 0 0 var(--r-panel) var(--r-panel))" }); done(); return; }
      gsap.to(menu, { clipPath: "inset(0 0 100% 0 round 0 0 var(--r-panel) var(--r-panel))", duration: 0.7, ease: "expo.inOut", onComplete: done });
    }
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenuOpen(false); setServicesOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openServices = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setServicesOpen(true); };
  const closeServices = () => { closeTimer.current = setTimeout(() => setServicesOpen(false), 180); };

  const onPaper = tone === "paper" && !menuOpen;
  const fg = onPaper ? "text-ink" : "text-paper";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        ref={navRef}
        className={`nav-bar fixed inset-x-0 top-0 z-[120] ${fg}`}
        data-solid={solid && !menuOpen}
        data-tone={onPaper ? "paper" : "ink"}
        data-hidden={hidden && !menuOpen}
      >
        <div className="wrap flex items-center justify-between" style={{ height: "var(--nav-h)" }}>
          <Link href="/" aria-label="Revolt Marketing, home" data-label="Revolt" className="relative block h-[20px] w-[126px] sm:h-[22px] sm:w-[138px]">
            <Image src="/media/wordmark.png" alt="" fill sizes="138px" priority className="object-contain object-left" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            <div
              className="relative"
              onMouseEnter={openServices}
              onMouseLeave={closeServices}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false); }}
            >
              <button
                type="button"
                className={`link-quiet t-small font-medium ${isActive("/services") || systems.some((s) => isActive(s.slug)) ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                aria-expanded={servicesOpen}
                aria-controls={servicesId}
                onClick={() => setServicesOpen((o) => !o)}
              >
                Services
              </button>
              <div
                id={servicesId}
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-4 transition-all duration-300 ${servicesOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
                style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
              >
                <div className="panel-ink w-[560px] rounded-[20px] p-2 text-paper shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)]">
                  <div className="grid grid-cols-2 gap-1">
                    {systems.map((s) => (
                      <Link
                        key={s.slug}
                        href={s.slug}
                        data-label={s.short}
                        onClick={() => setServicesOpen(false)}
                        className="group rounded-[14px] p-4 transition-colors duration-300 hover:bg-white/[0.06]"
                      >
                        <span className="t-mono t-micro t-green block">{s.n}</span>
                        <span className="t-display-s mt-1 block text-[1.05rem]">{s.name}</span>
                        <span className="t-small t-muted mt-1 block text-[0.85rem] leading-snug">{s.subline}</span>
                      </Link>
                    ))}
                  </div>
                  <Link href="/services" data-label="Services" onClick={() => setServicesOpen(false)} className="mt-1 flex items-center justify-between rounded-[14px] px-4 py-3 transition-colors duration-300 hover:bg-white/[0.06]">
                    <span className="t-small font-medium">All services</span>
                    <Arrow className="h-4 w-4 opacity-70" />
                  </Link>
                </div>
              </div>
            </div>
            {site.nav.primary.filter((l) => l.label !== "Services" && l.label !== "Contact").map((l) => (
              <Link key={l.href} href={l.href} className={`link-quiet t-small font-medium ${isActive(l.href) ? "opacity-100" : "opacity-80 hover:opacity-100"}`} aria-current={isActive(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
            <Link href="/contact-us" data-label="Free Strategy Call" className="btn btn-sm">
              {site.cta.label}
              <Arrow />
            </Link>
          </nav>

          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/contact-us" data-label="Free Strategy Call" className={`btn btn-sm !px-3.5 !text-[0.8rem] transition-opacity duration-300 ${menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`} tabIndex={menuOpen ? -1 : 0}>
              Book a call
            </Link>
            <button
              type="button"
              className="link-quiet t-small font-medium"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Full-page menu for small screens */}
      <div ref={menuRef} id="site-menu" inert={!menuOpen} aria-hidden={!menuOpen} className="menu fixed inset-0 z-[110] bg-ink text-paper lg:hidden">
        <div className="wrap flex h-full flex-col justify-between overflow-y-auto pb-8" style={{ paddingTop: "calc(var(--nav-h) + 16px)" }}>
          <nav aria-label="Menu">
            <ul className="flex flex-col">
              {[{ label: "Home", href: "/" }, ...site.nav.primary].map((l) => (
                <li key={l.href} data-menu-item className="border-b border-line-dark">
                  <Link href={l.href} onClick={() => setMenuOpen(false)} className="t-display-l flex items-baseline justify-between py-2.5 text-[clamp(1.9rem,8vw,2.6rem)]">
                    <span>{l.label}</span>
                    <Arrow className="h-5 w-5 opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {systems.map((s) => (
                <li key={s.slug} data-menu-item>
                  <Link href={s.slug} data-label={s.short} onClick={() => setMenuOpen(false)} className="block rounded-[14px] py-2.5">
                    <span className="t-mono t-micro t-green mr-3">{s.n}</span>
                    <span className="t-small font-medium">{s.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div data-menu-item className="mt-10 flex flex-col gap-6">
            <Link href="/contact-us" data-label="Free Strategy Call" onClick={() => setMenuOpen(false)} className="btn btn-lg w-full">
              {site.cta.label}
              <Arrow />
            </Link>
            <div className="t-small t-muted flex flex-wrap gap-x-6 gap-y-2">
              <a className="link" href={site.phone.href}>{site.phone.display}</a>
              <a className="link" href={`mailto:${site.email}`}>{site.email}</a>
              {site.social.map((s) => (
                <a key={s.label} className="link" href={s.href} target="_blank" rel="noopener">{s.label}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
