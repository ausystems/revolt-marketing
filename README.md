# Revolt Marketing — website

A complete rebuild of [revolt-marketing.com](https://www.revolt-marketing.com): the only marketing firm built exclusively for
golf simulator entertainment venues across North America. Every word and every SEO tag on the site is the live Wix
site's, verbatim (the homepage display title is the one exception); the design, motion and real-time scenes are new.
See `DESIGN.md` for the design bible.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

Append `?nomotion` to any URL to review a layout with animation disabled (the same path `prefers-reduced-motion` takes).

## Stack

Next.js 16 (App Router, static generation) · TypeScript · Tailwind CSS v4 (tokens in `app/globals.css`) · GSAP 3.15 with
ScrollTrigger and SplitText · Lenis (inertial scroll on pointer devices only) · Three.js (vanilla, code-split, render on
demand) · `next/font` Inter + Geist Mono · `next/image` (AVIF/WebP).

## The site

102 static pages, every legitimate URL from the live site accounted for:

| Route | What it is |
| --- | --- |
| `/` | Home: the simulator-bay hero (Three.js, scroll takes the shot), who we are, the Four Step Process, why golf simulator venues choose Revolt (the 3D tee box), why digital marketing matters, the free strategy call |
| `/services` | The four systems as spreads, then why venues choose Revolt |
| `/branding-and-design-strategy`, `/growth-marketing-systems`, `/marketing-automation-systems`, `/event-marketing-strategy` | System pages: scene, each service as a chapter with its own drawing |
| 16 service pages (e.g. `/growth-marketing-systems/seo-ranking`, `/google-business-profile-optimization`) | Drawing and the live page's text, chapter by chapter |
| `/about-us` | Meet our team, why Revolt, our approach |
| `/contact-us` | Get in touch: the Free Strategy Call form |
| `/blog`, `/post/[slug]` (50) | All Posts and every article, with Recent Posts |
| 20 city pages (e.g. `/seo-services-mississauga`, `/web-design-markham`) | The local SEO and web design pages (the SEO ones with their FAQ) |
| `/privacypolicy` | The policy, verbatim |
| 28 duplicate city-keyword pages + 3 Wix draft copies | 301 redirects to their canonical page (`next.config.ts`) |
| `/sitemap.xml`, `/robots.txt` | Generated |

The booking form is the live GoHighLevel / LeadConnector form (`components/ui/LeadForm.tsx`), unchanged.

## Updating the copy

The copy and SEO are generated from the live site, never typed:

```bash
node scripts/scrape-live.mjs /tmp/revolt-live     # download every page in the live sitemaps
node scripts/live-copy.mjs /tmp/revolt-live       # → content/live/*.json and content/posts.json
```

## Structure

```
app/                     routes, layout (fonts), globals.css (tokens, type scale, layout, motion helpers)
content/                 live.ts + live/*.json (every word, nav, footer, SEO and sitemap dates, generated), posts.json
                         (generated), services.ts (routes, scenes and drawings), site.ts (URL, the form)
components/motion/       SmoothScroll (Lenis), Curtain (preloader + chapter-turn page transitions), useReveals,
                         useSectionTheme (nav inversion)
components/scenes/       BayScene (hero: bay, turf, screen + HUD), course.ts (the hole on the screen),
                         CourseBake (renders public/media/hero/course-*.webp), EcosystemScene (four tracers, one venue)
components/sections/     Nav, Footer, Hero, WhoWeAre, FourStepProcess, Ecosystem (why venues choose Revolt), DigitalMatters,
                         StrategyCall, PageHero
components/pages/        the internal page compositions (RichPageView sets the service, city and policy pages)
components/ui/           Button (magnetic, arc arrow), TracerMark, Diagram (sixteen drawings), Accordion, LeadForm, Rich, JsonLd
lib/                     seo.ts (metadata and JSON-LD per route), dates.ts (blog dates as the live blog prints them), motion.ts
scripts/                 scrape-live.mjs + live-copy.mjs (the copy and SEO, from the live site), media.mjs (asset pipeline)
public/media/            the brand's assets: wordmark, the venue bay, the golfer, the founders, rendered service stills,
                         the hero's simulator picture (hero/),
                         blog covers, city imagery, OG image
```

## Principles that shaped it

- One concept, the tracer: the ball's flight drawn in Revolt green. It lives in the hero, the chapter marks, the
  ecosystem, the journey, the buttons, the curtain and the footer — and nowhere else.
- Typography carries the composition; each chapter has one idea and its own composition.
- Motion is choreographed, never templated: masked line reveals, one pinned hero, scroll-scrubbed scenes that render
  only when something changes, a chapter-turn between pages. `prefers-reduced-motion` gets a fully static site.
- Nothing invented: the words are the live site's, and no clients, testimonials, results or numbers it does not state.
- Accessible by default: one `h1`, labelled landmarks, keyboard-operable menus and accordions, visible focus, 44px
  targets, alt text, a skip link.
