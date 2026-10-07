/**
 * The shape of the services: the four systems, every service page, where each one lives and what it is drawn with.
 * No words a visitor reads live here; those come verbatim from the live site (content/live.ts). Names are the live
 * site's own and are used to match a live item to its route and drawing.
 */

export type SubService = {
  slug: string; // full path
  parent: string; // parent system slug
  name: string; // the live site's name for it
  /** which tracer diagram to draw on this page */
  diagram: "brand" | "profile" | "social" | "website" | "landing" | "content" | "social-mgmt" | "meta" | "google" | "seo" | "email" | "rebook" | "review" | "corporate" | "community" | "membership";
};

export type System = {
  n: string;
  slug: string;
  name: string;
  /** the scene drawn for the system on the services index and its own page */
  image: string;
};

export const systems: System[] = [
  { n: "01", slug: "/branding-and-design-strategy", name: "Branding & Design Strategy", image: "/media/services/01-bay-rest.jpg" },
  { n: "02", slug: "/growth-marketing-systems", name: "Growth Marketing Systems", image: "/media/services/02-bay-flight.jpg" },
  { n: "03", slug: "/marketing-automation-systems", name: "Marketing Automation Systems", image: "/media/services/03-ecosystem.jpg" },
  { n: "04", slug: "/event-marketing-strategy", name: "Event Marketing Strategy", image: "/media/services/04-venue.jpg" },
];

export const subServices: SubService[] = [
  { slug: "/branding-and-design-strategy/complete-branding-pack-2", parent: "/branding-and-design-strategy", name: "Complete Branding Pack", diagram: "brand" },
  { slug: "/branding-and-design-strategy/landing-page-design", parent: "/branding-and-design-strategy", name: "Landing Page Design", diagram: "landing" },
  { slug: "/google-business-profile-optimization", parent: "/branding-and-design-strategy", name: "Google Profile Setup", diagram: "profile" },
  { slug: "/platforms-we-set-up-and-optimize", parent: "/branding-and-design-strategy", name: "Social Media Setup", diagram: "social" },
  { slug: "/website-design-approach", parent: "/branding-and-design-strategy", name: "Website Design", diagram: "website" },
  { slug: "/growth-marketing-systems/content-creation", parent: "/growth-marketing-systems", name: "Content Creation", diagram: "content" },
  { slug: "/growth-marketing-systems/social-media-management", parent: "/growth-marketing-systems", name: "Social Media Management", diagram: "social-mgmt" },
  { slug: "/growth-marketing-systems/meta-ad-management", parent: "/growth-marketing-systems", name: "Meta Ad Management", diagram: "meta" },
  { slug: "/growth-marketing-systems/google-ad-management", parent: "/growth-marketing-systems", name: "Google Ad Management", diagram: "google" },
  { slug: "/growth-marketing-systems/seo-ranking", parent: "/growth-marketing-systems", name: "SEO Ranking", diagram: "seo" },
  { slug: "/marketing-automation-systems/email-text-automations", parent: "/marketing-automation-systems", name: "Email & Text Automations", diagram: "email" },
  { slug: "/marketing-automation-systems/re-booking-campaigns", parent: "/marketing-automation-systems", name: "Re-Booking Campaigns", diagram: "rebook" },
  { slug: "/marketing-automation-systems/auto-review-requests", parent: "/marketing-automation-systems", name: "Auto Review Requests", diagram: "review" },
  { slug: "/event-marketing-strategy/corporate-event-planning", parent: "/event-marketing-strategy", name: "Corporate Event Planning", diagram: "corporate" },
  { slug: "/event-marketing-strategy/community-event-planning", parent: "/event-marketing-strategy", name: "Community Event Planning", diagram: "community" },
  { slug: "/event-marketing-strategy/membership-vip-programs", parent: "/event-marketing-strategy", name: "Membership / VIP Programs", diagram: "membership" },
];

export const systemBySlug = (slug: string) => systems.find((s) => s.slug === slug);
export const subServiceBySlug = (slug: string) => subServices.find((s) => s.slug === slug);
