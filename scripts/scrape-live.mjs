// Scrapes the live revolt-marketing.com into <dir>: its sitemaps, every page's HTML, and a JSON digest per page
// (the SEO head, then the content in document order) that scripts/live-copy.mjs pours into the site.
//
//   node scripts/scrape-live.mjs <dir>     # pages already in <dir>/html are reused; delete them to refetch
//   node scripts/live-copy.mjs <dir>       # → content/live/*.json, content/posts.json
//
// What the live site only renders in the browser is carried here as it was captured from it: the answers of the Wix
// FAQ widget and the blog feed's excerpts where they are not simply the opening of the post. The list of pages this
// site redirects instead of serving (see next.config.ts) is carried here too.
import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

const ROOT = process.argv[2];
if (!ROOT) { console.error("usage: node scripts/scrape-live.mjs <dir>"); process.exit(1); }
const SITE = "https://www.revolt-marketing.com";
const HTML = path.join(ROOT, "html"), JSON_DIR = path.join(ROOT, "json");
fs.mkdirSync(HTML, { recursive: true });
fs.mkdirSync(JSON_DIR, { recursive: true });
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

/** The Wix FAQ widget's questions and answers, as the live pages render them (the same five wherever it appears). */
const FAQ = [
  { q: "What are the benefits of SEO for my business?", a: "SEO helps increase your website’s visibility on search engines, attract more qualified visitors, and build trust with potential customers. By optimizing your site’s content, structure, and keywords, SEO can improve rankings, drive targeted traffic, and boost overall sales and brand awareness." },
  { q: "How long does it take to see SEO results?", a: "SEO is a long-term strategy. Most businesses start seeing noticeable improvements within 3 to 6 months, depending on competition, website health, and keyword difficulty. Consistency in optimization and content creation is key to achieving sustainable growth." },
  { q: "What is included in professional SEO services?", a: "Professional SEO services typically include keyword research, on-page optimization, technical SEO audits, link building, local SEO strategies, and content creation. Together, these efforts help improve your website’s visibility and attract the right audience." },
  { q: "Can SEO help small businesses compete with larger companies?", a: "Yes. SEO can level the playing field by targeting niche keywords and optimizing for local search. Small businesses can outrank bigger competitors by focusing on relevant topics, high-quality content, and a strong local presence." },
  { q: "Why is ongoing SEO important?", a: "Search engine algorithms change frequently, and competitors are always optimizing their websites. Ongoing SEO ensures your site stays updated, maintains rankings, adapts to new trends, and continues attracting high-quality traffic." },
];

/**
 * The blog feed's excerpt for each post whose card does not simply show the first 480 characters of its text, as
 * the live /blog page prints it (older posts carry Wix's shorter summary; a few count spacing the text has lost).
 */
const FEED_EXCERPTS = {
  "golf-simulator-seo-how-to-rank-1-for-golf-simulator-near-me": "Ranking #1 for “golf simulator near me”  is one of the fastest ways to fill bays consistently without relying only on paid ads. This keyword signals high intent  people searching it are ready to book. The good news? Most golf simulator venues across North America  are doing SEO poorly, which makes this one of the easiest wins if you follow the right system. This guide breaks down exactly how successful venues rank at the top in the United States and Canada  and how you can do",
  "marketing-automation-for-golf-simulator-venues-emails-texts-reviews-re-bookings": "Most golf simulator venues focus on getting new customers in the door. The real growth, however, comes from what happens after  the first visit. That’s where marketing automation  changes everything. With the right system, your venue can follow up automatically, collect reviews, bring customers back to book again, and increase lifetime value—without adding work for your team. This guide breaks down how emails, texts, review requests, and re-booking automations  work together",
  "local-seo-for-golf-simulator-venues-a-step-by-step-guide": "Golf simulator venues live and die by one simple thing: local visibility . When someone types “golf simulator near me”  into Google, your venue needs to be one of the first re sults they see. If you are not showing up in local search, you are missing out on bookings, events, and repeat customers every single day. This is where Local SEO  comes in. Local SEO is not about ranking worldwide. It is about ranking in your city, neighborhood, and surrounding area . And for golf simu",
  "social-media-content-calendar": "In 2025, social media has become more competitive than ever. Brands are no longer posting randomly; they are building well-structured...",
  "best-form-of-advertising": "The Shift in Advertising for a Digital-First World Advertising has changed more in the past decade than it did in the previous fifty...",
  "what-is-an-seo-audit": "Search Engine Optimization (SEO) is the process of making your website visible and relevant to users on search engines like Google. It...",
  "why-is-instagram-good-for-marketing": "Instagram isn’t just a platform for sharing photos  it’s a business tool. With over 2 billion monthly users and one of the highest...",
  "how-to-buy-a-domain-name-in-canada-toronto": "Starting a website in Canada? The first step is simple: you need a domain name. That’s the web address where people find you online (like...",
  "how-to-turn-your-facebook-page-into-a-local-business-page": "Why You Need a Facebook Page for Your Business With nearly 2 billion people using Facebook every day, it’s hands-down the most effective...",
  "google-ads-vs-facebook-ads-which-one-is-better-for-small-businesses": "Startups and small business owners often find themselves in a state of confusion In a competitive market like Toronto , choosing between...",
};

/** Live pages this site redirects rather than serves: duplicates of a service page and Wix draft copies. */
const REDIRECTED = [
  "facebook-ads-markham", "facebook-ads-mississauga", "facebook-ads-oakville", "facebook-ads-pickering", "facebook-ads-vaughan",
  "google-ads-burlington", "google-ads-services-ajax", "google-ads-services-brampton", "google-ads-services-caledon", "google-ads-services-markham",
  "google-ads-services-milton", "google-ads-services-mississauga", "google-ads-services-newmarket", "google-ads-services-oakville", "google-ads-services-pickering",
  "google-ads-services-richmond-hill", "google-ads-services-vaughan", "google-ads-services-whitby", "seo-company-oakville", "seo-services-ajax",
  "seo-services-burlington", "seo-services-caledon", "seo-services-newmarket", "seo-services-whitby",
  "web-design-services-halton-hills", "web-design-services-oshawa", "web-design-whitby", "website-design-burlington",
  "copy-of-home", "copy-of-home-1", "copy-of-brand-stategy-design-2",
];
fs.writeFileSync(path.join(ROOT, "redirected.txt"), REDIRECTED.join("\n") + "\n");

const clean = (s) => s.replace(/​|‌|‍|﻿/g, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(u) {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" }, redirect: "follow" });
      return { status: r.status, url: r.url, html: await r.text() };
    } catch (e) {
      if (i === 2) throw e;
      await sleep(1500);
    }
  }
}

// ---- sitemaps -----------------------------------------------------------------------------------------------------
const SITEMAPS = ["pages-sitemap.xml", "blog-posts-sitemap.xml", "blog-categories-sitemap.xml"];
for (const f of SITEMAPS) {
  const file = path.join(ROOT, f);
  if (!fs.existsSync(file)) fs.writeFileSync(file, (await get(`${SITE}/${f}`)).html);
}
// the RSS feed carries each recent post's exact publishing time (a post whose page is broken has no other record of it)
const RSS = path.join(ROOT, "blog-feed.xml");
if (!fs.existsSync(RSS)) fs.writeFileSync(RSS, (await get(`${SITE}/blog-feed.xml`)).html);
const published = Object.fromEntries(
  [...fs.readFileSync(RSS, "utf8").matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => [
    it.match(/<link>([^<]+)<\/link>/)?.[1].replace(/^.*\/post\//, ""),
    new Date(it.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]).toISOString(),
  ]),
);
const locs = (f) => [...fs.readFileSync(path.join(ROOT, f), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = [...new Set(SITEMAPS.flatMap(locs))];
const slugOf = (u) => (new URL(u).pathname.replace(/^\/|\/$/g, "") || "home").replace(/\//g, "__");

// ---- the digest -----------------------------------------------------------------------------------------------------
function head(doc) {
  const meta = (sel) => doc.querySelector(sel)?.getAttribute("content") ?? null;
  return {
    title: clean(doc.querySelector("title")?.text ?? ""),
    description: meta('meta[name="description"]'),
    robots: meta('meta[name="robots"]'),
    canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    og: Object.fromEntries(doc.querySelectorAll('meta[property^="og:"]').map((m) => [m.getAttribute("property"), m.getAttribute("content")])),
    twitter: Object.fromEntries(doc.querySelectorAll('meta[name^="twitter:"]').map((m) => [m.getAttribute("name"), m.getAttribute("content")])),
    jsonld: doc.querySelectorAll('script[type="application/ld+json"]').map((s) => { try { return JSON.parse(s.text); } catch { return s.text; } }),
    lang: doc.querySelector("html")?.getAttribute("lang") ?? null,
  };
}

const mediaId = (src) => (src && src.match(/static\.wixstatic\.com\/media\/([^/]+)/)?.[1]) || src || null;

/** A page's content in document order: sections, rich text (with hard line breaks and links), buttons, images. */
function walk(root) {
  const out = [];
  const visit = (el) => {
    if (el.nodeType !== 1) return;
    const cls = el.getAttribute?.("class") || "";
    const id = el.getAttribute?.("id") || "";
    const tid = el.getAttribute?.("data-testid") || "";
    if (el.getAttribute?.("data-hook") === "faq-root") { out.push(...FAQ.map((f) => ({ t: "faq", ...f }))); return; }
    if (/\bwixui-section\b/.test(cls) || el.tagName === "SECTION") out.push({ t: "section", id });
    else if (/\bwixui-column-strip\b/.test(cls) && !/__column/.test(cls)) out.push({ t: "strip", id });
    if (/\bwixui-repeater__item\b/.test(cls)) out.push({ t: "item", id });
    if (tid === "richTextElement") {
      for (const b of el.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li")) {
        if (b.tagName === "P" && b.closest("li")) continue;
        const text = clean(b.text);
        if (!text) continue;
        // keep hard line breaks: Wix authors often typed lists as <br>-separated lines inside one block
        const lines = parse(b.innerHTML.replace(/<br\b[^>]*>/gi, "\n")).text.split("\n").map(clean).filter(Boolean);
        const links = b.querySelectorAll("a").map((a) => ({ text: clean(a.text), href: a.getAttribute("href") })).filter((l) => l.text);
        out.push({ t: b.tagName.toLowerCase(), text, ...(lines.length > 1 ? { lines } : {}), ...(links.length ? { links } : {}), id });
      }
      return;
    }
    if (/\bwixui-button\b/.test(cls)) {
      const a = el.tagName === "A" ? el : el.querySelector("a");
      const label = clean((el.querySelector('[data-testid="stylablebutton-label"]') || el).text);
      out.push({ t: "button", text: label, href: a?.getAttribute("href") ?? null, id });
      return;
    }
    if (/\bwixui-image\b/.test(cls) || /\bwixui-vector-image\b/.test(cls)) {
      const img = el.querySelector("img");
      const a = el.querySelector("a");
      if (img) out.push({ t: /vector/.test(cls) ? "vector" : "img", alt: img.getAttribute("alt") ?? "", src: mediaId(img.getAttribute("src")), href: a?.getAttribute("href") ?? null, id });
      else if (/vector/.test(cls)) out.push({ t: "vector", id });
      return;
    }
    if (el.tagName === "IFRAME") out.push({ t: "iframe", src: el.getAttribute("src") || el.getAttribute("data-src"), title: el.getAttribute("title"), id });
    if (/\bwixui-horizontal-line\b/.test(cls)) { out.push({ t: "hr", id }); return; }
    for (const c of el.childNodes) visit(c);
  };
  visit(root);
  return out;
}

/** A blog post as its page renders it: title, meta line, body blocks and the page furniture. */
function post(doc) {
  const pg = doc.querySelector('[data-hook="post-page"]');
  if (!pg) return null;
  const q = (h) => clean(pg.querySelector(`[data-hook="${h}"]`)?.text ?? "");
  const body = [];
  const desc = pg.querySelector('[data-hook="post-description"]');
  for (const b of desc ? desc.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,blockquote,img") : []) {
    if (b.tagName === "IMG") { body.push({ t: "img", alt: b.getAttribute("alt") ?? "", src: (b.getAttribute("src") || "").match(/media\/([^/]+)/)?.[1] ?? null }); continue; }
    if (b.tagName === "P" && (b.closest("li") || b.closest("blockquote"))) continue;
    const text = clean(b.text);
    if (!text) continue;
    const links = b.querySelectorAll("a").map((a) => ({ text: clean(a.text), href: a.getAttribute("href") })).filter((l) => l.text);
    body.push({ t: b.tagName.toLowerCase(), text, ...(links.length ? { links } : {}) });
  }
  const recentRoot = pg.querySelector('[data-hook="recent-posts"]');
  return {
    title: q("post-title"), author: q("user-name"), date: q("time-ago"), readTime: q("time-to-read"), body,
    recentHeading: recentRoot ? clean(recentRoot.querySelector("h2,h3,h4,p,span")?.text ?? "") : null,
    recent: pg.querySelectorAll('[data-hook="recent-post-list-item"]').map((r) => clean(r.querySelector('[data-hook="post-title"]')?.text ?? r.text)),
    footer: clean(pg.querySelector('[data-hook="post-footer"]')?.text ?? ""),
  };
}

// ---- every page ------------------------------------------------------------------------------------------------------
const results = [];
let next = 0;
async function worker() {
  while (next < urls.length) {
    const u = urls[next++];
    const slug = slugOf(u);
    const file = path.join(HTML, slug + ".html");
    let html, status = 200, finalUrl = u;
    if (fs.existsSync(file)) html = fs.readFileSync(file, "utf8");
    else {
      const r = await get(u);
      ({ html, status } = r);
      finalUrl = r.url;
      fs.writeFileSync(file, html);
      await sleep(250);
    }
    const doc = parse(html, { comment: false, blockTextElements: { script: true, style: true, noscript: false } });
    const page = doc.querySelector("#PAGES_CONTAINER") || doc.querySelector("main") || doc;
    const data = { url: u, finalUrl, status, slug, head: head(doc), content: walk(page) };
    if (slug === "home") {
      data.header = walk(doc.querySelector("#SITE_HEADER") || parse(""));
      data.footer = walk(doc.querySelector("#SITE_FOOTER") || parse(""));
    }
    if (slug.startsWith("post__")) {
      const postSlug = slug.slice("post__".length);
      data.post = post(doc);
      if (published[postSlug]) data.published = published[postSlug];
      if (FEED_EXCERPTS[postSlug]) data.feedExcerpt = FEED_EXCERPTS[postSlug];
    }
    fs.writeFileSync(path.join(JSON_DIR, slug + ".json"), JSON.stringify(data, null, 1));
    results.push({ slug, status, title: data.head.title, items: data.content.length });
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
results.sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(path.join(ROOT, "index.json"), JSON.stringify(results, null, 1));
console.log(results.length, "pages");
for (const r of results) console.log(r.status, String(r.items).padStart(4), r.slug, "|", r.title);
