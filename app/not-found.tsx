import type { Metadata } from "next";
import Link from "next/link";
import { systems } from "@/content/services";
import { Arrow } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <main id="main">
      <section data-theme="ink" className="relative flex min-h-[100svh] items-end" aria-labelledby="nf-title">
        <div className="wrap pb-20 pt-[calc(var(--nav-h)+80px)]">
          <p className="t-mono t-small t-green">404</p>
          <h1 id="nf-title" className="t-display-xl mt-4 max-w-[10ch]">Out of bounds.</h1>
          <p className="t-standfirst t-muted mt-8 max-w-[40ch]">That page isn’t on the course. Take a drop at one of these.</p>
          <ul className="mt-12 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-5">
            {[{ n: "00", name: "Home", slug: "/", subline: "Start again" }, ...systems.map((s) => ({ n: s.n, name: s.name, slug: s.slug, subline: s.subline }))].map((s) => (
              <li key={s.slug} className="border-t border-line-dark">
                <Link href={s.slug} className="group block py-5">
                  <span className="t-mono t-micro t-green">{s.n}</span>
                  <span className="t-display-s mt-1 flex items-baseline justify-between gap-3 text-[1.05rem]">
                    {s.name}
                    <Arrow className="h-4 w-4 shrink-0 opacity-50 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100" />
                  </span>
                  <span className="t-small t-muted mt-1 block">{s.subline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
