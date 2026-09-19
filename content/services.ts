/**
 * The four systems and every sub-service, in the live site's own words.
 * Copy is preserved in substance; obvious template residue (a triple-pasted paragraph, "Texas" left over from a
 * regional template, a few typos) has been corrected. No offer, claim or number has been added.
 */

export type Section = { title: string; paragraphs?: string[]; bullets?: string[] };

export type SubService = {
  slug: string; // full path
  parent: string; // parent system slug
  name: string; // menu / index name
  h1: string;
  standfirst: string;
  seoTitle: string;
  description: string;
  intro: string[];
  breakdown: { title: string; text?: string }[];
  sections: Section[];
  /** which tracer diagram to draw on this page */
  diagram: "brand" | "profile" | "social" | "website" | "landing" | "content" | "social-mgmt" | "meta" | "google" | "seo" | "email" | "rebook" | "review" | "corporate" | "community" | "membership";
};

export type System = {
  n: string;
  slug: string;
  name: string;
  short: string;
  promise: string; // the one-line promise from the homepage
  subline: string; // the services-index subline
  summary: string; // the services-index paragraph
  standfirst: string; // the category page standfirst
  seoTitle: string;
  description: string;
  image: string;
  imageAlt: string;
  children: { name: string; slug: string; text: string }[];
};

export const systems: System[] = [
  {
    n: "01",
    slug: "/branding-and-design-strategy",
    name: "Branding & Design Strategy",
    short: "Branding",
    promise: "Launch with professional branding that makes you stand out from day one.",
    subline: "Stand out in your market from day one",
    summary: "Launch with professional branding, a high-converting website, and an optimized Google presence that turns searches into bookings. First impressions matter, make yours unforgettable.",
    standfirst: "From strategy to execution, every design we create works together to attract, convert, and retain your ideal customer.",
    seoTitle: "Branding & Design Strategy for Golf Simulators | Revolt",
    description: "Boost your golf simulator business with expert branding and design strategies by Revolt. Stand out, attract more clients, and grow your brand.",
    image: "/media/services/01-bay-rest.jpg",
    imageAlt: "A simulator bay at rest: the ball on the mat, the screen lit and waiting",
    children: [
      { name: "Complete Branding Pack", slug: "/branding-and-design-strategy/complete-branding-pack-2", text: "Build a premium brand identity that positions your venue as the go-to entertainment destination in your market. We design your complete visual system: logo, color palette, typography, and brand guidelines that reflect the high-end experience you deliver. Professional branding builds instant trust and credibility before customers ever step inside, separating you from amateur competitors who look like budget operations." },
      { name: "Google Profile Setup", slug: "/google-business-profile-optimization", text: "Dominate local search results when golfers across the United States and Canada search for indoor simulators near them. We optimize your Google Business Profile with photos, hours, services, and strategic keywords to push your venue to the top of the map pack. Most bookings start with a Google search. Our work ensures players find your venue first, not competing venues nearby." },
      { name: "Social Media Setup", slug: "/platforms-we-set-up-and-optimize", text: "Build a premium golf entertainment brand presence on the platforms that matter. We structure and optimize your Facebook Business Page and Instagram Business Profile so every profile reflects the high-end experience you deliver and feeds your ads, website traffic and automation." },
      { name: "Website Design", slug: "/website-design-approach", text: "Convert visitors into bookings with a fast, mobile-optimized website built specifically for golf simulator venues. Clear calls-to-action, integrated booking systems, and compelling visuals guide customers from curious browsers to confirmed reservations in seconds. Your website works 24/7 as your best salesperson." },
      { name: "Landing Page Design", slug: "/branding-and-design-strategy/landing-page-design", text: "Capture leads from paid ads with high-converting landing pages designed for one singular goal: getting customers to book bays immediately. Every element — headlines, images, forms, and buttons — is strategically optimized. The right landing page can dramatically increase conversion rates and lower cost per booking." },
    ],
  },
  {
    n: "02",
    slug: "/growth-marketing-systems",
    name: "Growth Marketing Systems",
    short: "Growth",
    promise: "Drive consistent bookings and fill your bays with ready-to-book customers daily.",
    subline: "Fill your bays with ready-to-book customers",
    summary: "Drive consistent bookings through Google Ads, Meta advertising, and local SEO that dominates ‘golf simulator near me’ searches. We turn empty bays into packed schedules.",
    standfirst: "From paid ads to organic reach, every campaign we launch fills bays, drives bookings, and maximizes profits.",
    seoTitle: "Growth Marketing Systems for Golf Simulators | Revolt",
    description: "Unlock scalable growth with Revolt’s data-driven marketing systems built for golf simulator businesses. Automate, optimize, and grow faster.",
    image: "/media/services/02-bay-flight.jpg",
    imageAlt: "A shot mid-flight: the tracer arcing from the mat toward the screen",
    children: [
      { name: "Content Creation", slug: "/growth-marketing-systems/content-creation", text: "Showcase your venue with professional photos and videos that capture the energy, excitement, and premium experience of your space. We coordinate professional photographers, direct creative shoots, and deliver content ready for ads, websites, and social media. Low-quality visuals reduce conversion rates and weaken your brand." },
      { name: "Social Media Management", slug: "/growth-marketing-systems/social-media-management", text: "Stay top-of-mind with consistent, engaging content that showcases your venue without requiring daily effort from your team. We manage posting schedules, content creation, caption writing, and community engagement while you focus on operations and delivering an exceptional in-venue experience." },
      { name: "Meta Ad Management", slug: "/growth-marketing-systems/meta-ad-management", text: "Reach thousands of golf enthusiasts with targeted Facebook and Instagram ads designed to drive immediate bookings. We handle campaign setup, audience targeting, creative testing, budget optimization, and performance tracking. Every dollar spent is measured and refined for maximum return." },
      { name: "Google Ad Management", slug: "/growth-marketing-systems/google-ad-management", text: "Capture high-intent customers actively searching for golf simulators near them. We manage Google Ads campaigns, bid strategies, keyword targeting, and ad copy so your venue appears at the top when someone searches for indoor golf simulators in their area. High-intent searches translate into higher bookings." },
      { name: "SEO Ranking", slug: "/growth-marketing-systems/seo-ranking", text: "Own top organic positions in Google search results for “golf simulator near me” and related terms. We optimize website structure, build citations, and create search-focused content that helps your venue rank above competitors, delivering compounding traffic and consistent customer acquisition month after month without relying solely on paid ads." },
    ],
  },
  {
    n: "03",
    slug: "/marketing-automation-systems",
    name: "Marketing Automation Systems",
    short: "Automation",
    promise: "Chip in smart automation that turns first-time visitors into loyal lifetime regulars.",
    subline: "Turn first-time visitors into lifetime regulars",
    summary: "Turn first-time visitors into loyal regulars through automated email, SMS, and review systems. Reduce no-shows with booking reminders and reactivate inactive customers, all on autopilot.",
    standfirst: "From first visit to repeat booking, every automation retains customers, generates reviews, and increases value.",
    seoTitle: "Marketing Automation Systems for Golf Simulators | Revolt",
    description: "Automate your marketing with Revolt’s advanced systems built to streamline growth, boost leads, and scale your golf simulator business.",
    image: "/media/services/03-ecosystem.jpg",
    imageAlt: "Four tracers converging on one lit venue",
    children: [
      { name: "Email & Text Automations", slug: "/marketing-automation-systems/email-text-automations", text: "Stay connected with customers through automated email and SMS campaigns that nurture relationships without manual effort from your team. Welcome sequences, special promotions, and re-engagement campaigns run 24/7. Your customer database becomes a revenue engine, even when your doors are closed or your team is busy." },
      { name: "Re-Booking Campaigns", slug: "/marketing-automation-systems/re-booking-campaigns", text: "Turn one-time visitors into repeat customers with automated follow-ups that strategically bring them back to book again. Personalized messages, exclusive offers, and timely reminders are sent automatically based on customer behavior and visit history, so your venue fills bays month after month without additional effort." },
      { name: "Auto Review Requests", slug: "/marketing-automation-systems/auto-review-requests", text: "Build a five-star reputation automatically by requesting reviews from happy customers at the perfect moment, right after a great experience. Review requests go out via email and SMS following positive visits, driving more Google reviews without awkward in-person asks. More reviews improve trust and boost SEO visibility." },
    ],
  },
  {
    n: "04",
    slug: "/event-marketing-strategy",
    name: "Event Marketing Strategy",
    short: "Events",
    promise: "Sink more corporate events and fill your slow weekdays with consistent revenue.",
    subline: "Fill your weekdays with high-value corporate events",
    summary: "Fill your weekdays with high-value corporate events, private parties, and league memberships. We handle B2B outreach, event landing pages, and booking automation so you don’t have to.",
    standfirst: "Turn empty bays into premium revenue streams through corporate events and exclusive member programs.",
    seoTitle: "Event Marketing Strategy for Golf Simulators | Revolt",
    description: "Grow your golf simulator business with Revolt’s event marketing strategies. Drive attendance, boost brand visibility, and attract high-value customers.",
    image: "/media/services/04-venue.jpg",
    imageAlt: "A player mid-swing inside a golf simulator bay",
    children: [
      { name: "Corporate Event Planning", slug: "/event-marketing-strategy/corporate-event-planning", text: "Turn empty bays into premium revenue streams through corporate events. A single corporate event can fill multiple bays for several hours while generating premium revenue. We attract, convert, and book corporate clients with targeted outreach, optimized event packages, and a booking funnel built specifically for B2B." },
      { name: "Community Event Planning", slug: "/event-marketing-strategy/community-event-planning", text: "Build loyalty and buzz with tournaments, leagues, and themed events that turn casual players into your biggest advocates and repeat customers. We plan, promote, and help execute events that fill your venue during traditionally slow periods, creating recurring revenue, organic word-of-mouth, and a competitive moat." },
      { name: "Membership / VIP Programs", slug: "/event-marketing-strategy/membership-vip-programs", text: "Create predictable monthly recurring revenue with exclusive membership and VIP programs that reward your best customers with perks and priority access. We design tiered programs, pricing structures, member benefits, and launch campaigns that drive sign-ups and improve cash flow and lifetime value." },
    ],
  },
];

export const subServices: SubService[] = [
  // ---- 01 Branding & Design Strategy -----------------------------------------------------------
  {
    slug: "/branding-and-design-strategy/complete-branding-pack-2",
    parent: "/branding-and-design-strategy",
    name: "Complete Branding Pack",
    h1: "What’s included in your Complete Branding Pack",
    standfirst: "Your branding system is strategically built to support lead generation, premium positioning, and scalable growth for your golf venue.",
    seoTitle: "What’s Included in Your Complete Branding Pack | Revolt",
    description: "Complete golf simulator branding pack: premium logo, colors, fonts, business cards and brand guidelines built to drive leads and bookings.",
    intro: [
      "Professional branding builds instant trust and credibility before customers ever step inside. Your complete visual system — logo, palette, typography and guidelines — becomes the anchor of your entire marketing system, used across signage, digital ads, social media, booking pages, and automation campaigns.",
    ],
    breakdown: [
      { title: "Logo design", text: "A custom, high-impact logo designed specifically for golf simulator venues. Your logo becomes the anchor of your marketing system, used across signage, digital ads, social media, booking pages, and automation campaigns." },
      { title: "Colour palette", text: "Strategically selected brand colors that communicate energy, luxury, competition, or exclusivity depending on your target audience. The right palette improves recognition and strengthens performance across your marketing funnel." },
      { title: "Font selection", text: "Professional typography that enhances clarity and credibility across websites, paid ads, email campaigns, and promotional materials." },
      { title: "Business card design", text: "Premium business card designs that elevate your authority when pitching corporate events and partnerships. Professional presentation strengthens local customer acquisition in competitive markets." },
      { title: "Brand guidelines PDF", text: "A comprehensive Brand Guidelines document outlining logo usage, color codes, typography rules, and layout standards. This ensures consistency across your website, paid ads, signage and social media, preventing brand dilution as you scale." },
    ],
    sections: [
      { title: "Our branding process", bullets: ["Market positioning strategy — we define your audience, pricing tier, and competitive advantage within your city. This strategic foundation aligns your brand with your broader growth strategy.", "Visual identity development — we create multiple brand directions based on your positioning: luxury, competitive, corporate-focused, or social entertainment.", "Optimization for marketing performance — your branding is designed to integrate seamlessly into your website, landing pages, paid ads, and automation systems, from first click to repeat booking.", "Final delivery and implementation — you receive all files in print and digital formats, ready for immediate rollout across your full marketing system."] },
      { title: "Why consistent branding drives results", paragraphs: ["Consistent branding directly improves customer growth. When your website, ads, social media, email campaigns, and booking pages all reflect the same professional identity, customers perceive higher value.", "Higher perceived value leads to stronger customer acquisition, higher booking conversion rates, increased repeat visits, and premium pricing power.", "Amateur branding competes on price. Professional branding positions you as the premium option in your city. If you want to dominate your local market instead of blending in, your branding must support your entire marketing system from day one."] },
    ],
    diagram: "brand",
  },
  {
    slug: "/branding-and-design-strategy/landing-page-design",
    parent: "/branding-and-design-strategy",
    name: "Landing Page Design",
    h1: "High-converting landing page design",
    standfirst: "Focused, conversion-driven landing pages built to maximize lead generation, increase bookings, and scale your golf venue marketing system.",
    seoTitle: "Landing Page Design | Revolt",
    description: "High-converting landing pages for golf simulator venues: offer-specific design, single-objective layouts, booking integrations and technical tracking.",
    intro: [
      "A landing page is not a smaller website. It is a focused conversion asset built to drive one specific action. For golf simulator venues running paid ads, promotions, corporate event campaigns, or seasonal offers, a high-converting landing page is essential to maximize lead generation and strengthen your overall marketing system.",
      "When built correctly, landing pages accelerate customer acquisition and improve the performance of your entire marketing funnel.",
    ],
    breakdown: [
      { title: "Offer-specific designs", text: "We design landing pages tailored to a specific promotion, event, membership offer, or corporate package. This focused approach increases conversion rates by removing distractions." },
      { title: "Single-objective layout", text: "Each page is built around one clear goal such as booking a bay, reserving an event, or claiming an offer. A single-objective layout improves clarity and drives stronger customer acquisition." },
      { title: "Mobile and desktop optimization", text: "Most paid traffic comes from mobile users. We optimize your landing page for both mobile and desktop performance, ensuring fast load speeds and seamless navigation." },
      { title: "Clear calls to action", text: "Strategically placed calls to action guide visitors toward booking. Every section of the page moves users through your marketing funnel." },
      { title: "Booking platform integrations", text: "We integrate your booking software directly into the landing page to eliminate friction. Smooth booking functionality increases lead generation." },
      { title: "Technical tracking", text: "We implement proper tracking for ads, analytics, and conversion events so you can measure performance, optimize campaigns, and scale with data-driven decisions." },
    ],
    sections: [
      { title: "What makes a high-converting landing page", paragraphs: ["A high-converting landing page removes distractions and focuses entirely on conversion. Unlike a full website, it eliminates unnecessary navigation and directs visitors toward one specific action. This structure strengthens traffic generation and improves return on ad spend."], bullets: ["Clear messaging aligned with your offer", "Compelling headlines that support lead generation", "Trust elements such as reviews and social proof", "Fast loading speed for mobile users", "Direct integration into your marketing system"] },
      { title: "Our design and optimization process", paragraphs: ["We begin by understanding your campaign goal and how it fits into your broader growth strategy. Next, we map the layout around your target audience and offer. Every design decision supports your marketing funnel.", "Then we integrate booking systems, tracking tools, and conversion optimization elements to ensure your landing page supports measurable customer acquisition. Finally, we test performance and refine where necessary to improve conversion rates."] },
      { title: "When you need a landing page vs. a full website", paragraphs: ["A full website builds your overall brand presence and supports long-term growth. A landing page is best when you are running paid ads, launching a limited-time promotion, targeting corporate events, promoting memberships or leagues, or testing a new market or offer.", "If your goal is focused lead generation for a specific campaign, a landing page will outperform a standard website page almost every time. Your website builds authority. Your landing page drives immediate action."] },
    ],
    diagram: "landing",
  },
  {
    slug: "/google-business-profile-optimization",
    parent: "/branding-and-design-strategy",
    name: "Google Profile Setup",
    h1: "How we optimize your Google Business Profile",
    standfirst: "We don’t just fill out your profile — we strategically align it with your full marketing system and funnel.",
    seoTitle: "Google Business Profile Optimization for Golf Simulator Venues",
    description: "Optimize your Google Business Profile for golf simulators. Increase Map Pack visibility, calls, and local bookings fast.",
    intro: [
      "Most bookings begin with a local search. If your profile isn’t optimized, you’re invisible to high-intent customers actively searching for a simulator experience in your area. Every element of the profile is designed to improve visibility, increase clicks, and accelerate customer growth.",
    ],
    breakdown: [
      { title: "Profile creation and category selection", text: "Proper Google Business Profile creation and category selection." },
      { title: "SEO-optimized business description", text: "A business description infused with strategic keywords." },
      { title: "Structured service and menu listings", text: "Listings that improve traffic generation." },
      { title: "Local keyword targeting", text: "Targeting for your competitive local market." },
      { title: "Structured Q&A setup", text: "Q&A that strengthens search relevance." },
      { title: "Review response framework", text: "A framework that boosts engagement and trust." },
    ],
    sections: [
      { title: "What you get with professional setup", bullets: ["Stronger customer acquisition", "Increased exposure in the Google Map Pack", "Higher website clicks and call volume", "Improved local authority signals", "Better alignment with your growth marketing strategy"], paragraphs: ["Instead of passively existing on Google, your profile becomes an active lead generation asset supporting your growth 24/7."] },
      { title: "Why your Google profile matters for local visibility", paragraphs: ["A fully optimized Google profile improves local rankings, click-through rates, call volume, website traffic and overall lead generation.", "Dominating local search is one of the fastest and most cost-effective ways to drive consistent customer growth without increasing ad spend. Your Google profile isn’t just a listing — it’s a foundational pillar of your venue’s growth strategy."] },
    ],
    diagram: "profile",
  },
  {
    slug: "/platforms-we-set-up-and-optimize",
    parent: "/branding-and-design-strategy",
    name: "Social Media Setup",
    h1: "Platforms we set up and optimize",
    standfirst: "We structure and optimize the primary platforms that matter most for golf simulator venues.",
    seoTitle: "Platforms We Set Up & Optimize | Revolt",
    description: "Set up and optimize Facebook & Instagram for golf simulator venues. Boost engagement, website clicks, and customer bookings effectively.",
    intro: [
      "Each platform is aligned with your broader marketing system, ensuring consistency across ads, website traffic, and marketing automation efforts. We don’t just create accounts — we build a professional digital storefront that strengthens your overall growth.",
    ],
    breakdown: [
      { title: "Facebook Business Page", text: "Structured and optimized as a professional storefront for your venue." },
      { title: "Instagram Business Profile", text: "Set up to reflect the premium experience you deliver and to feed your ads and automation." },
    ],
    sections: [
      { title: "What’s included in your social media foundation", paragraphs: ["Your social media setup is designed to support lead generation, stronger customer acquisition, increased traffic generation and long-term customer growth."] },
      { title: "How professional setup accelerates growth", paragraphs: ["Amateur social profiles reduce trust. Inconsistent branding weakens conversion rates. A professionally structured social presence improves profile engagement, website click-through rates, ad performance, corporate booking inquiries and overall growth marketing results.", "Social media is not just about posting content — it’s about building credibility that feeds your entire marketing funnel."] },
    ],
    diagram: "social",
  },
  {
    slug: "/website-design-approach",
    parent: "/branding-and-design-strategy",
    name: "Website Design",
    h1: "Our website design approach",
    standfirst: "We design websites strategically, not just visually.",
    seoTitle: "Our Website Design Approach",
    description: "Discover our website design approach for golf simulator venues. Boost trust, bookings, and conversions with a high-quality, optimized site.",
    intro: [
      "First, we analyze your market positioning and growth strategy. Then we structure your website to align with your marketing funnel, ensuring each section has a clear purpose.",
      "Every layout decision supports customer acquisition. Every call-to-action is placed intentionally. Every page is built to convert traffic into booked bays. Your website becomes a 24/7 digital salesperson that strengthens your entire marketing system.",
    ],
    breakdown: [
      { title: "5-page website layout", text: "We build a strategic 5-page structure designed specifically for golf simulator growth. Each page is intentionally mapped to your funnel, guiding visitors from awareness to booking with clarity and confidence." },
      { title: "Interactive design", text: "Modern, interactive design elements keep visitors engaged and increase time on site. A dynamic user experience improves overall conversion performance." },
      { title: "Consistent branding", text: "Your website aligns fully with your branding system. Visual cohesion builds trust, increases perceived value, and supports premium positioning." },
      { title: "Booking platform integration", text: "We integrate your booking system directly into the site for seamless reservations. Smooth booking functionality eliminates friction that reduces conversions." },
      { title: "Mobile and desktop optimization", text: "Most customers search on mobile first. We optimize for both mobile and desktop performance, ensuring fast load speeds, clean layout, and high usability across all devices." },
    ],
    sections: [
      { title: "Features and functionality included", paragraphs: ["Your website is built with performance and scalability in mind."], bullets: ["Strategic page layout built for lead generation", "Conversion-focused call-to-action placement", "SEO-ready structure", "Integrated booking functionality", "Optimized image compression for fast load speeds", "Structured navigation that improves user experience"] },
      { title: "Why design quality impacts conversion", paragraphs: ["Design quality directly impacts trust. Trust directly impacts bookings. Low-quality websites create doubt. Slow load times reduce conversions. Inconsistent branding weakens your marketing system.", "A professionally designed website improves conversion rates, time on site, booking completion rates and corporate inquiry submissions. In competitive markets, your website must reflect the premium experience inside your venue. Your design is not decoration. It’s a revenue-generating asset within your growth strategy."] },
    ],
    diagram: "website",
  },

  // ---- 02 Growth Marketing Systems -------------------------------------------------------------
  {
    slug: "/growth-marketing-systems/content-creation",
    parent: "/growth-marketing-systems",
    name: "Content Creation",
    h1: "High-impact content creation",
    standfirst: "Professional photos and videos designed to elevate your brand, increase engagement, and drive lead generation across your marketing system.",
    seoTitle: "Content Creation | Revolt",
    description: "Professional photography and video production for golf simulator venues: creative direction, shoot coordination and ad-ready delivery.",
    intro: [
      "Your visuals determine how customers perceive your venue before they ever step inside. High-quality photos and videos capture the energy, competition, and premium atmosphere of your space. Low-quality visuals reduce trust, lower engagement, and weaken your marketing funnel.",
      "For venues looking to scale, professional content is not optional. It is a growth asset that strengthens customer growth and improves overall customer acquisition.",
    ],
    breakdown: [
      { title: "Professional photography", text: "We coordinate professional photographers to capture high-impact images of your simulators, lounge areas, bar setup, private events, and overall atmosphere." },
      { title: "Professional video production", text: "Dynamic video content highlights gameplay, events, memberships, and corporate experiences. Video increases engagement across ads and social media." },
      { title: "Creative direction and shoot coordination", text: "We direct the creative process to ensure your visuals align with your brand positioning and growth strategy. Every shoot is designed to produce content that converts viewers into bookings." },
      { title: "Ad-ready content delivery", text: "All images and videos are optimized for paid ads, landing pages, social media, and website use." },
      { title: "Social media and website optimization", text: "We format content specifically for mobile-first platforms and fast-loading websites." },
    ],
    sections: [
      { title: "What makes high-impact visual content", paragraphs: ["High-converting visual content does more than look good. It builds trust and drives action."], bullets: ["Showcases the premium experience inside your venue", "Highlights real customers enjoying the space", "Communicates energy and atmosphere", "Supports clear calls to action", "Strengthens your customer growth strategy"] },
      { title: "Our content creation process", paragraphs: ["We begin by understanding your audience and positioning within your local and national market. Next, we plan a content strategy aligned with your marketing funnel and growth objectives.", "We coordinate professional photographers and videographers, direct the shoot, and ensure every asset aligns with your branding. Finally, we deliver optimized content ready for immediate deployment across ads, websites, landing pages, and social platforms."] },
      { title: "Why professional content drives growth", paragraphs: ["Visual quality directly impacts conversion rates. Premium content increases trust, supports higher pricing, and improves ad performance.", "Amateur visuals compete on price. Professional content competes on experience. If you want consistent lead generation and long-term customer growth, your visuals must match the premium experience you deliver inside your venue."] },
    ],
    diagram: "content",
  },
  {
    slug: "/growth-marketing-systems/social-media-management",
    parent: "/growth-marketing-systems",
    name: "Social Media Management",
    h1: "Social media management that drives bookings",
    standfirst: "Strategic, consistent social media designed to increase visibility, strengthen your marketing funnel, and drive long-term customer growth.",
    seoTitle: "Social Media Management | Revolt",
    description: "Social media management for golf simulator venues: content planning, creation, scheduling, captions and community engagement that drive bookings.",
    intro: [
      "Consistent visibility builds consistent bookings. Our Social Media Management service keeps your venue top-of-mind with strategic, engaging content that supports long-term customer growth without requiring daily effort from your internal team.",
      "When managed correctly, social media strengthens your marketing funnel, improves traffic generation, and supports scalable growth.",
    ],
    breakdown: [
      { title: "Content planning and strategy", text: "We create a structured content calendar aligned with your growth strategy. Every post is designed to support lead generation and strengthen brand positioning in your local market." },
      { title: "Content creation", text: "We develop high-quality graphics, captions, and promotional posts that highlight events, memberships, leagues, corporate bookings, and daily gameplay." },
      { title: "Posting and scheduling", text: "We manage consistent posting schedules to ensure your venue maintains strong visibility. Regular activity increases engagement." },
      { title: "Caption writing and calls to action", text: "Every caption is written with purpose. Clear calls to action guide followers toward bookings, event inquiries, and memberships." },
      { title: "Community engagement", text: "We monitor comments, messages, and interactions to maintain responsiveness and build trust." },
    ],
    sections: [
      { title: "What makes effective social media management", paragraphs: ["Effective social media management is not random posting. It requires strategy, consistency, and alignment with your overall marketing system."], bullets: ["Content aligned with your target audience", "Messaging that supports lead generation", "Consistent branding across all posts", "Clear booking-focused calls to action", "Performance tracking to support growth"] },
      { title: "Our management and optimization process", paragraphs: ["We begin by analyzing your market positioning and identifying opportunities within your marketing funnel. Next, we develop a structured content plan designed to support customer acquisition and measurable customer growth.", "We handle content creation, scheduling, publishing, and engagement so your team can focus on operations. Finally, we monitor performance metrics and refine strategy to strengthen your overall growth strategy."] },
      { title: "Why an ongoing social presence drives growth", paragraphs: ["Inconsistent posting leads to inconsistent bookings. Active, professional social media management improves brand trust, engagement rates, website traffic, event inquiries and overall lead generation.", "Your venue delivers the experience. We make sure people see it, remember it, and book it."] },
    ],
    diagram: "social-mgmt",
  },
  {
    slug: "/growth-marketing-systems/meta-ad-management",
    parent: "/growth-marketing-systems",
    name: "Meta Ad Management",
    h1: "Meta ad management that drives bookings",
    standfirst: "High-performance Facebook and Instagram campaigns designed to scale lead generation, increase bookings, and maximize ROI across your marketing system.",
    seoTitle: "Meta Ad Management | Revolt",
    description: "Facebook and Instagram ad management for golf simulator venues: campaign structure, audience targeting, creative testing, budget optimization and reporting.",
    intro: [
      "Paid traffic is one of the fastest ways to scale lead generation. Our Meta Ad Management service uses highly targeted Facebook and Instagram campaigns to drive immediate bookings and accelerate measurable customer growth.",
      "We implement a performance-driven growth strategy focused on scaling customer acquisition while maximizing return on ad spend.",
    ],
    breakdown: [
      { title: "Campaign setup and structure", text: "We build properly structured ad campaigns aligned with your marketing funnel. Each campaign is designed to support specific objectives such as bookings, corporate events, memberships, or promotions." },
      { title: "Advanced audience targeting", text: "We identify and target high-intent audiences including local golf enthusiasts, corporate planners, league players, and entertainment seekers." },
      { title: "Creative development and testing", text: "We develop and test multiple ad creatives including visuals, copy variations, and offers. Continuous testing improves long-term performance." },
      { title: "Budget optimization", text: "Every dollar is tracked, measured, and refined. We continuously optimize budgets based on performance data to maximize return." },
      { title: "Performance tracking and reporting", text: "We implement detailed tracking and analytics to monitor conversions, cost per booking, and campaign ROI." },
    ],
    sections: [
      { title: "What makes high-performing Meta ads", paragraphs: ["High-performing ads are not random boosts. They are strategically aligned with your marketing system and optimized for conversion."], bullets: ["Clear, compelling offers", "Strong visual creative", "Direct calls to action", "Precise audience segmentation", "Landing page alignment within your funnel"] },
      { title: "Our campaign optimization process", paragraphs: ["We begin by identifying your primary revenue drivers and aligning campaigns with your broader growth strategy. Next, we structure campaigns for clear objectives and integrate them into your landing pages and booking systems.", "We test creatives, refine targeting, and optimize performance weekly to improve cost efficiency and scale customer acquisition. Every adjustment is data-backed."] },
      { title: "Why paid ads accelerate venue growth", paragraphs: ["Organic marketing builds long-term presence. Paid ads drive immediate action. Meta advertising lets you reach thousands of local golf enthusiasts, promote events and memberships instantly, scale traffic generation, and increase direct bookings.", "Your venue delivers the experience. We deliver the targeted traffic that fills your bays."] },
    ],
    diagram: "meta",
  },
  {
    slug: "/growth-marketing-systems/google-ad-management",
    parent: "/growth-marketing-systems",
    name: "Google Ad Management",
    h1: "Google Ads that convert",
    standfirst: "High-intent Google Ads campaigns designed to dominate search results, drive immediate bookings, and scale lead generation across your marketing system.",
    seoTitle: "Google Ad Management | Revolt",
    description: "Google Ads management for golf simulator venues: search campaign setup, keyword research, bid strategy, ad copy and performance reporting.",
    intro: [
      "When someone searches for “indoor golf simulator near me,” they are ready to book. Our Google Ad Management service captures high-intent customers actively searching for simulator experiences in their area. This is one of the most powerful drivers of lead generation and a core pillar of your marketing system.",
      "Google Ads provides immediate visibility at the top of search results, accelerating customer acquisition and measurable customer growth.",
    ],
    breakdown: [
      { title: "Search campaign setup", text: "We build properly structured ad campaigns aligned with your marketing funnel. Each campaign supports specific objectives such as bookings, corporate events, memberships, or promotions." },
      { title: "Keyword research and targeting", text: "We conduct in-depth keyword research to identify high-converting search terms in your local market. Precision targeting improves overall ROI." },
      { title: "Bid strategy optimization", text: "We implement strategic bidding models designed to maximize visibility while controlling costs." },
      { title: "Ad copy development", text: "Compelling, conversion-focused ad copy ensures your venue stands out in competitive search results and increases click-through rates." },
      { title: "Performance tracking and reporting", text: "We implement detailed tracking and analytics to monitor conversions, cost per booking, and campaign ROI." },
    ],
    sections: [
      { title: "What makes high-intent Google Ads convert", paragraphs: ["Google Ads works because it captures demand that already exists. Unlike social media ads, search campaigns target users actively looking for a simulator experience."], bullets: ["Higher conversion rates", "Lower cost per booking", "Faster customer acquisition", "Stronger lead generation"] },
      { title: "Our campaign management and optimization process", paragraphs: ["We begin by identifying your highest revenue services and aligning campaigns accordingly. Next, we build tightly structured ad groups targeting location-specific keywords and connect ads to optimized landing pages.", "Campaigns are monitored daily, with ongoing keyword refinement, bid adjustments, and ad testing to improve efficiency and maximize ROI. Every decision is backed by performance data."] },
      { title: "Why Google Ads drives immediate bookings", paragraphs: ["When someone searches for indoor golf in their area, they are ready to take action. Google Ads lets your venue appear at the top of search results, capture high-intent local traffic, and drive direct bookings and calls.", "Your competitors wait for traffic. You capture it at the top of the search results."] },
    ],
    diagram: "google",
  },
  {
    slug: "/growth-marketing-systems/seo-ranking",
    parent: "/growth-marketing-systems",
    name: "SEO Ranking",
    h1: "SEO for golf venues",
    standfirst: "We help your golf venue rank higher on Google to drive consistent traffic, bookings, and long-term growth.",
    seoTitle: "SEO Ranking | Revolt",
    description: "SEO for golf simulator venues: technical optimization, keyword strategy, local citations, on-page optimization and growth tracking to rank for “golf simulator near me”.",
    intro: [
      "Owning the top organic positions in Google search results is one of the most powerful long-term drivers of lead generation. When customers search for “golf simulator near me” or similar terms, your venue needs to appear at the top.",
      "Unlike paid ads that stop when budgets pause, SEO creates compounding growth that continues delivering bookings month after month.",
    ],
    breakdown: [
      { title: "Technical website optimization", text: "We optimize your website structure, speed, and technical SEO elements to ensure search engines can properly crawl and rank your site." },
      { title: "Keyword strategy and content development", text: "We research and target high-intent search queries such as local golf simulator searches, entertainment venues, and corporate golf experiences." },
      { title: "Local SEO and citation building", text: "Local citations and directory listings help Google trust your business location and authority, improving your ability to dominate map results." },
      { title: "On-page optimization", text: "We optimize page titles, headings, internal links, and content structure across your website to improve keyword relevance and search visibility." },
      { title: "Performance monitoring and growth tracking", text: "SEO performance is continuously tracked and optimized to improve rankings, traffic, and conversions." },
    ],
    sections: [
      { title: "What makes SEO a long-term growth channel", paragraphs: ["SEO is not about quick wins. It is about building sustainable visibility that strengthens your entire marketing funnel."], bullets: ["Higher search visibility", "Consistent traffic generation", "Lower long-term customer acquisition costs", "Scalable lead generation", "Compounding customer growth"] },
      { title: "Our SEO strategy and optimization process", paragraphs: ["We begin with a full analysis of your website, competitors, and current search visibility. Next, we implement a structured SEO roadmap: technical improvements, keyword targeting, local citation building, and content optimization.", "As rankings improve, we expand keyword coverage and refine content strategy. Our goal is simple: consistent customer acquisition through organic search."] },
      { title: "Why SEO delivers sustainable growth", paragraphs: ["Paid ads generate immediate traffic, but SEO builds lasting visibility. When your venue ranks at the top of organic search results, you attract customers who are already searching for your services.", "Your venue provides the experience. SEO ensures customers find you first."] },
    ],
    diagram: "seo",
  },

  // ---- 03 Marketing Automation Systems ----------------------------------------------------------
  {
    slug: "/marketing-automation-systems/email-text-automations",
    parent: "/marketing-automation-systems",
    name: "Email & Text Automations",
    h1: "Email and SMS automation",
    standfirst: "Automate emails and texts to nurture customers, increase repeat bookings, and drive consistent revenue growth.",
    seoTitle: "Email & Text Automations | Revolt",
    description: "Email and SMS automation for golf simulator venues: welcome sequences, promotional campaigns, re-engagement, segmentation and performance tracking.",
    intro: [
      "Staying connected with customers after their first visit is essential for long-term customer growth. Email and SMS automation allow golf venues to nurture relationships, promote offers, and bring players back without requiring constant manual effort.",
      "Our automated campaigns deliver the right message at the right time, turning your contact database into a marketing system that consistently drives traffic and strengthens lead generation.",
    ],
    breakdown: [
      { title: "Automated welcome sequences", text: "First impressions matter. We create automated welcome email and SMS sequences that introduce new visitors to your venue, highlight services, and encourage their next booking." },
      { title: "Promotional campaign automation", text: "Special promotions, seasonal offers, and event announcements run automatically through scheduled email and text campaigns." },
      { title: "Customer re-engagement campaigns", text: "Not every customer returns immediately. Automated re-engagement campaigns bring past visitors back with targeted reminders and exclusive offers." },
      { title: "Segmentation and audience targeting", text: "We segment your customer database based on visit history, behavior, and engagement levels for personalized messaging that improves conversion rates." },
      { title: "Performance tracking and optimization", text: "Every campaign is monitored for open rates, click rates, and booking conversions. Continuous optimization ensures measurable results." },
    ],
    sections: [
      { title: "What makes automated messaging effective", paragraphs: ["Successful automation is not about sending random messages. It is about building a structured system that supports your marketing funnel."], bullets: ["Increase repeat bookings", "Improve customer acquisition through referrals", "Strengthen long-term customer relationships", "Boost lead generation", "Create consistent traffic generation"] },
      { title: "Our automation strategy and implementation process", paragraphs: ["We begin by analyzing your existing customer database and identifying opportunities for automated engagement. Next, we design a sequence of automated messages including welcome flows, promotional campaigns, and re-engagement triggers. These systems integrate directly with your booking platform.", "Once active, we continuously optimize messaging, timing, and segmentation to improve conversions."] },
      { title: "Why automation increases venue revenue", paragraphs: ["Automation ensures that no customer relationship is wasted. Instead of relying on manual follow-ups, automated systems consistently nurture customers and guide them back into your funnel: predictable repeat bookings, stronger customer automation and consistent traffic generation.", "Your venue delivers the experience. Automation ensures customers keep coming back."] },
    ],
    diagram: "email",
  },
  {
    slug: "/marketing-automation-systems/re-booking-campaigns",
    parent: "/marketing-automation-systems",
    name: "Re-Booking Campaigns",
    h1: "Re-booking campaigns",
    standfirst: "Turn one-time visitors into repeat customers with automated follow-ups that drive consistent bookings and long-term revenue.",
    seoTitle: "Re-Booking Campaigns | Revolt",
    description: "Automated re-booking campaigns for golf simulator venues: follow-up reminders, personalized return offers, visit-based segmentation and retention tracking.",
    intro: [
      "Turn one-time visitors into loyal repeat customers with automated follow-up campaigns designed to bring players back to your venue. We create personalized re-booking sequences that send timely reminders, exclusive offers, and targeted promotions based on each customer’s visit history and engagement behavior.",
      "By automating the follow-up process, your venue maintains consistent traffic while your team focuses on delivering a premium in-venue experience.",
    ],
    breakdown: [
      { title: "Automated follow-up booking reminders" },
      { title: "Personalized customer return offers" },
      { title: "Visit-based customer segmentation" },
      { title: "Email and SMS re-booking campaigns" },
      { title: "Customer retention performance tracking" },
    ],
    sections: [
      { title: "Our re-booking strategy for golf venues", paragraphs: ["We design automated re-booking systems that trigger based on customer activity, ensuring every visitor receives the right message at the right time. Whether it’s a reminder to book their next session or a limited-time promotion, our campaigns are structured to bring customers back regularly and keep your simulator bays filled."] },
      { title: "How automated follow-ups increase repeat visits", paragraphs: ["Most customers are willing to return but simply forget to book again. Automated follow-ups solve this problem by sending reminders, exclusive offers, and personalized invitations after each visit. This consistent engagement increases repeat bookings and strengthens long-term customer relationships."] },
      { title: "Why customer retention drives long-term growth", paragraphs: ["Acquiring a new customer costs significantly more than retaining an existing one. Re-booking campaigns help maximize the value of every visitor by encouraging repeat play, building loyalty, and creating a predictable revenue stream for your venue. Over time, this retention strategy becomes one of the most powerful growth drivers for golf simulator businesses."] },
    ],
    diagram: "rebook",
  },
  {
    slug: "/marketing-automation-systems/auto-review-requests",
    parent: "/marketing-automation-systems",
    name: "Auto Review Requests",
    h1: "Auto review requests",
    standfirst: "Automatically generate more 5-star reviews to build trust, improve local SEO, and drive more bookings.",
    seoTitle: "Auto Review Requests | Revolt",
    description: "Automated Google review requests for golf simulator venues: email and SMS reminders, timing optimization, review funnel automation and reputation monitoring.",
    intro: [
      "Build a powerful five-star reputation automatically by requesting reviews from satisfied customers at the perfect moment — right after they’ve enjoyed a great experience at your venue. Our automation sends review requests through email and SMS following positive visits, without requiring awkward in-person requests from your staff.",
      "More positive reviews increase trust with potential customers, strengthen your online presence in search results, and improve local SEO visibility.",
    ],
    breakdown: [
      { title: "Automated Google review requests" },
      { title: "Email and SMS review reminders" },
      { title: "Timing optimization after customer visits" },
      { title: "Review funnel automation system" },
      { title: "Reputation monitoring and tracking" },
    ],
    sections: [
      { title: "How automated review requests work", paragraphs: ["Our system automatically sends review requests shortly after a customer finishes their visit. By timing the request when the experience is still fresh, customers are far more likely to leave positive feedback. This automated process removes the need for manual follow-ups while steadily increasing your review count."] },
      { title: "How reviews improve local search visibility", paragraphs: ["Google reviews are a major factor in local search rankings. A higher number of positive reviews helps your venue appear more prominently when customers search for golf simulators nearby. This increased visibility drives more discovery, more bookings, and stronger organic growth."] },
      { title: "Why reviews are essential for golf venue growth", paragraphs: ["Before booking a simulator session, most customers check online reviews to see what others say about the experience. A strong five-star reputation builds immediate trust and influences booking decisions. By consistently generating positive reviews, your venue becomes the preferred choice for new players in your market."] },
    ],
    diagram: "review",
  },

  // ---- 04 Event Marketing Strategy --------------------------------------------------------------
  {
    slug: "/event-marketing-strategy/corporate-event-planning",
    parent: "/event-marketing-strategy",
    name: "Corporate Event Planning",
    h1: "Corporate events",
    standfirst: "Generate high-value bookings with corporate events that drive consistent revenue and fill multiple bays.",
    seoTitle: "Corporate Event Planning | Revolt",
    description: "Corporate event marketing for golf simulator venues: event packages, local business outreach, booking funnels, promotion campaigns and follow-up automation.",
    intro: [
      "Turn empty bays into premium revenue streams through corporate events. Our strategies help golf venues maximize bookings, increase revenue, and fill bays consistently.",
    ],
    breakdown: [
      { title: "Corporate event package creation" },
      { title: "Local business outreach strategy" },
      { title: "Corporate booking funnel setup" },
      { title: "Event promotion campaigns" },
      { title: "Automation for follow-ups and bookings" },
    ],
    sections: [
      { title: "What makes corporate events high-revenue for golf venues", paragraphs: ["Corporate events are one of the highest-margin opportunities for golf simulator venues. Unlike individual bookings, a single corporate event can fill multiple bays for several hours while generating premium revenue.", "With the right strategy, these events become a consistent source of traffic and strengthen your overall marketing system. Businesses are constantly looking for unique team-building and client entertainment experiences, and golf simulators provide the perfect environment."] },
      { title: "Our corporate event marketing strategy", paragraphs: ["We design a complete system to attract, convert, and book corporate clients. This includes targeted outreach to local businesses, optimized event packages, and a structured funnel built specifically for corporate bookings.", "Our approach focuses on lead generation through paid ads, landing pages, and automation systems. Every step is designed to increase customer acquisition from high-value clients."] },
      { title: "How corporate events drive consistent revenue growth", paragraphs: ["Corporate events create predictable, repeatable revenue streams. Once a business books with you, they are more likely to return for future team events, client meetings, and seasonal gatherings.", "By combining event promotion with marketing automation, we help venues maintain consistent bookings without relying only on walk-ins, positioning your venue as the go-to corporate entertainment destination in your market."] },
    ],
    diagram: "corporate",
  },
  {
    slug: "/event-marketing-strategy/community-event-planning",
    parent: "/event-marketing-strategy",
    name: "Community Event Planning",
    h1: "Community events",
    standfirst: "Drive repeat bookings and loyalty with community events that build engagement and recurring revenue.",
    seoTitle: "Community Event Planning | Revolt",
    description: "Community event marketing for golf simulator venues: tournaments, leagues, themed events, local promotion, booking funnels and reminder automation.",
    intro: [
      "Build loyalty and buzz with tournaments, leagues, and themed events that turn casual players into your biggest advocates and repeat customers. We plan, promote, and help execute events that fill your venue during traditionally slow periods, creating recurring revenue streams, organic word-of-mouth, and a competitive moat that competitors struggle to replicate.",
    ],
    breakdown: [
      { title: "Tournament and league planning" },
      { title: "Themed event creation" },
      { title: "Local promotion strategy" },
      { title: "Event booking funnel setup" },
      { title: "Automation for reminders and follow-ups" },
    ],
    sections: [
      { title: "What makes community events drive repeat customers", paragraphs: ["Community events create connection, not just bookings. Players who join leagues or tournaments are far more likely to return regularly, bringing friends and building long-term engagement with your venue.", "Over time, this builds a strong local community that continuously supports your traffic without relying only on paid marketing."] },
      { title: "Our community event marketing strategy", paragraphs: ["We create structured event systems designed to attract, engage, and retain players. From weekly leagues to themed tournaments, every event is aligned with your growth strategy and supported by a complete marketing funnel.", "Using marketing automation, we promote events through email, SMS, and social campaigns while managing registrations and reminders automatically."] },
      { title: "How community events build long-term revenue", paragraphs: ["Unlike one-time promotions, community events create recurring revenue. Players commit to leagues, return for tournaments, and become regular customers who book consistently.", "With the right automation in place, your venue can maintain steady bookings even during off-peak times — a sustainable growth model that competitors cannot easily replicate."] },
    ],
    diagram: "community",
  },
  {
    slug: "/event-marketing-strategy/membership-vip-programs",
    parent: "/event-marketing-strategy",
    name: "Membership / VIP Programs",
    h1: "Membership and VIP programs",
    standfirst: "Create recurring revenue with membership programs that increase retention, bookings, and customer lifetime value.",
    seoTitle: "Membership / VIP Programs | Revolt",
    description: "Membership and VIP program design for golf simulator venues: tier structure, pricing strategy, perks, sign-up funnels and renewal automation.",
    intro: [
      "Create predictable monthly recurring revenue with exclusive membership and VIP programs that reward your best customers with perks and priority access. We design tiered programs, pricing structures, member benefits, and launch campaigns that drive sign-ups. Recurring revenue improves cash flow and increases lifetime value.",
    ],
    breakdown: [
      { title: "Membership tier structure design" },
      { title: "Pricing and offer strategy" },
      { title: "VIP perks and benefit planning" },
      { title: "Sign-up funnel development" },
      { title: "Automation for renewals and engagement" },
    ],
    sections: [
      { title: "What makes membership programs high-value", paragraphs: ["Membership programs turn occasional players into committed customers. Instead of relying on one-time bookings, you build a base of recurring revenue that supports long-term customer growth.", "Members visit more often, spend more per visit, and are more likely to bring guests. This creates consistent traffic throughout the month."] },
      { title: "Our membership growth strategy", paragraphs: ["We design membership systems aligned with your growth strategy, including tiered plans, exclusive benefits, and pricing models that maximize conversions.", "Using email marketing automation and booking automation, we create onboarding sequences, renewal reminders, and engagement campaigns that keep members active."] },
      { title: "How VIP programs increase lifetime value", paragraphs: ["VIP programs increase customer retention and maximize lifetime value. When customers feel part of an exclusive experience, they are more likely to stay engaged and continue booking.", "With automated communication and personalized offers, your venue maintains strong relationships with top customers while ensuring consistent revenue."] },
    ],
    diagram: "membership",
  },
];

export const systemBySlug = (slug: string) => systems.find((s) => s.slug === slug);
export const subServiceBySlug = (slug: string) => subServices.find((s) => s.slug === slug);
/** Sub-services in the order the system page lists them (the live site's order). */
export const childrenOf = (systemSlug: string) => {
  const order = systemBySlug(systemSlug)?.children.map((c) => c.slug) ?? [];
  return subServices.filter((s) => s.parent === systemSlug).sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
};
