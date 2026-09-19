import { site } from "@/lib/site";

/**
 * The wordmark, set live in the display face so it inherits the current
 * ink and needs no image. "Revolt" carries the weight; "Marketing" is quiet.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-[0.32em] whitespace-nowrap font-display leading-none ${className}`}>
      <span className="font-semibold tracking-[-0.04em]">{site.shortName}</span>
      <span className="font-medium tracking-[-0.02em] opacity-70">Marketing</span>
    </span>
  );
}
