import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/ui/Button";

export const metadata: Metadata = { title: { absolute: "404 Error: Page Not Found" }, robots: { index: false } };

/** The live site's 404, word for word. */
export default function NotFound() {
  return (
    <main id="main">
      <section data-theme="ink" className="relative flex min-h-[100svh] items-end" aria-labelledby="nf-title">
        <div className="wrap pb-20 pt-[calc(var(--nav-h)+80px)]">
          <p className="t-mono t-small t-green">ERROR: PAGE NOT FOUND</p>
          <h1 id="nf-title" className="t-display-xl mt-4">404</h1>
          <p className="t-standfirst t-muted mt-8 max-w-[40ch]">This page isn’t available.</p>
          <p className="mt-12">
            <Link href="/" className="btn">
              Go to Homepage
              <Arrow />
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
