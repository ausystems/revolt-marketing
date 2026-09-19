/**
 * The chapter seal: a hairline tracer arc, the ball's flight in miniature.
 * Draws on reveal when wrapped in an element carrying data-tracer (see useReveals).
 */
export default function TracerMark({ className = "", tone = "green" }: { className?: string; tone?: "green" | "current" }) {
  const stroke = tone === "green" ? "#2BB61E" : "currentColor";
  return (
    <span data-tracer className={`inline-flex items-end ${className}`} aria-hidden="true">
      <svg className="tracer-mark" width="56" height="20" viewBox="0 0 56 20" fill="none">
        <path d="M2 18 C 14 2, 34 2, 54 15" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" pathLength={1} />
        <path d="M54 15 l0 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" pathLength={1} />
      </svg>
    </span>
  );
}
