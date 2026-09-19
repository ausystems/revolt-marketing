"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { motion, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { useReveal } from "@/components/motion/useReveal";

const voices = site.testimonials;
const DESKTOP = "(min-width: 1024px)";

/** Straight apostrophes in the data become typographic ones on the page. */
const typeset = (s: string) => s.replace(/'/g, "’");

/** A title split at its full stops, so a new sentence always starts a new line. */
const sentences = (s: string) => (s.match(/[^.!?]+[.!?]+/g) ?? [s]).map((x) => x.trim()).filter(Boolean);

/**
 * Voices. Six clients, one quote at a time.
 * Desktop: a strip of portrait frames; hovering a frame opens it and brings
 * that person's words into the left column, clicking plays them with sound
 * when a video exists. Small screens: a native snap scroller, and the caption
 * follows whichever frame is nearest the centre. Only one voice is ever playing.
 */
export default function Voices() {
  const ref = useReveal<HTMLElement>();
  const stripRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLButtonElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const blocks = useRef<(HTMLDivElement | null)[]>([]);
  const measurers = useRef<(HTMLSpanElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const [started, setStarted] = useState<boolean[]>(() => voices.map(() => false));
  const [lines, setLines] = useState<string[][]>(() => voices.map((v) => [v.title]));
  const [desktop, setDesktop] = useState(false);
  const playingRef = useRef<number | null>(null);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  /* Titles are split into real lines so each can rise out of its own mask.
     A hidden copy of every title is set as words, one block per sentence, so
     a sentence never continues on the line of the one before; where the words
     wrap tells us where the lines are. Re-measured when fonts land or the
     column resizes. */
  useLayoutEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    const measure = () => {
      const next = voices.map((v, i) => {
        const m = measurers.current[i];
        if (!m) return [v.title];
        const out: string[] = [];
        let lastTop = Number.NaN;
        m.querySelectorAll<HTMLElement>(":scope > span > span").forEach((w) => {
          const top = Math.round(w.getBoundingClientRect().top);
          const text = (w.textContent ?? "").trim();
          if (top !== lastTop) {
            out.push(text);
            lastTop = top;
          } else {
            out[out.length - 1] += ` ${text}`;
          }
        });
        return out.length ? out : [v.title];
      });
      setLines((prev) => (prev.every((l, i) => l.join("\n") === next[i].join("\n")) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(column);
    document.fonts.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, []);

  /* On change: the old words fade, the new title rises line by line and the
     rest of the new block fades in beneath it. */
  const prev = useRef(0);
  useLayoutEffect(() => {
    const from = prev.current;
    const to = active;
    if (from === to) return;
    prev.current = to;
    const out = blocks.current[from];
    const inn = blocks.current[to];
    if (!out || !inn) return;
    const { gsap } = registerGsap();
    const spans = Array.from(inn.querySelectorAll<HTMLElement>(".mask-line > span"));
    gsap.killTweensOf([out, inn, ...spans]);
    if (prefersReducedMotion()) {
      gsap.set(out, { opacity: 0, visibility: "hidden" });
      gsap.set(inn, { opacity: 1, visibility: "visible" });
      gsap.set(spans, { yPercent: 0 });
      return;
    }
    gsap.to(out, {
      opacity: 0,
      duration: 0.35,
      ease: "power1.out",
      onComplete: () => {
        gsap.set(out, { visibility: "hidden" });
      },
    });
    gsap.set(inn, { visibility: "visible" });
    gsap.to(inn, { opacity: 1, duration: 0.5, ease: "power1.out" });
    gsap.fromTo(spans, { yPercent: 110 }, { yPercent: 0, duration: motion.duration, ease: motion.ease, stagger: motion.stagger });
  }, [active]);

  /* Desktop or not. Below the breakpoint the strip scrolls natively and the
     frame that has snapped into place becomes the active one. */
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP);
    const strip = stripRef.current;
    let io: IntersectionObserver | null = null;
    const apply = () => {
      setDesktop(mql.matches);
      io?.disconnect();
      io = null;
      if (mql.matches || !strip) return;
      const ratios = new Map<number, number>();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) ratios.set(Number((e.target as HTMLElement).dataset.index), e.intersectionRatio);
          // Of the frames mostly in view, the one sitting on the snap edge
          // (on a phone this is also the frame nearest the centre).
          const edge = strip.getBoundingClientRect().left + parseFloat(getComputedStyle(strip).paddingLeft);
          let best = -1;
          let bestDist = Infinity;
          ratios.forEach((ratio, i) => {
            const f = frames.current[i];
            if (ratio < 0.6 || !f) return;
            const d = Math.abs(f.getBoundingClientRect().left - edge);
            if (d < bestDist) {
              bestDist = d;
              best = i;
            }
          });
          if (best >= 0) setActive(best);
        },
        { root: strip, threshold: [0.6, 1] },
      );
      frames.current.forEach((f) => f && io?.observe(f));
    };
    apply();
    mql.addEventListener("change", apply);
    return () => {
      mql.removeEventListener("change", apply);
      io?.disconnect();
    };
  }, []);

  /* One voice at a time: a change of frame silences whoever was speaking,
     and so does scrolling the chapter off the screen. */
  useEffect(() => {
    const p = playingRef.current;
    if (p !== null && p !== active) videos.current[p]?.pause();
  }, [active]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting && playingRef.current !== null) videos.current[playingRef.current]?.pause();
      },
      { threshold: 0 },
    );
    io.observe(strip);
    return () => io.disconnect();
  }, []);

  const preview = (i: number) => {
    if (playingRef.current === null) setActive(i);
  };

  const play = (i: number) => {
    const v = videos.current[i];
    if (!v) {
      setActive(i);
      return;
    }
    const p = playingRef.current;
    if (p === i) {
      v.pause();
      return;
    }
    if (p !== null) videos.current[p]?.pause();
    setActive(i);
    v.muted = false;
    v.play().catch(() => {});
    if (!desktop) {
      frames.current[i]?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", inline: "start", block: "nearest" });
    }
  };

  return (
    <section ref={ref} id="voices" data-theme="wash" className="relative" aria-labelledby="voices-title">
      <div className="wrap py-24 lg:py-[18vh]">
        <h2 id="voices-title" className="t-display-l text-ink" data-reveal-lines>
          <span className="mask-line">
            <span>In their words.</span>
          </span>
        </h2>

        <div className="grid-12 mt-10 lg:mt-[9vh]">
          {/* The strip. Six portrait frames; on desktop the active one opens. */}
          <div
            ref={stripRef}
            data-reveal
            {...(!desktop ? { "data-lenis-prevent": "" } : {})}
            className="no-scrollbar col-span-12 -mx-[var(--gutter)] -my-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] py-2 pr-[calc(28vw_-_var(--gutter))] scroll-pl-[var(--gutter)] sm:pr-[calc(56vw_-_var(--gutter))] lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:mx-0 lg:my-0 lg:h-[62vh] lg:max-h-[640px] lg:snap-none lg:overflow-visible lg:px-0 lg:py-0 xl:col-span-8 xl:col-start-5"
          >
            {voices.map((v, i) => {
              const isActive = i === active;
              const isPlaying = playing === i;
              const hasVideo = Boolean(v.video);
              return (
                <button
                  key={`${v.name}-${i}`}
                  ref={(el) => {
                    frames.current[i] = el;
                  }}
                  type="button"
                  data-index={i}
                  aria-label={hasVideo ? `Play ${v.name}’s testimonial` : `Show ${v.name}’s testimonial`}
                  aria-pressed={hasVideo ? isPlaying : isActive}
                  aria-describedby={`voice-title-${i}`}
                  onClick={() => play(i)}
                  onPointerEnter={(e) => {
                    if (desktop && (e.pointerType === "mouse" || e.pointerType === "pen")) preview(i);
                  }}
                  onFocus={(e) => {
                    if (e.currentTarget.matches(":focus-visible")) preview(i);
                  }}
                  className={`relative aspect-[9/16] w-[72vw] shrink-0 cursor-pointer snap-start sm:w-[44vw] lg:aspect-auto lg:h-full lg:w-auto lg:min-w-0 lg:transition-[flex] lg:duration-[900ms] lg:ease-[var(--ease-in-out-quart)] ${
                    isActive ? "lg:flex-[3.2]" : "lg:flex-1"
                  }`}
                >
                  <div
                    className={`media-cover absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-in-out-quart)] ${
                      isActive ? "opacity-100" : "opacity-[0.82]"
                    }`}
                  >
                    <Image src={v.poster} alt={`${v.name}, ${v.role.toLowerCase()}`} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 44vw, 72vw" />
                    {hasVideo && (
                      <video
                        ref={(el) => {
                          videos.current[i] = el;
                        }}
                        src={v.video}
                        playsInline
                        preload="none"
                        className={`transition-opacity duration-500 ${started[i] ? "opacity-100" : "opacity-0"}`}
                        onPlay={() => setPlaying(i)}
                        onPlaying={() => setStarted((s) => (s[i] ? s : s.map((x, k) => (k === i ? true : x))))}
                        onPause={() => setPlaying((p) => (p === i ? null : p))}
                        onEnded={(e) => {
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    )}
                  </div>
                  {hasVideo && (
                    <span
                      aria-hidden="true"
                      className={`t-small pointer-events-none absolute bottom-4 left-4 font-medium text-white mix-blend-difference transition-opacity duration-500 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* The words. All six are set in one cell so the column never changes height; one is shown. */}
          <div
            ref={columnRef}
            data-reveal
            className="col-span-12 mt-10 grid md:col-span-8 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:self-end lg:pr-8 xl:col-span-4"
          >
            {voices.map((v, i) => (
              <div
                key={`${v.name}-${i}`}
                ref={(el) => {
                  blocks.current[i] = el;
                }}
                className="col-start-1 row-start-1 self-start lg:self-end"
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
              >
                <h3 id={`voice-title-${i}`} className="t-display-s relative text-ink">
                  {lines[i].map((line, j) => (
                    <span key={j} className="mask-line">
                      <span>{line}</span>
                    </span>
                  ))}
                  <span
                    aria-hidden="true"
                    ref={(el) => {
                      measurers.current[i] = el;
                    }}
                    className="invisible absolute inset-x-0 top-0"
                  >
                    {sentences(v.title).map((sentence, k) => (
                      <span key={k} className="block">
                        {sentence
                          .split(" ")
                          .map((w, m) => (
                            <span key={m} className="whitespace-nowrap">
                              {w}
                            </span>
                          ))
                          .flatMap((w, m) => (m ? [" ", w] : [w]))}
                      </span>
                    ))}
                  </span>
                </h3>
                <blockquote className="t-standfirst mt-6 text-pretty lg:mt-7">
                  <p>&ldquo;{typeset(v.quote)}&rdquo;</p>
                </blockquote>
                <p className="t-small mt-8 font-medium">{v.name}</p>
                <p className="t-small text-muted">{v.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
