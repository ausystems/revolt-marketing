"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { live } from "@/content/live";
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const state = useRef({ lastY: 0, anchorY: 0, dir: 0 });
  const menuId = useId();
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
  if (seenPath !== pathname) { setSeenPath(pathname); setMenuOpen(false); setOpenIndex(null); }

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
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenuOpen(false); setOpenIndex(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMenu = (i: number) => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpenIndex(i); };
  const closeMenuSoon = () => { closeTimer.current = setTimeout(() => setOpenIndex(null), 180); };

  const onPaper = tone === "paper" && !menuOpen;
  const fg = onPaper ? "text-ink" : "text-paper";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const { nav } = live;

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
          <Link href="/" aria-label="Revolt Marketing, home" className="relative block h-[20px] w-[126px] sm:h-[22px] sm:w-[138px]">
            <Image src="/media/wordmark.png" alt="" fill sizes="138px" priority className="object-contain object-left" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {nav.items.map((item, i) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => openMenu(i)}
                  onMouseLeave={closeMenuSoon}
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenIndex(null); }}
                >
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={item.href}
                      className={`link-quiet t-small font-medium ${isActive(item.href) || item.children.some((c) => isActive(c.href)) ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      className="grid h-6 w-5 place-items-center opacity-70 hover:opacity-100"
                      aria-expanded={openIndex === i}
                      aria-controls={`${menuId}-${i}`}
                      aria-label={item.label}
                      onClick={() => setOpenIndex((o) => (o === i ? null : i))}
                    >
                      <svg viewBox="0 0 12 12" className={`h-2.5 w-2.5 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} fill="none" aria-hidden="true">
                        <path d="M2 4.5 6 8l4-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <div
                    id={`${menuId}-${i}`}
                    className={`absolute left-1/2 top-full -translate-x-1/2 pt-4 transition-all duration-300 ${openIndex === i ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
                    style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
                  >
                    <ul className="panel-ink min-w-[300px] rounded-[20px] p-2 text-paper shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)]">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} onClick={() => setOpenIndex(null)} className="flex items-center justify-between gap-6 rounded-[14px] px-4 py-3 transition-colors duration-300 hover:bg-white/[0.06]">
                            <span className="t-small font-medium">{c.label}</span>
                            <Arrow className="h-4 w-4 opacity-60" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <Link key={item.label} href={item.href} className={`link-quiet t-small font-medium ${isActive(item.href) ? "opacity-100" : "opacity-80 hover:opacity-100"}`} aria-current={isActive(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              ),
            )}
            <Link href={nav.cta.href} className="btn btn-sm">
              {nav.cta.label}
              <Arrow />
            </Link>
          </nav>

          <div className="flex items-center gap-3 lg:hidden">
            <Link href={nav.cta.href} className={`btn btn-sm !px-3.5 !text-[0.8rem] transition-opacity duration-300 ${menuOpen ? "pointer-events-none opacity-0" : "opacity-100"}`} tabIndex={menuOpen ? -1 : 0}>
              {nav.cta.label}
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label="Menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden="true" className="relative block h-3 w-6">
                <span className={`absolute left-0 right-0 h-[1.5px] bg-current transition-transform duration-500 ${menuOpen ? "top-[5px] rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 right-0 h-[1.5px] bg-current transition-transform duration-500 ${menuOpen ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-page menu for small screens: the same menu, children beneath their parents */}
      <div ref={menuRef} id="site-menu" inert={!menuOpen} aria-hidden={!menuOpen} className="menu fixed inset-0 z-[110] bg-ink text-paper lg:hidden">
        <div className="wrap flex h-full flex-col justify-between overflow-y-auto pb-8" style={{ paddingTop: "calc(var(--nav-h) + 16px)" }}>
          <nav aria-label="Menu">
            <ul className="flex flex-col">
              {nav.items.map((item) => (
                <li key={item.label} data-menu-item className="border-b border-line-dark py-1">
                  <Link href={item.href} onClick={() => setMenuOpen(false)} className="t-display-l flex items-baseline justify-between py-2 text-[clamp(1.8rem,7.5vw,2.5rem)]">
                    <span>{item.label}</span>
                    <Arrow className="h-5 w-5 opacity-60" />
                  </Link>
                  {item.children && (
                    <ul className="mb-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} onClick={() => setMenuOpen(false)} className="t-small t-muted block py-2 hover:text-paper">{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div data-menu-item className="mt-10">
            <Link href={nav.cta.href} onClick={() => setMenuOpen(false)} className="btn btn-lg w-full">
              {nav.cta.label}
              <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
