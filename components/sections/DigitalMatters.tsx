"use client";

import Image from "next/image";
import Link from "next/link";
import { live } from "@/content/live";
import { useReveals } from "@/components/motion/useReveals";
import TracerMark from "@/components/ui/TracerMark";
import { Arrow } from "@/components/ui/Button";

/**
 * Why digital marketing matters for golf venues: the case, the line that sums it up set large, the invitation,
 * and the button, beside the swing photograph.
 */
export default function DigitalMatters() {
  const ref = useReveals<HTMLElement>();
  const { digital } = live.home;
  const [why, line, invite, book] = digital.ps;
  return (
    <section ref={ref} id="digital" data-theme="paper" className="relative" aria-labelledby="digital-title">
      <div className="wrap sect">
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <TracerMark />
            <h3 id="digital-title" className="t-display-l mt-6 max-w-[16ch]" data-split>{digital.h3}</h3>
            <p className="t-standfirst t-muted mt-8 max-w-[52ch]" data-reveal>{why}</p>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <div className="media-cover aspect-[4/3]" data-reveal="scale">
              <Image src="/media/golfer.jpg" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" data-parallax="0.08" className="scale-[1.12]" />
            </div>
          </div>
        </div>
        <p className="t-display-m mt-20 max-w-[28ch] text-ink lg:mt-28" data-reveal>{line}</p>
        <div className="mt-12 grid-12 gap-y-8 border-t border-line pt-10">
          <p className="t-body col-span-12 max-w-[56ch] lg:col-span-6" data-reveal>{invite}</p>
          <div className="col-span-12 flex flex-wrap items-center gap-x-8 gap-y-5 lg:col-span-5 lg:col-start-8" data-reveal data-delay="0.1">
            <p className="t-body font-medium">{book}</p>
            {digital.button && (
              <Link href={digital.button.href ?? "/contact-us"} className="btn">
                {digital.button.text}
                <Arrow />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
