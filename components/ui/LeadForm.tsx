"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

/**
 * The live booking form, preserved exactly: the GoHighLevel / LeadConnector iframe
 * (form 2he5XlH5aqNZcaL5EPTk) plus its embed script, which resizes the frame and handles submission.
 * The surround is ours; the form, validation, submission and confirmation are theirs.
 * A designed loading state sits beneath the iframe until it paints.
 */
export default function LeadForm({ className = "", minHeight = 520 }: { className?: string; minHeight?: number }) {
  const [loaded, setLoaded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    // If the frame already painted before React attached the handler.
    const t = setTimeout(() => setLoaded(true), 6000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`relative ${className}`} style={{ minHeight }}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex flex-col gap-4 p-6 transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-2 gap-4">
            <div className="h-12 rounded-[10px] bg-white/[0.05]" />
            <div className="h-12 rounded-[10px] bg-white/[0.05]" />
          </div>
        ))}
        <div className="mx-auto mt-4 h-12 w-40 rounded-full bg-green/30" />
        <p className="note mt-2 text-center">Loading the booking form…</p>
      </div>
      <iframe
        ref={frame}
        src={site.form.src}
        style={{ width: "100%", height: "100%", minHeight, border: "none", borderRadius: 24, display: "block" }}
        id={`inline-${site.form.id}`}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name={site.form.name}
        data-height={String(site.form.height)}
        data-layout-iframe-id={`inline-${site.form.id}`}
        data-form-id={site.form.id}
        title="Free Strategy Call booking form"
        onLoad={() => setLoaded(true)}
        className={`relative transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      <Script id="leadconnector-embed" src={site.form.script} strategy="afterInteractive" />
    </div>
  );
}
