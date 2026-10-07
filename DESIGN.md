# Revolt Marketing — design bible and build guide

Revolt Marketing (revolt-marketing.com) is a marketing firm built exclusively for golf simulator entertainment
venues across North America. Two founders, Shayne Mueller and Tristan Costa, in Toronto. Four connected systems:
Branding & Design Strategy, Growth Marketing Systems, Marketing Automation Systems, Event Marketing Strategy. One
call to action everywhere: **Free Strategy Call**, which is the GoHighLevel / LeadConnector form
`2he5XlH5aqNZcaL5EPTk`. Nothing on the site is invented: every fact, service, name, number, address and link comes
from the live site (see `content/`).

This site is a Next.js 16 App Router build: TypeScript, Tailwind v4 (tokens in `app/globals.css`), GSAP 3.15 with
ScrollTrigger and SplitText, Lenis, Three.js (vanilla, code-split), `next/font` Inter + Geist Mono.
`npm run dev` on port 3000. Append `?nomotion` to any URL to review a layout with animation disabled.

## The concept: every shot is traced

Inside a simulator bay, the moment a ball leaves the mat the system draws its flight: one luminous line from the tee
to the target. Nothing is guessed. That is what Revolt does for a venue's marketing: every click, booking and dollar
is traced. The visual signature of the site is **the tracer** — a single glowing line of Revolt green on the ink of
a dark bay. It is the only saturated colour on the page.

Where the tracer lives (and only here; it must never become a gimmick):

1. **The hero.** A Three.js simulator bay at night, built to read as a real one: quilted acoustic walls, a green
   LED frame around the enclosure, shell-rendered turf (fibres with height, nap and self-shadowing) and a two-tone
   hitting mat with a launch monitor beside it. The screen is a projector picture of a real-looking hole (a baked
   course render) under a still simulator HUD set in the site's typeface, and it lights the bay. As the visitor
   scrolls, the ball launches and the tracer (a white-hot core in a green glow) arcs through the air while the
   camera rises gently; the ball meets the screen and the light blooms where it strikes. The story ends there:
   nothing on the screen moves, and there are no numbers or lines on it beyond the tracer's own glow.
2. **The chapter mark.** Every section opens with a small hairline tracer arc (`<TracerMark />`) instead of an
   eyebrow label. It is Revolt's seal, the way TruLinq has its stamp.
3. **The ecosystem.** Four tracers, one from each system, converging on one venue. Three.js, scroll-scrubbed.
4. **The journey.** Discover, Book, Visit, Return, Refer: one tracer with five stops.
5. **Buttons.** The primary button's arrow lifts along a shallow arc on hover and lands.
6. **The curtain and the footer.** A tracer draws under the wordmark on first load; the wordmark runs off the page
   at the foot of every page with the tracer beneath it.

## The visual world

* **Ink and paper.** The page ground is Revolt's own near-black `--ink #0A0A0A`. Chapters declare `data-theme`
  (`ink` | `paper` | `field`) and the nav reads it. Paper chapters are pure white with a faint warm-neutral field
  (`--paper-2 #F4F5F2`) for quiet areas. `field` is the deep green ground used once per page at most, for the
  strategy-call chapter. Never a random gradient; never glassmorphism; never neon.
* **Green.** `--green #2BB61E` is the live site's exact green and the only hot colour: the tracer, the primary
  button, one phrase per headline at most, index numerals, focus rings. `--green-soft #8DE882` is green text on
  ink. `--green-deep #0F4A0B` and `--field #071A06` are the deep grounds. Never invent colours.
* **Panels.** Stages (the 3D scene, the form, portraits, the ecosystem) sit in large rounded panels
  (`--r-panel: clamp(20px, 2.2vw, 32px)`) on the chapter ground. Cards use `--r-card 20px`. Buttons are pills.
* **Type.** One family for display and text: Inter (variable, optical sizing on). Display is 600 weight, tight
  tracking (`-0.045em` at XL down to `-0.02em` at S), `text-wrap: balance`. Data, index numerals, dates, labels:
  Geist Mono (`.t-mono`). Sentence case everywhere: no tracked uppercase labels, ever. Scale:
  `t-display-xl` (hero, clamp 3.25–10rem) · `t-display-l` (chapter titles) · `t-display-m` (entries) ·
  `t-display-s` (card titles) · `t-standfirst` · `t-body` (17px / 1.55) · `t-small` · `t-micro`.
  Every headline is composed: line breaks are art-directed with `<span class="mask-line">` per line on desktop and
  allowed to reflow on mobile via `<br class="hidden lg:block">`-free copy (write lines short enough to hold).
* **No eyebrows, no decorative dots, no icon cards.** A chapter opens with its tracer mark and its title. The one
  exception is the internal page hero, which may carry a single mono caption beside the tracer mark (the system's
  numeral and name, or the date of an article); chapters never do. The only other small caption is `.note` — a green
  mono caption next to real UI, at most two per page. No circled icons, no
  three-identical-card grids, no stock illustrations. The live site's flat green illustrations are retired; its real
  photographs (the bay, the golfer, the founders) and its branded blog covers are kept and graded.
* **Imagery.** Real assets only, in `public/media`. `hero-bay.jpg` (the venue bay), `golfer.jpg` (the swing),
  `founder-shayne.jpg`, `founder-tristan.jpg`, service scenes `services/*.jpg` (stills rendered from the site’s own real-time scenes,
  plus the venue photograph), blog covers, and the hero's simulator picture `hero/course-*.webp` (rendered by
  `components/scenes/CourseBake.ts` from the course defined in `components/scenes/course.ts`). The live site’s AI-generated service images were retired. Every image is `next/image` with sizes, alt text,
  and a `media-cover` frame. Crops are art-directed per breakpoint.

## Components (`components/ui`)

* `Button` — `variant="primary" | "secondary" | "paper" | "ink"`, `size="sm" | "md" | "lg"`, optional arrow. Magnetic
  on pointer devices (strength .25, never more). 44px minimum target. Primary is the green pill with ink text (7.4:1);
  green as text on paper uses `--green-text #1F8F16` (4.2:1), on ink `--green-soft`.
* `TextLink` — underline that leaves to the right on hover (`.link`) or arrives (`.link-quiet`).
* `TracerMark` — the chapter seal. `<TracerMark />` inline SVG, 56×20, draws on reveal.
* `Panel` — rounded stage with `tone="ink" | "paper" | "field"`.
* `Ledger` — hairline rows `label · leader · value`, mono values, for facts and breakdowns.
* `Index` — the numbered editorial list (01–04) used for services and process steps.
* `Accordion` — for FAQs (city pages), animated height, `aria-expanded`.
* `Form` — the LeadConnector embed in a panel with a designed surround: heading, what happens next, contact ledger.
  It must remain the real `api.leadconnectorhq.com/widget/form/2he5XlH5aqNZcaL5EPTk` iframe plus
  `link.msgsndr.com/js/form_embed.js`. Never a fake success state.
* `Media` — `next/image` in a `media-cover` frame with a reveal mask.

## Motion rules

* Easing vocabulary (`lib/motion.ts`): entrances `expo.out` 1.1–1.4s; wipes and curtains `expo.inOut`; the tracer
  draw `power2.inOut`; nothing elastic except the ball's landing settle. Stagger .06–.09 per line, cascades capped
  near .8s. Scrubbed sequences: `scrub: .8`, `anticipatePin: 1`, `invalidateOnRefresh: true`. At most one pinned
  section per page besides the hero.
* Reveals: `data-split` (SplitText masked lines), `data-reveal` (`up | fade | scale`, `data-delay`),
  `data-reveal-group` (stagger children), `data-counter`, `data-parallax`, `data-tracer` (draws a `<TracerMark>`).
  All handled by `useReveals()` from `components/motion`. Only transform and opacity are animated.
* Nav: fixed, transparent at the top, frosted once scrolled, inverts over paper chapters, hides after 90px of
  deliberate downward travel past 200px and returns after 40px upward. Never hides while the menu is open, during a
  page transition, or during a programmatic scroll.
* Curtain: first visit in a session shows the wordmark and a tracer drawing beneath it, then the curtain lifts with
  rounded bottom corners. Internal links run the chapter turn: the page recedes (scale .985, opacity .55), the ink
  panel rises with the destination's name rising through a mask, the browser navigates, the new page's nav paints
  the same label before first frame, the panel lifts as the hero animates in. `data-no-transition` opts out.
* Reduced motion (`prefers-reduced-motion` or `?nomotion`): no Lenis, no pinning, no curtain, no split reveals; the
  3D scenes render a single settled frame (tracer fully drawn). Everything must read perfectly static.
* Touch: native scroll, no magnetic buttons, no hover-only affordances, the horizontal strips become snap scrollers.
* Three.js: lazy `import('three')` when the scene mounts; `RoomEnvironment` for IBL; ACES tone mapping; DPR capped at
  2 (1.5 on touch); render on demand (scroll progress, resize, pointer) — never a free-running loop when idle;
  dispose everything on unmount; handle `webglcontextlost`; poster fallback when WebGL is unavailable.

## Page skeleton

```tsx
<main id="main">
  <PageHero theme="ink" ... />            // one h1, one standfirst, one tracer mark
  <section data-theme="paper" ...>        // chapters declare their theme
</main>
```

Every page needs one choreographed hero moment and at least one page-specific interaction that means something.
Do not use the same fade-up everywhere. Every page carries the strategy-call chapter before the footer.

## Copy voice

Direct, specific, sentence case. Keep Revolt's substance and vocabulary (bays, walk-ins, weekdays, corporate events,
re-bookings, "the only marketing firm built exclusively for golf simulator venues", "100+ venues researched").
Never invent results, clients, testimonials or numbers. The live site's `#1` claim stays in the SEO title only.
Straight quotes become typographic ones. No lorem ipsum.

## Quality bar

Every page is judged as a piece of graphic design in isolation: deliberate type sizes and line breaks, generous
chapter padding (`--sect-y`), asymmetric compositions, no default form styling, refined hover and focus states,
real content, working controls. Check at 1440 and 390. No console errors. No horizontal overflow. Every link goes
somewhere real. Every existing URL resolves or redirects (`next.config.ts`).
