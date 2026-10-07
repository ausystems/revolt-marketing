"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { prefersReducedMotion, registerGsap } from "@/lib/motion";
import { getLenis } from "./SmoothScroll";
import { live } from "@/content/live";

/* ------------------------------------------------------------------
   A tiny page-reveal bus. Heroes wait for the curtain to lift before
   their entrance; on a page that is already revealed they run at once.
   ------------------------------------------------------------------ */
let revealed = false;
const waiting = new Set<() => void>();
export function onPageReveal(cb: () => void) {
  if (revealed) { cb(); return () => {}; }
  waiting.add(cb);
  return () => waiting.delete(cb);
}
function fireReveal() {
  revealed = true;
  document.documentElement.classList.add("is-ready");
  waiting.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } });
  waiting.clear();
}

/* Destination names shown on the panel during a turn: the live navigation's own words */
const LABELS: Record<string, string> = {};
for (const item of live.nav.items) {
  LABELS[item.href] = item.label;
  for (const c of item.children ?? []) LABELS[c.href] = c.label;
}
LABELS[live.footer.privacy.href] = live.footer.privacy.label;
const SYSTEMS = live.nav.items.flatMap((i) => i.children ?? []).filter((c) => c.href !== "/blog");
export function labelFor(href: string, fallback?: string) {
  const path = href.replace(/[?#].*$/, "").replace(/\/$/, "") || "/";
  if (LABELS[path]) return LABELS[path];
  if (fallback && fallback.length <= 32) return fallback;
  const seg = path.split("/").filter(Boolean)[0] || "";
  if (seg === "post") return LABELS["/blog"];
  for (const s of SYSTEMS) if (path.startsWith(s.href)) return s.label;
  return "Revolt Marketing";
}

let leaving = false;
/* Decided once per document so React's development double-invoke cannot flip a first visit into a revisit. */
let bootKind: "first" | "revisit" | null = null;
let navigate: ((href: string) => void) | null = null;
let curtainEl: HTMLDivElement | null = null;
let labelEl: HTMLSpanElement | null = null;

/** Leave the page behind the rising panel, carrying the destination's name. */
export function go(href: string, text?: string) {
  if (typeof window === "undefined") return;
  const url = new URL(href, window.location.href);
  if (prefersReducedMotion() || !curtainEl || !labelEl || !navigate) { if (navigate) navigate(url.pathname + url.search + url.hash); else window.location.href = url.href; return; }
  if (leaving) return;
  leaving = true;
  revealed = false;
  const { gsap } = registerGsap();
  const label = text ?? labelFor(url.pathname);
  labelEl.textContent = label;
  const main = document.querySelector("main");
  main?.classList.add("is-leaving");
  document.dispatchEvent(new CustomEvent("revolt:leave"));
  gsap.set(curtainEl, { display: "grid", yPercent: 100, borderRadius: "var(--r-panel) var(--r-panel) 0 0" });
  gsap.set(labelEl, { yPercent: 110 });
  const nav = navigate;
  const target = url.pathname + url.search + url.hash;
  gsap.timeline()
    .to(main, { opacity: 0.55, duration: 0.8, ease: "expo.inOut" }, 0)
    .to(curtainEl, { yPercent: 0, borderRadius: "0 0 0 0", duration: 0.8, ease: "expo.inOut" }, 0)
    .to(labelEl, { yPercent: 0, duration: 0.6, ease: "expo.out" }, 0.42)
    .add(() => {
      getLenis()?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
      nav(target);
    }, 0.9);
}

export function isLeaving() { return leaving; }

export default function Curtain() {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);
  const tracer = useRef<SVGPathElement>(null);
  const firstPath = useRef(pathname);

  useEffect(() => {
    navigate = (href) => router.push(href);
    curtainEl = ref.current;
    labelEl = label.current;
    return () => { navigate = null; curtainEl = null; labelEl = null; };
  }, [router]);

  /* First load: the wordmark and a tracer drawing beneath it, then the lift. Revisits in the session get a quick lift. */
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) { fireReveal(); if (el) el.style.display = "none"; return; }
    const { gsap } = registerGsap();
    if (!bootKind) {
      let visited = false;
      try { visited = sessionStorage.getItem("rv-visited") === "1"; sessionStorage.setItem("rv-visited", "1"); } catch { /* storage denied: treat as a first visit */ }
      bootKind = visited ? "revisit" : "first";
    }
    const revisit = bootKind === "revisit";
    gsap.set(el, { display: "grid", yPercent: 0 });
    const lift = () => { fireReveal(); };
    const tl = gsap.timeline({ onComplete: () => { el.style.display = "none"; } });
    const done = () => { gsap.set([wordmark.current, label.current], { clearProps: "all" }); };
    if (revisit) {
      tl.set(wordmark.current, { opacity: 0 })
        .add(lift, 0.05)
        .to(el, { yPercent: -100, borderRadius: "0 0 var(--r-panel) var(--r-panel)", duration: 0.9, ease: "expo.inOut" }, 0.05)
        .add(done);
    } else {
      gsap.set(label.current, { opacity: 0 });
      tl.fromTo(wordmark.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0.1)
        .fromTo(tracer.current, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0.35)
        .to(wordmark.current, { opacity: 0, y: -10, duration: 0.45, ease: "power2.in" }, 1.55)
        .add(lift, 1.75)
        .to(el, { yPercent: -100, borderRadius: "0 0 var(--r-panel) var(--r-panel)", duration: 1, ease: "expo.inOut" }, 1.75)
        .from("main", { opacity: 0.6, duration: 1.2, ease: "expo.out", clearProps: "opacity" }, 1.85)
        .add(done);
    }
    return () => { tl.kill(); };
  }, []);

  /* After a turn: the new route has rendered. Hold the name a beat, send it up, lift the panel. */
  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    const el = ref.current;
    const main = document.querySelector("main");
    if (!el || !leaving) { fireReveal(); return; }
    const { gsap, ScrollTrigger } = registerGsap();
    main?.classList.remove("is-leaving");
    gsap.set(main, { clearProps: "transform,opacity" });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    const tl = gsap.timeline({ onComplete: () => { el.style.display = "none"; leaving = false; } });
    tl.to(label.current, { yPercent: -110, duration: 0.55, ease: "expo.in" }, 0.18)
      .add(fireReveal, 0.42)
      .to(el, { yPercent: -100, borderRadius: "0 0 var(--r-panel) var(--r-panel)", duration: 1, ease: "expo.inOut" }, 0.42)
      .from(main, { opacity: 0.6, duration: 1.2, ease: "expo.out", clearProps: "opacity" }, 0.5);
  }, [pathname]);

  /* Internal links run the chapter turn. Captured before React's own listeners so next/link sees defaultPrevented. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (/^(mailto|tel):/.test(a.getAttribute("href") || "")) return;
      if (url.pathname === window.location.pathname) {
        if (url.hash) return; // same-page anchor: SmoothScroll handles it
        e.preventDefault();
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (prefersReducedMotion()) return; // let Next handle it natively
      e.preventDefault();
      go(url.pathname + url.search + url.hash, a.dataset.label || labelFor(url.pathname, a.textContent?.trim()));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /* bfcache / back-forward: never leave a stale curtain on screen */
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted && ref.current) { ref.current.style.display = "none"; leaving = false; fireReveal(); } };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  return (
    <div ref={ref} className="curtain" aria-hidden="true">
      <div ref={wordmark} className="flex flex-col items-center gap-5">
        <Image src="/media/wordmark.png" alt="" width={1157} height={184} sizes="164px" priority className="h-[22px] w-auto sm:h-[26px]" />
        <svg width="140" height="18" viewBox="0 0 140 18" fill="none" aria-hidden="true">
          <path ref={tracer} d="M2 16 C 40 2, 100 2, 138 14" stroke="#2BB61E" strokeWidth="1.5" strokeLinecap="round" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
        </svg>
      </div>
      <div className="curtain-label absolute">
        <span ref={label} />
      </div>
    </div>
  );
}
