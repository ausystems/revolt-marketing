# Revolt Marketing — website

A complete rebuild of [revolt-marketing.com](https://www.revolt-marketing.com): the only marketing firm built exclusively for
golf simulator entertainment venues across North America. Every fact, service, name, number and link on the site comes
from the live Wix site; the design, motion and real-time scenes are new. See `DESIGN.md` for the design bible.

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
| `/` | Home: the simulator-bay hero (Three.js, scroll takes the shot), who we are, the four systems, the ecosystem scene, why Revolt, the customer journey, the strategy call |
| `/services` | The four systems as spreads |
| `/branding-and-design-strategy`, `/growth-marketing-systems`, `/marketing-automation-systems`, `/event-marketing-strategy` | System pages: scene, each sub-service as a chapter with its own drawing |
| 16 sub-service pages (e.g. `/growth-marketing-systems/seo-ranking`, `/google-business-profile-optimization`) | Drawing, introduction, what's included, editorial sections, the rest of the system |
| `/about-us` | The founders, why Revolt specialized, the approach |
| `/contact-us` | The Free Strategy Call form and every way to reach Revolt |
| `/blog`, `/post/[slug]` (50) | The archive and every article |
| 20 city pages (e.g. `/seo-services-mississauga`, `/web-design-markham`) | The local SEO and web design pages, with FAQ |
| `/privacypolicy` | The policy, verbatim, with a contents column |
| 28 duplicate city-keyword pages + 3 Wix draft copies | 301 redirects to their canonical page (`next.config.ts`) |
| `/sitemap.xml`, `/robots.txt` | Generated |

The booking form is the live GoHighLevel / LeadConnector form (`components/ui/LeadForm.tsx`), unchanged.

## Structure

```
app/                     routes, layout (fonts, metadata, JSON-LD), globals.css (tokens, type scale, layout, motion helpers)
content/                 site.ts (facts, links, founders), services.ts (four systems, sixteen sub-services), posts.json,
                         cities.json, privacy.json
components/motion/       SmoothScroll (Lenis), Curtain (preloader + chapter-turn page transitions), useReveals,
                         useSectionTheme (nav inversion)
components/scenes/       BayScene (hero: bay, turf, screen + HUD), course.ts (the hole on the screen),
                         CourseBake (renders public/media/hero/course-*.webp), EcosystemScene (four tracers, one venue)
components/sections/     Nav, Footer, Hero, WhoWeAre, Systems, Ecosystem, WhyRevolt, Journey, StrategyCall, PageHero
components/pages/        the internal page compositions
components/ui/           Button (magnetic, arc arrow), TracerMark, Diagram (sixteen drawings), Accordion, LeadForm, Media
scripts/                 media.mjs (asset pipeline from the live site's originals), content.mjs (blog, cities, privacy)
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
- Nothing invented: no clients, testimonials, results or numbers the live site does not state.
- Accessible by default: one `h1`, labelled landmarks, keyboard-operable menus and accordions, visible focus, 44px
  targets, alt text, a skip link.
