/** Facts, links and integrations published by Revolt Marketing. Nothing here is invented. */
export const site = {
  name: "Revolt Marketing",
  legalName: "Revolt Creative Marketing",
  url: "https://www.revolt-marketing.com",
  tagline: "The only marketing firm built exclusively for golf simulator entertainment venues across North America.",
  phone: { display: "(647) 951-4131", href: "tel:+16479514131" },
  email: "shayne@revolt-marketing.com",
  privacyEmail: "tristan@revolt-marketing.com",
  location: "Toronto, Canada",
  address: "100 City Centre Drive, Toronto, Ontario, Canada",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/revolt.marketing?igsh=MWN1bXN3MjBrcWtjMw==" },
    { label: "Facebook", href: "https://www.facebook.com/people/Revolt-Marketing/100088909748044/" },
  ],
  /** The live booking form: GoHighLevel / LeadConnector. Preserved exactly. */
  form: {
    id: "2he5XlH5aqNZcaL5EPTk",
    src: "https://api.leadconnectorhq.com/widget/form/2he5XlH5aqNZcaL5EPTk",
    script: "https://link.msgsndr.com/js/form_embed.js",
    name: "Revolt Marketing - Copy",
    height: 498,
  },
  cta: { label: "Free Strategy Call", href: "/contact-us" },
  nav: {
    primary: [
      { label: "Services", href: "/services" },
      { label: "About us", href: "/about-us" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact-us" },
    ],
    services: [
      { label: "Branding & Design Strategy", href: "/branding-and-design-strategy", short: "Branding" },
      { label: "Growth Marketing Systems", href: "/growth-marketing-systems", short: "Growth" },
      { label: "Marketing Automation Systems", href: "/marketing-automation-systems", short: "Automation" },
      { label: "Event Marketing Strategy", href: "/event-marketing-strategy", short: "Events" },
    ],
    legal: [{ label: "Privacy Policy", href: "/privacypolicy" }],
  },
  founders: [
    {
      name: "Shayne Mueller",
      role: "Co-founder · Growth marketing",
      leads: "Growth marketing strategies",
      photo: "/media/founder-shayne.jpg",
      square: "/media/founder-shayne-square.jpg",
      bio: "Shayne leads Revolt’s growth marketing strategies, combining creative advertising with data-driven optimization. With a background scaling e-commerce brands through paid advertising, he now specializes in driving walk-in traffic for golf simulator venues. He builds Google Ads and Meta campaigns that track every click, booking, and dollar spent, so venue owners know exactly what’s working. Your campaigns aren’t just creative, they’re measurable, optimized, and profitable.",
    },
    {
      name: "Tristan Costa",
      role: "Co-founder · Sales, events & local growth",
      leads: "Sales, event marketing and local growth strategies",
      photo: "/media/founder-tristan.jpg",
      square: "/media/founder-tristan-square.jpg",
      bio: "Tristan leads Revolt’s sales, event marketing and local growth strategies. After building one of Toronto’s largest nightlife companies and consistently filling venues to capacity, he now helps golf simulator venues create that same demand. He specializes in corporate events, league membership campaigns, and local brand positioning that turns weekday afternoons into high-value bookings. For venue owners, that means packed weekdays and predictable event revenue.",
    },
  ],
  /** The four differentiators from the live homepage and services page, verbatim in substance. */
  why: [
    {
      title: "Specialized exclusively in golf simulator marketing",
      text: "We don’t serve restaurants, retailers, or random businesses. Just golf entertainment venues. Every strategy is built for your venue type.",
    },
    {
      title: "No daily content creation required",
      text: "Built for automated venues without full-time staff. We use professional shoots and paid ads, not daily filming.",
    },
    {
      title: "Proven strategies from 100+ venues researched",
      text: "We know what works because we’ve studied the market. Our strategies are built on data, not guesswork.",
    },
    {
      title: "Performance-focused, not vanity metrics",
      text: "We care about bookings and revenue, not followers. Results that matter to your bottom line.",
    },
  ],
  approach: [
    { title: "Specialized, not generalized", text: "Every solution we build is created specifically for golf simulator businesses." },
    { title: "Walk-ins + bookings + repeat visits", text: "Our systems don’t only bring traffic, they bring lifetime customers." },
    { title: "Proven playbooks, not experiments", text: "All of our systems are crafted with extensive research behind them." },
    { title: "Clear communication", text: "We provide you with clear reports and fast communication for any questions." },
  ],
  story: [
    "After working with dozens of local businesses across Toronto, we noticed a pattern: golf simulator venues were growing fast but struggling with the same marketing challenges. They needed consistent walk-in traffic, corporate event bookings, and repeat customers, but most marketing firms didn’t understand their unique business model.",
    "So we specialized. We studied 100+ golf entertainment venues, identified what actually drives bookings (not just followers), and built proven strategies specifically for this industry. Now we’re the only marketing firm in North America focused exclusively on golf simulators.",
  ],
  strategyCall: {
    title: "Free Strategy Call",
    text: "During this free strategy call, we’ll audit your golf simulator marketing efforts, identify what’s holding you back, and show you exactly how to fill your bays and book more corporate events. Perfect for venue operators looking to implement effective golf simulator marketing strategies across North America.",
    steps: [
      { title: "We audit your marketing", text: "Where your bookings come from today, and where they leak." },
      { title: "We identify what’s holding you back", text: "Empty weekdays, missing corporate bookings, no re-booking system." },
      { title: "We show you the plan", text: "Exactly how to fill your bays and book more events." },
    ],
  },
  seo: {
    title: "North Americas #1 Golf Simulator Marketing Firm - Revolt Marketing",
    description: "Revolt Marketing is North Americas #1 Golf Simulator Marketing Firm, driving sales with expert SEO, PPC, and lead generation strategies.",
  },
} as const;

export type ServiceLink = (typeof site.nav.services)[number];
