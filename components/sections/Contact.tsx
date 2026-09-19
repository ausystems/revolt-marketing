"use client";

import { useEffect, useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { useReveal } from "@/components/motion/useReveal";

const CALENDLY_SCRIPT = "https://assets.calendly.com/assets/external/widget.js";

/**
 * The ask. A booking panel on the left (Calendly when site.calendly is set,
 * otherwise a short form that opens a prefilled email), a plain contact index
 * on the right.
 */
export default function Contact() {
  const ref = useReveal<HTMLElement>();
  const useCalendly = Boolean(site.calendly);

  // Load Calendly's widget.js once, but only as the visitor approaches the chapter.
  useEffect(() => {
    const root = ref.current;
    if (!root || !useCalendly) return;
    let script: HTMLScriptElement | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || script) return;
        io.disconnect();
        script = document.createElement("script");
        script.src = CALENDLY_SCRIPT;
        script.async = true;
        document.body.appendChild(script);
      },
      { rootMargin: "1500px 0px" },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [ref, useCalendly]);

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "WhatsApp",
      value: (
        <a className="link" href={site.whatsapp.href} target="_blank" rel="noopener">
          {site.whatsapp.number}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ),
    },
    {
      label: "Email",
      value: (
        <a className="link" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      ),
    },
    { label: "Hours", value: "Mon to Fri, and whenever the campaign needs us" },
    {
      label: "Addresses",
      value: (
        <ul className="space-y-3">
          {site.offices.map((o) => (
            <li key={o.entity}>
              <span className="t-small block font-medium">{o.entity}</span>
              <span className="t-small block text-pretty text-muted">{o.address}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <section ref={ref} id="contact" data-theme="paper" className="relative overflow-hidden" aria-labelledby="contact-title">
      {/* A soft ember wash, kept faint behind the chapter */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(45% 40% at 88% 22%, rgba(255, 107, 26, 0.22) 0%, rgba(255, 107, 26, 0) 70%), radial-gradient(40% 45% at 70% 70%, rgba(227, 25, 46, 0.12) 0%, rgba(227, 25, 46, 0) 70%)",
        }}
        aria-hidden="true"
      />
      <div className="wrap relative py-24 lg:py-[16vh]">
        <div className="grid-12">
          <h2 id="contact-title" className="t-display-l col-span-12 lg:col-span-9" data-reveal-lines>
            <span className="mask-line">
              <span>Ready when</span>
            </span>
            <span className="mask-line">
              <span>you are.</span>
            </span>
          </h2>
          <p className="t-standfirst col-span-12 mt-6 max-w-[40ch] text-pretty text-muted lg:col-span-6" data-reveal="0.1">
            Book a call below, or write to us on WhatsApp or email. A person answers, not a form.
          </p>
        </div>

        <div className="grid-12 mt-16 lg:mt-[8vh]">
          <div className="col-span-12 lg:col-span-6" data-reveal>
            {useCalendly ? (
              // One light frame in the page's radius; the width stays under Calendly's own card breakpoint.
              <div className="max-w-[640px] overflow-hidden rounded-[var(--radius)] border border-line bg-white">
                <div className="calendly-inline-widget h-[620px] lg:h-[700px]" data-url={site.calendly} style={{ minWidth: "320px" }} />
              </div>
            ) : (
              <ContactForm />
            )}
          </div>

          <div className="col-span-12 mt-12 lg:col-span-5 lg:col-start-8 lg:mt-0" data-reveal="0.1">
            <dl>
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[5.5rem_1fr] gap-4 border-t border-line py-5 last:border-b lg:grid-cols-[calc((100%_-_4_*_var(--col-gap))_/_5)_1fr] lg:gap-x-[var(--col-gap)]"
                >
                  <dt className="t-small text-muted">{r.label}</dt>
                  <dd className="t-body min-w-0 [overflow-wrap:anywhere]">{r.value}</dd>
                </div>
              ))}
            </dl>
            <p className="t-small mt-12 max-w-[44ch] text-muted">
              Know a brand that belongs here? We pay a referral fee on every one that signs.{" "}
              <a className="link link-flame font-medium" href={`mailto:${site.email}?subject=Referral`}>
                Ask about referrals
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * A short form. There is no backend yet: submitting opens the visitor's mail
 * client with the message prefilled, so nothing is ever lost.
 */
function ContactForm() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const brand = String(data.get("brand") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = encodeURIComponent(`Call request from ${name}${brand ? ` (${brand})` : ""}`);
    const body = encodeURIComponent(`${message}\n\n${name}\n${email}${brand ? `\n${brand}` : ""}`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };
  return (
    <form onSubmit={onSubmit} className="max-w-[640px] rounded-[var(--radius)] border border-line bg-white p-6 sm:p-8" aria-label="Book a call">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="t-small mb-2 block text-muted">Name</span>
          <input className="field" name="name" type="text" autoComplete="name" required />
        </label>
        <label className="block">
          <span className="t-small mb-2 block text-muted">Email</span>
          <input className="field" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block sm:col-span-2">
          <span className="t-small mb-2 block text-muted">Brand</span>
          <input className="field" name="brand" type="text" autoComplete="organization" />
        </label>
        <label className="block sm:col-span-2">
          <span className="t-small mb-2 block text-muted">What are you trying to grow?</span>
          <textarea className="field" name="message" required />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" className="btn">
          Request a call
        </button>
        <span className="t-small text-muted" role="status" aria-live="polite">
          {sent ? "Opening your mail app. We reply within one working day." : "We reply within one working day."}
        </span>
      </div>
    </form>
  );
}
