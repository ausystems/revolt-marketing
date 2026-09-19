"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { isTouchDevice, prefersReducedMotion, registerGsap } from "@/lib/motion";

type Props = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "paper" | "ink";
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  className?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  ariaLabel?: string;
};

/** The arrow in miniature: a straight shaft, a clean head. It lifts along a shallow arc on hover (see .btn-arrow). */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={`btn-arrow ${className}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h10M8.5 3.75 12.75 8 8.5 12.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The pill button. Primary is Revolt green; secondary is a hairline pill in the current colour.
 * Gently magnetic on pointer devices (strength .25), never enough to make it hard to click.
 */
export default function Button({ href, children, variant = "primary", size = "md", arrow = false, className = "", external, onClick, type = "button", ariaLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouchDevice() || prefersReducedMotion()) return;
    const { gsap } = registerGsap();
    const qx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const qy = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.25);
      qy((e.clientY - r.top - r.height / 2) * 0.25);
    };
    const leave = () => { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, .5)" }); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, []);

  const cls = ["btn", variant === "secondary" && "btn-secondary", variant === "paper" && "btn-paper", variant === "ink" && "btn-ink", size === "lg" && "btn-lg", size === "sm" && "btn-sm", className].filter(Boolean).join(" ");
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  );
  if (href) {
    if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return (
        <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener" : undefined} aria-label={ariaLabel} onClick={onClick}>
          {inner}
        </a>
      );
    }
    return (
      <Link ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className={cls} aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref as React.RefObject<HTMLButtonElement>} type={type} className={cls} onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}
