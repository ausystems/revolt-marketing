import type { ReactNode } from "react";

/** Hairline rows with leaders and mono values, for facts, breakdowns and receipts. */
export default function Ledger({ rows, className = "" }: { rows: { label: ReactNode; value: ReactNode; href?: string }[]; className?: string }) {
  return (
    <dl className={`ledger ${className}`}>
      {rows.map((r, i) => (
        <div key={i} className="ledger-row">
          <dt className="t-small">{r.label}</dt>
          <i aria-hidden="true" />
          <dd className="t-small t-mono text-right">{r.href ? <a className="link-quiet" href={r.href}>{r.value}</a> : r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
