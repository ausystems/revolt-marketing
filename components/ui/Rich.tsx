"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { Block, Link as LinkT, TextBlock } from "@/content/live";
import { Arrow } from "@/components/ui/Button";

/** Text with its live links restored in place. */
export function Inline({ text, links }: { text: string; links?: LinkT[] }) {
  if (!links?.length) return <>{text}</>;
  const out: ReactNode[] = [];
  let rest = text;
  links.forEach((l, i) => {
    const idx = rest.indexOf(l.text);
    if (idx < 0 || !l.text) return;
    out.push(rest.slice(0, idx));
    const href = l.href || "/";
    out.push(
      href.startsWith("/") ? (
        <Link key={i} href={href} className="link">{l.text}</Link>
      ) : (
        <a key={i} href={href} className="link" {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener" } : {})}>{l.text}</a>
      ),
    );
    rest = rest.slice(idx + l.text.length);
  });
  out.push(rest);
  return <>{out}</>;
}

/**
 * A block's words. Lines typed with hard breaks keep them: two lines as a statement, three or more as a list. A space
 * sits at each break so the words never run together when the text is read rather than seen.
 */
function Words({ b }: { b: TextBlock }) {
  if (!b.lines || b.lines.length < 2) return <Inline text={b.text} links={b.links} />;
  const line = (text: string) => <Inline text={text} links={b.links?.filter((l) => text.includes(l.text))} />;
  if (b.lines.length === 2) return <>{line(b.lines[0])}{" "}<br />{line(b.lines[1])}</>;
  return (
    <>
      {b.lines.map((text, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="rich-line">{line(text)}</span>
        </Fragment>
      ))}
    </>
  );
}

/** Buttons keep their live words; a strategy-call button goes to the strategy call. */
export function hrefFor(text: string, href: string | null) {
  if (/strategy call/i.test(text)) return "/contact-us";
  return href && href !== "/" ? href : "/contact-us";
}

/** One block, set for the editorial body. */
export function RichBlock({ b, first }: { b: Block; first?: boolean }) {
  switch (b.t) {
    case "h1":
      return <h1 className="t-display-l"><Words b={b} /></h1>;
    case "h2":
      return <h2 className="t-display-m max-w-[22ch]"><Words b={b} /></h2>;
    case "h3":
      return <h3 className="t-display-m max-w-[22ch]"><Words b={b} /></h3>;
    case "h4":
      return <h4 className={`rich-h4 t-display-s ${b.lines && b.lines.length > 2 ? "rich-lines" : ""} ${first ? "" : "mt-10"}`}><Words b={b} /></h4>;
    case "h5":
      return <h5 className={`t-display-s ${first ? "" : "mt-12"}`}><Words b={b} /></h5>;
    case "h6":
      return <h6 className={`t-small font-semibold ${first ? "" : "mt-8"}`}><Words b={b} /></h6>;
    case "p":
      return <p className={`t-body max-w-[62ch] ${b.lines && b.lines.length > 2 ? "rich-lines" : ""} ${first ? "" : "mt-5"}`}><Words b={b} /></p>;
    case "ul":
      return (
        <ul className={`rich-list max-w-[62ch] ${first ? "" : "mt-6"}`}>
          {b.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      );
    case "button":
      return (
        <p className={first ? "" : "mt-8"}>
          <Link href={hrefFor(b.text, b.href)} className="btn">
            {b.text}
            <Arrow />
          </Link>
        </p>
      );
    default:
      return null;
  }
}

export type Chapter = { head: TextBlock | null; body: Block[] };

/** Group a block stream into chapters, each opening at a heading of the given levels. */
export function chapters(blocks: Block[], starters: Block["t"][] = ["h2", "h3"]): Chapter[] {
  const out: Chapter[] = [];
  for (const b of blocks) {
    if (starters.includes(b.t) && b.t !== "ul" && b.t !== "img" && b.t !== "button") out.push({ head: b, body: [] });
    else {
      if (!out.length) out.push({ head: null, body: [] });
      out[out.length - 1].body.push(b);
    }
  }
  return out.filter((c) => c.head || c.body.length);
}
