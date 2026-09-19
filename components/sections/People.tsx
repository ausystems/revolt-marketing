"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { useReveal } from "@/components/motion/useReveal";
import { site } from "@/lib/site";

/** The About link is defined once, in site.nav.company. */
const about = site.nav.company.find((l) => l.href === "/about") ?? site.nav.company[0];

/**
 * People. A cinematic still.
 * Two photographs set asymmetrically with generous space, and one short
 * statement about who runs the company. The founders sit large on the left.
 * The team photograph steps in beneath the text, its top-left corner laid over
 * the bottom-right corner of the first frame so the two pictures interlock.
 */
export default function People() {
  const ref = useReveal<HTMLElement>();

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();

    const ctx = gsap.context(() => {
      // Each photograph unclips downward while the image settles from 1.06 to 1.
      root.querySelectorAll<HTMLElement>("[data-photo]").forEach((frame) => {
        const img = frame.querySelector("img");
        const tl = gsap.timeline({
          defaults: { ease: motion.ease, duration: 1.4 },
          scrollTrigger: { trigger: frame, start: "top 82%", once: true },
        });
        tl.fromTo(frame, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }, 0);
        if (img) tl.fromTo(img, { scale: 1.06 }, { scale: 1 }, 0);
      });
    }, root);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [ref]);

  const { founders, team, line, standfirst } = site.people;

  return (
    <section ref={ref} data-theme="paper" className="relative" aria-labelledby="people-title">
      <div className="wrap py-24 lg:py-[16vh]">
        <div className="grid-12">
          {/* Photo A: the founders. Columns 1 to 7, taller than it is wide. */}
          <div data-photo className="media-cover col-span-12 aspect-[4/5] lg:col-span-7">
            <Image src={founders.src} alt={founders.alt} fill sizes="(min-width:1024px) 55vw, 100vw" />
          </div>

          {/* The statement. Columns 9 to 12, sitting on the lower part of photo A. */}
          <div
            className="col-span-12 mt-12 max-w-[34rem] lg:col-span-4 lg:col-start-9 lg:mt-0 lg:max-w-none lg:self-end lg:mb-[calc(16vh+56px)]"
            data-reveal
          >
            <h2 id="people-title" className="t-display-m text-ink">
              {line}
            </h2>
            <p className="t-standfirst mt-6 text-muted">{standfirst}</p>
            <div className="mt-8">
              <Link href={about.href} className="link link-flame t-small font-medium">
                {about.label}
              </Link>
            </div>
          </div>

          {/* Photo B: the team, pulled up so it lays over the bottom-right corner of photo A. */}
          <div
            data-photo
            className="media-cover relative z-10 col-span-12 mt-[10vh] aspect-[3/2] lg:col-span-6 lg:col-start-7 lg:-mt-[16vh] lg:aspect-[5/3]"
          >
            <Image src={team.src} alt={team.alt} fill sizes="(min-width:1024px) 48vw, 100vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
