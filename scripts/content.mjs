// Generates content/posts.json, content/cities.json and content/privacy.json from the scraped live site.
import fs from "node:fs";
import path from "node:path";

const LIVE = process.argv[2];
const OUT = path.resolve("content");
fs.mkdirSync(OUT, { recursive: true });
/** Live-site hrefs → routes here. Legacy Toronto pages map to the service that replaced them; Wix hashtag feeds are dropped. */
const LEGACY = { "/google-ads-agency-toronto": "/growth-marketing-systems/google-ad-management", "/facebook-ads-marketing-toronto": "/growth-marketing-systems/meta-ad-management", "/seo-services-toronto": "/growth-marketing-systems/seo-ranking", "/website-design-toronto": "/website-design-approach" };
const localHref = (href) => { const stripped = href.replace(/^https?:\/\/(www\.)?revolt-marketing\.com(?=\/|$)/, "") || "/"; return LEGACY[stripped] ?? stripped; };
/** Calendar date in Toronto for a Wix ISO timestamp (the live site shows Toronto dates). */
const ymd = (s) => (s ? new Date(s).toLocaleDateString("en-CA", { timeZone: "America/Toronto" }) : "");
const typeset = (s) => s.replace(/(\w)'(\w)/g, "$1’$2").replace(/"([^"]*)"/g, "“$1”").replace(/\s+/g, " ").replace(/​/g, "").trim();

// ---- Blog posts ---------------------------------------------------------------
const posts = JSON.parse(fs.readFileSync(path.join(LIVE, "blog", "posts.json"), "utf8"));
const bySlugBase = {};
const cleanPosts = posts.map((p) => {
  const blocks = [];
  for (const b of p.blocks) {
    if (b.t === "img") { blocks.push({ t: "img", src: `/media/blog/${b.id.replace(/~mv2\.[a-z]+$/, "")}.jpg`, alt: typeset(b.alt || "") }); continue; }
    if (b.t === "ul" || b.t === "ol") { blocks.push({ t: b.t, items: b.items.map(typeset) }); continue; }
    let text = typeset(b.text || "");
    if (!text) continue;
    // Wix pasted bullets as paragraphs beginning with "•": fold consecutive ones into a list.
    if (/^[•·\-–]\s*/.test(text)) {
      const item = text.replace(/^[•·\-–]\s*/, "");
      const prev = blocks[blocks.length - 1];
      if (prev && prev.t === "ul" && prev.folded) prev.items.push(item); else blocks.push({ t: "ul", items: [item], folded: true });
      continue;
    }
    if (b.t === "p" && b.links) {
      const links = b.links.filter((l) => !/\/blog\/hashtags\//.test(l.href)).map((l) => ({ href: localHref(l.href), text: typeset(l.text) }));
      blocks.push(links.length ? { t: "p", text, links } : { t: "p", text });
    }
    else blocks.push({ t: b.t, text });
  }
  // Drop the cover if it is the first block (it is rendered as the hero).
  if (blocks[0]?.t === "img" && p.cover && blocks[0].src.includes(p.cover.replace(/~mv2\.[a-z]+$/, ""))) blocks.shift();
  for (const b of blocks) delete b.folded;
  const base = p.slug.replace(/-1$/, "");
  bySlugBase[base] = bySlugBase[base] || [];
  bySlugBase[base].push(p.slug);
  return {
    slug: p.slug,
    title: typeset(p.title),
    seoTitle: typeset(p.seoTitle),
    description: typeset(p.description),
    author: p.author || "Revolt Marketing",
    date: ymd(p.datePublished),
    modified: ymd(p.dateModified),
    readTime: p.readTime,
    cover: p.cover ? `/media/blog/${p.cover.replace(/~mv2\.[a-z]+$/, "")}.jpg` : null,
    blocks,
  };
});
// Wix duplicates ("-1" variants) keep their URL but canonicalise to the original.
for (const p of cleanPosts) { const base = p.slug.replace(/-1$/, ""); if (p.slug !== base && cleanPosts.some((q) => q.slug === base)) p.canonical = base; }
cleanPosts.sort((a, b) => b.date.localeCompare(a.date));
fs.writeFileSync(path.join(OUT, "posts.json"), JSON.stringify(cleanPosts, null, 1));

// ---- City pages -----------------------------------------------------------------
const pagesDir = path.join(LIVE, "pages");
const cities = [];
for (const f of fs.readdirSync(pagesDir)) {
  if (!f.endsWith(".json") || f.startsWith("post__") || f === "_index.json" || f.includes("__")) continue;
  if (!/^(seo-|web-design|website-design-(?!approach))/.test(f)) continue;
  const j = JSON.parse(fs.readFileSync(path.join(pagesDir, f), "utf8"));
  if (/Growth Marketing Systems|Branding & Design Strategy/.test(j.title)) continue;
  const slug = f.replace(/\.json$/, "");
  const sections = [];
  let cur = null; const faq = []; let pendingQ = null;
  const isChrome = (t) => /^(Call Us Now|Email Address|Location|Toronto, Canada|\(647\)-951-4131|shayne@revolt-marketing\.com|Our Links|Our Services|Book a Call|Privacy Policy|Home|About Us|Services|Contact Us|Branding & Design Strategy|Growth Marketing Systems|Marketing Automation Systems|Event Marketing Strategy|Schedule a call to learn more.*|top of page|bottom of page|HOME|SERVICES.*|ABOUT US.*|CONTACT US)$/.test(t.trim());
  let h1 = "", standfirst = "", heroImg = null; const intro = [];
  for (const c of j.content) {
    if (c.kind === "h1" && !h1) { h1 = typeset(c.text); continue; }
    if (c.kind === "h2" && !standfirst && !cur) { standfirst = typeset(c.text); continue; }
    if (c.kind === "img") { const m = c.src.match(/media\/([a-zA-Z0-9_]+)~mv2\.([a-z]+)/); if (!m) continue; if (/Toronto digital advertising|Advertising and sales funnel|Online brand visibility/.test(c.alt || "")) continue; const ext = fs.existsSync(path.join("public/media/city", m[1] + ".png")) ? "png" : "jpg"; const src = `/media/city/${m[1]}.${ext}`; if (cur && !cur.image) cur.image = src; else if (!cur && !heroImg) heroImg = src; continue; }
    if (c.kind === "h3" || (c.kind === "h2" && cur)) { cur = { title: typeset(c.text), paragraphs: [], bullets: [], image: null }; sections.push(cur); continue; }
    if (c.kind === "button") { pendingQ = typeset(c.text); faq.push({ q: pendingQ, a: "" }); continue; }
    if (c.kind === "p" || c.kind === "li" || c.kind === "text") {
      const t = typeset(c.text); if (!t || isChrome(t) || t.length < 3) continue;
      if (pendingQ) { const item = faq.find((x) => x.q === pendingQ); if (item && !item.a) { item.a = t; continue; } }
      if (!cur) { if (!standfirst) standfirst = t; else intro.push(t); continue; }
      // Wix rich text separates list items with <br>; the scraper kept those as `lines`.
      if (c.kind === "li") cur.bullets.push(t);
      else if (c.lines && c.lines.length >= 3) cur.bullets.push(...c.lines.map(typeset));
      else cur.paragraphs.push(t);
    }
  }
  const FAQ = {
    "What are the benefits of SEO for my business?": "SEO helps increase your website’s visibility on search engines, attract more qualified visitors, and build trust with potential customers. By optimizing your site’s content, structure, and keywords, SEO can improve rankings, drive targeted traffic, and boost overall sales and brand awareness.",
    "How long does it take to see SEO results?": "SEO is a long-term strategy. Most businesses start seeing noticeable improvements within 3 to 6 months, depending on competition, website health, and keyword difficulty. Consistency in optimization and content creation is key to achieving sustainable growth.",
    "What is included in professional SEO services?": "Professional SEO services typically include keyword research, on-page optimization, technical SEO audits, link building, local SEO strategies, and content creation. Together, these efforts help improve your website’s visibility and attract the right audience.",
    "Can SEO help small businesses compete with larger companies?": "Yes. SEO can level the playing field by targeting niche keywords and optimizing for local search. Small businesses can outrank bigger competitors by focusing on relevant topics, high-quality content, and a strong local presence.",
    "Why is ongoing SEO important?": "Search engine algorithms change frequently, and competitors are always optimizing their websites. Ongoing SEO ensures your site stays updated, maintains rankings, adapts to new trends, and continues attracting high-quality traffic.",
  };
  for (const f of faq) if (FAQ[f.q]) f.a = FAQ[f.q];
  const kind = /seo/.test(slug) ? "seo" : "web";
  const cityName = h1.replace(/^(Best|Expert|Professional)\s+/i, "").replace(/(SEO (Company|Services?|Service)|Web(site)? Design( Services?| Service)?|Company)/gi, "").replace(/\b(in|In|Near Me)\b/g, "").replace(/\s+/g, " ").trim();
  cities.push({ slug, kind, city: cityName, title: typeset(j.title), description: typeset(j.description), h1, standfirst, intro, heroImage: heroImg, sections, faq: faq.filter((x) => x.q) });
}
cities.sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(path.join(OUT, "cities.json"), JSON.stringify(cities, null, 1));

// ---- Privacy policy ---------------------------------------------------------------
const priv = JSON.parse(fs.readFileSync(path.join(pagesDir, "privacypolicy.json"), "utf8"));
const privacy = { title: "Privacy Policy", effective: "", sections: [] };
let sec = null;
for (const c of priv.content) {
  if (c.kind === "h1") continue;
  const t = typeset(c.text || "");
  if (c.kind === "p" && /^Effective Date/.test(t) && !privacy.effective) { privacy.effective = t; continue; }
  if (c.kind === "h5") { sec = { heading: t, blocks: [] }; privacy.sections.push(sec); continue; }
  if (!sec) continue;
  if (c.kind === "h3") { if (t.length > 120) sec.blocks.push({ t: "p", text: t }); else sec.blocks.push({ t: "h3", text: t }); continue; }
  if (c.kind === "p" && t && !/^(Call Us Now|\(647\)|Email Address|shayne@|Location|Toronto, Canada|Our Links|Our Services|Book a Call|Privacy Policy|Home|About Us|Services|Contact Us|Branding & Design Strategy|Growth Marketing Systems|Marketing Automation Systems|Event Marketing Strategy|Schedule a call)/.test(t)) sec.blocks.push({ t: "p", text: t });
  if (c.kind === "li" && t) { const prev = sec.blocks[sec.blocks.length - 1]; if (prev && prev.t === "ul") prev.items.push(t); else sec.blocks.push({ t: "ul", items: [t] }); }
}
fs.writeFileSync(path.join(OUT, "privacy.json"), JSON.stringify(privacy, null, 1));

console.log("posts", cleanPosts.length, "| cities", cities.length, "| privacy sections", privacy.sections.length);
for (const c of cities) console.log("  ", c.slug.padEnd(32), c.kind, "|", c.city.padEnd(16), "|", c.sections.length, "sections", c.faq.length, "faq", c.heroImage ? "hero" : "-");
