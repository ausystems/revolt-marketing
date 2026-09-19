/**
 * Everything the page says, in one place.
 *
 * DRAFT CONTENT. The headlines and service copy are a first draft in Revolt's
 * voice; every item marked PLACEHOLDER is a stand-in and must be replaced with
 * the company's own facts, people, clients and assets before this goes live.
 * Nothing here should be read as a published claim.
 */
export const site = {
  name: "Revolt Marketing",
  shortName: "Revolt",
  url: "https://www.revoltmarketing.com", // PLACEHOLDER domain
  email: "hello@revoltmarketing.com", // PLACEHOLDER
  whatsapp: { number: "+1 000 000 0000", href: "https://wa.me/10000000000?text=Hi%20I%20want%20to%20book%20a%20call" }, // PLACEHOLDER
  /** Leave empty to show the contact form instead of a Calendly embed. */
  calendly: "",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" }, // PLACEHOLDER
    { label: "LinkedIn", href: "https://www.linkedin.com/" }, // PLACEHOLDER
    { label: "TikTok", href: "https://www.tiktok.com/" }, // PLACEHOLDER
    { label: "X", href: "https://x.com/" }, // PLACEHOLDER
  ],
  nav: {
    services: [
      { label: "Paid media", href: "/paid-media" },
      { label: "Creative", href: "/creative" },
      { label: "Retention", href: "/retention" },
    ],
    company: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
  offices: [
    // PLACEHOLDER entities and addresses
    { entity: "Revolt Marketing LLC", address: "Street, City, State 00000, United States" },
  ],
  /** PLACEHOLDER figures. Replace with real, defensible numbers. */
  facts: {
    brands: "200+",
    spend: "$40M+",
    retention: "90%",
    years: "6",
    people: "40+",
    rating: "4.9",
  },
  /**
   * PLACEHOLDER voices. Keep the shape: a short title (sentences split into
   * lines on the page), a quote, a name, a role, a portrait poster and,
   * optionally, a video. With no video the frame is a still.
   */
  testimonials: [
    { name: "Client name", role: "Founder, DTC brand", video: "", poster: "/assets/voices/voice-01.jpg", title: "A short title. In their own words.", quote: "Two or three sentences from a real client about what changed after working with Revolt. Written by them, not by us." },
    { name: "Client name", role: "CMO, consumer app", video: "", poster: "/assets/voices/voice-02.jpg", title: "What the numbers looked like before. And after.", quote: "Two or three sentences from a real client about what changed after working with Revolt. Written by them, not by us." },
    { name: "Client name", role: "Founder, e-commerce", video: "", poster: "/assets/voices/voice-03.jpg", title: "The switch we should have made a year earlier.", quote: "Two or three sentences from a real client about what changed after working with Revolt. Written by them, not by us." },
    { name: "Client name", role: "Head of Growth, SaaS", video: "", poster: "/assets/voices/voice-04.jpg", title: "Finally, a team that argues with us.", quote: "Two or three sentences from a real client about what changed after working with Revolt. Written by them, not by us." },
    { name: "Client name", role: "Owner, retail", video: "", poster: "/assets/voices/voice-05.jpg", title: "Less noise. More orders.", quote: "Two or three sentences from a real client about what changed after working with Revolt. Written by them, not by us." },
    { name: "Client name", role: "Founder, beauty brand", video: "", poster: "/assets/voices/voice-06.jpg", title: "Creative that actually gets shared.", quote: "Two or three sentences from a real client about what changed after working with Revolt. Written by them, not by us." },
  ],
  /** The channels Revolt runs. Set as typographic wordmarks, no logo files needed. */
  channels: ["Meta", "Google", "TikTok", "Snapchat", "Pinterest", "LinkedIn", "YouTube", "Klaviyo", "Shopify"],
  /** PLACEHOLDER client names. Leave the array empty to hide the row. */
  clients: ["Brand one", "Brand two", "Brand three", "Brand four", "Brand five", "Brand six", "Brand seven", "Brand eight"],
  /** The hero frame: a poster and, optionally, a muted loop of real creatives. PLACEHOLDER art. */
  hero: { poster: "/assets/hero/frame.jpg", video: "" },
  /** Eight creatives for the work strip, 9:16. PLACEHOLDER art. */
  creatives: Array.from({ length: 8 }, (_, i) => `/assets/work/creative-0${i + 1}.jpg`),
  people: {
    founders: { src: "/assets/people/founders.jpg", alt: "The founders of Revolt Marketing" }, // PLACEHOLDER
    team: { src: "/assets/people/team.jpg", alt: "The Revolt Marketing team" }, // PLACEHOLDER
    line: "Founded by the two people who still run it.", // PLACEHOLDER
    standfirst: "A team of 40 across three time zones, so the work never waits for a Monday.", // PLACEHOLDER
  },
} as const;
