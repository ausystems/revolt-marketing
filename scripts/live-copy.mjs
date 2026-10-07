// Builds every word of the site from a scrape of the live revolt-marketing.com (scripts/scrape-live.mjs).
// The copy is taken verbatim: nothing here is written by hand except the structure it is poured into.
//
//   node scripts/scrape-live.mjs <dir>     # download the live pages
//   node scripts/live-copy.mjs <dir>       # → content/live/*.json, content/posts.json
import fs from "node:fs";
import path from "node:path";

const SRC = process.argv[2];
if (!SRC) { console.error("usage: node scripts/live-copy.mjs <scrape-dir>"); process.exit(1); }
const J = path.join(SRC, "json");
const OUT = path.resolve("content/live");
fs.mkdirSync(OUT, { recursive: true });
const read = (slug) => JSON.parse(fs.readFileSync(path.join(J, slug + ".json"), "utf8"));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 1) + "\n");
const SITE = "https://www.revolt-marketing.com";

/** Live hrefs → routes here. Legacy Toronto pages map to the pages that replaced them; buttons that pointed at the
 *  homepage by mistake keep their words and point where their words say. */
const LEGACY = {
  "/google-ads-agency-toronto": "/growth-marketing-systems/google-ad-management",
  "/facebook-ads-marketing-toronto": "/growth-marketing-systems/meta-ad-management",
  "/seo-services-toronto": "/growth-marketing-systems/seo-ranking",
  "/website-design-toronto": "/website-design-approach",
};
const local = (href) => {
  if (!href) return null;
  if (/^(mailto|tel):/.test(href)) return href;
  if (!/^https?:\/\/(www\.)?revolt-marketing\.com(\/|$)/.test(href)) return href;
  const p = href.replace(/^https?:\/\/(www\.)?revolt-marketing\.com/, "").replace(/\/$/, "") || "/";
  return LEGACY[p] ?? p;
};

/** Index helpers over a page's content items. */
const finder = (items) => ({
  at: (pred, from = 0) => { for (let i = from; i < items.length; i++) if (pred(items[i])) return i; return -1; },
  after: (k, t, n = 1) => { const r = []; for (let i = k + 1; i < items.length && r.length < n; i++) { if (items[i].t === "section") break; if (items[i].t === t) r.push(items[i]); } return r; },
});
const must = (v, what) => { if (v === undefined || v === null || v === -1 || (Array.isArray(v) && !v.length)) throw new Error("missing: " + what); return v; };

/** Repeater items (title, text) after an anchor, until the section ends. */
function repeater(items, k) {
  const out = [];
  for (let i = k + 1; i < items.length; i++) {
    const it = items[i];
    if (it.t === "section") break;
    if (it.t === "item") out.push({ title: null, text: null });
    else if (it.t === "p" && out.length) { const cur = out[out.length - 1]; if (!cur.title) cur.title = it.text; else if (!cur.text) cur.text = it.text; }
  }
  return out;
}

/** Content items → render blocks: list items merge into lists, hard line breaks are kept, links point here. */
function blocks(items) {
  const out = [];
  for (const it of items) {
    if (it.t === "li") { const prev = out[out.length - 1]; if (prev?.t === "ul") prev.items.push(it.text); else out.push({ t: "ul", items: [it.text] }); continue; }
    if (/^h[1-6]$/.test(it.t) || it.t === "p") {
      const b = { t: it.t, text: it.text };
      if (it.lines) b.lines = it.lines;
      if (it.links) b.links = it.links.map((l) => ({ text: l.text, href: local(l.href) }));
      out.push(b);
      continue;
    }
    if (it.t === "img") { out.push({ t: "img", alt: it.alt ?? "", src: it.src }); continue; }
    if (it.t === "button") { out.push({ t: "button", text: it.text, href: local(it.href) }); continue; }
  }
  return out;
}

// ---- home ---------------------------------------------------------------------------------------------------
const homeData = read("home");
const H = homeData.content, h = finder(H);
const heroH1 = must(h.at((i) => i.t === "h1"), "hero h1");
const whoK = must(h.at((i) => i.t === "h3" && i.text === "WHO WE ARE"), "who");
const procK = must(h.at((i) => i.t === "h2" && /Four Step Process/.test(i.text)), "process");
// The steps in the order the live layout numbers them (1. low-left … 4. high-right).
const STEP_ORDER = ["Branding & Design Strategy", "Growth Marketing Systems", "Marketing Automation Systems", "Event Marketing Strategy"];
const stepDesc = {};
for (let i = procK; i < H.length && H[i].t !== "section"; i++) {
  if (H[i].t === "p" && STEP_ORDER.includes(H[i].text)) stepDesc[H[i].text] = must(h.after(i, "p")[0], "step desc " + H[i].text).text;
}
const nums = H.slice(procK).filter((i) => i.t === "h1" && /^\d\.$/.test(i.text)).map((i) => i.text).sort();
if (nums.join() !== "1.,2.,3.,4.") throw new Error("process numbers: " + nums);
const whyK = must(h.at((i) => i.t === "h2" && /Why Golf Simulator Venues Choose/.test(i.text)), "why");
const digK = must(h.at((i) => i.t === "h3" && /Why Digital Marketing Matters/.test(i.text)), "digital");
const callK = must(h.at((i) => i.t === "h1" && i.text === "Free Strategy Call"), "strategy call");
const digital = { h3: H[digK].text, ps: [], button: null };
for (let i = digK + 1; i < H.length && H[i].t !== "section"; i++) { if (H[i].t === "p") digital.ps.push(H[i].text); if (H[i].t === "button") digital.button = { text: H[i].text, href: local(H[i].href) }; }
const home = {
  hero: { h1: H[heroH1].text, p: h.after(heroH1, "p")[0].text, buttons: h.after(heroH1, "button", 2).map((b) => ({ text: b.text, href: local(b.href) })) },
  who: { h3: H[whoK].text, ps: h.after(whoK, "p", 2).map((p) => p.text) },
  // "PROCESS" and "WHY CHOOSE US" are set on the live site as outlined display words (images of text)
  process: { label: "PROCESS", h2: H[procK].text, p: h.after(procK, "p")[0].text, steps: STEP_ORDER.map((title, j) => ({ n: `${j + 1}.`, title, text: must(stepDesc[title], title) })) },
  why: { label: "WHY CHOOSE US", h2: H[whyK].text, items: repeater(H, whyK) },
  digital,
  call: { h1: H[callK].text, p: h.after(callK, "p")[0].text },
};
if (home.why.items.length !== 4 || home.why.items.some((x) => !x.title || !x.text)) throw new Error("why items");

// ---- header and footer ----------------------------------------------------------------------------------------
// The menu as the live header renders it (labels verbatim, including their capitals).
const nav = {
  items: [
    { label: "HOME", href: "/" },
    { label: "SERVICES", href: "/services", children: [
      { label: "Branding & Design Strategy", href: "/branding-and-design-strategy" },
      { label: "Growth Marketing Systems", href: "/growth-marketing-systems" },
      { label: "Marketing Automation Systems", href: "/marketing-automation-systems" },
      { label: "Event Marketing Strategy", href: "/event-marketing-strategy" },
    ] },
    { label: "ABOUT US", href: "/about-us", children: [{ label: "Blog", href: "/blog" }] },
    { label: "CONTACT US", href: "/contact-us" },
  ],
  cta: { label: must(homeData.header.find((i) => i.t === "button"), "header cta").text, href: "/contact-us" },
};
const F = homeData.footer;
const fp = F.filter((i) => i.t === "p").map((i) => i.text);
const fi = (t) => must(fp.indexOf(t), "footer " + t);
const footer = {
  contact: [
    { label: fp[fi("Call Us Now")], value: fp[fi("Call Us Now") + 1], href: "tel:+16479514131" },
    { label: fp[fi("Email Address")], value: fp[fi("Email Address") + 1], href: `mailto:${fp[fi("Email Address") + 1]}` },
    { label: fp[fi("Location")], value: fp[fi("Location") + 1], href: null },
  ],
  tagline: fp[fi("Location") + 2],
  links: { heading: "Our Links", items: [["Home", "/"], ["About Us", "/about-us"], ["Services", "/services"], ["Contact Us", "/contact-us"]].map(([label, href]) => ({ label: fp[fi(label)], href })) },
  services: { heading: fp[fi("Our Services")], items: nav.items[1].children.map((c) => ({ label: fp[fi(c.label)], href: c.href })) },
  book: { heading: fp[fi("Book a Call")], button: { label: must(F.find((i) => i.t === "button"), "footer button").text, href: "/contact-us" } },
  privacy: { label: fp[fi("Privacy Policy")], href: "/privacypolicy" },
};

// ---- about ---------------------------------------------------------------------------------------------------
const A = read("about-us").content, a = finder(A);
const aH1 = must(a.at((i) => i.t === "h1"), "about h1");
const aWhy = must(a.at((i) => i.t === "h3" && /WHY WE BUILT REVOLT/.test(i.text)), "about why");
const aApp = must(a.at((i) => i.t === "h3" && i.text === "OUR APPROACH"), "about approach");
const founders = [];
for (let i = aH1; i < aWhy; i++) if (A[i].t === "h3") founders.push({ name: A[i].text, bio: a.after(i, "p")[0].text });
const aboutWhyPs = []; for (let i = aWhy + 1; i < aApp && A[i].t !== "section"; i++) if (A[i].t === "p") aboutWhyPs.push(A[i].text);
const about = { h1: A[aH1].text, p: a.after(aH1, "p")[0].text, founders, why: { h3: A[aWhy].text, ps: aboutWhyPs }, approach: { h3: A[aApp].text, items: repeater(A, aApp) } };
if (founders.length !== 2 || about.approach.items.length !== 4) throw new Error("about structure");

// ---- services ------------------------------------------------------------------------------------------------
const S = read("services").content, sv = finder(S);
const sH1 = must(sv.at((i) => i.t === "h1"), "services h1");
const sWhy = must(sv.at((i) => i.t === "h2" && /Why Golf Simulator Venues Choose/.test(i.text)), "services why");
const sysBlocks = [];
for (let i = sH1; i < sWhy; i++) {
  if (S[i].t !== "h3") continue;
  const ps = sv.after(i, "p", 2), btns = sv.after(i, "button", 2);
  sysBlocks.push({ name: S[i].text, subtitle: ps[0].text, text: ps[1].text, buttons: btns.map((b) => ({ text: b.text, href: local(b.href) })) });
}
const services = { h1: S[sH1].text, p: sv.after(sH1, "p")[0].text, systems: sysBlocks, why: { label: "WHY CHOOSE US", h2: S[sWhy].text, items: repeater(S, sWhy) } };
if (sysBlocks.length !== 4 || services.why.items.length !== 4) throw new Error("services structure");

// ---- contact, blog -------------------------------------------------------------------------------------------
const C = read("contact-us").content, c = finder(C);
const cH1 = must(c.at((i) => i.t === "h1"), "contact h1");
const contact = { label: "GET IN TOUCH", h1: C[cH1].text, p: c.after(cH1, "p")[0].text };
const blog = { allPosts: "All Posts", recentPosts: "Recent Posts", seeAll: "See All" };

write(path.join(OUT, "site.json"), { nav, footer, home, about, services, contact, blog });

// ---- the four system pages -----------------------------------------------------------------------------------
const SYSTEMS = ["branding-and-design-strategy", "growth-marketing-systems", "marketing-automation-systems", "event-marketing-strategy"];
const systems = SYSTEMS.map((slug) => {
  const X = read(slug).content, x = finder(X);
  const k = must(x.at((i) => i.t === "h1"), slug + " h1");
  const items = [];
  for (let i = k; i < X.length; i++) {
    if (X[i].t !== "h3") continue;
    const btns = x.after(i, "button", 2);
    items.push({ title: X[i].text, text: x.after(i, "p")[0].text, buttons: btns.map((b) => ({ text: b.text, href: local(b.href) })) });
  }
  return { slug: "/" + slug, h1: X[k].text, intro: x.after(k, "p")[0].text, items };
});
write(path.join(OUT, "systems.json"), systems);

// ---- rich pages: sub-services, city pages, the privacy policy --------------------------------------------------
const redirected = new Set(fs.readFileSync(path.join(SRC, "redirected.txt"), "utf8").split(/\s+/).filter(Boolean));
const rich = {};
for (const f of fs.readdirSync(J).filter((f) => f.endsWith(".json"))) {
  const slug = f.replace(/\.json$/, "");
  if (redirected.has(slug) || slug.startsWith("post__") || ["home", "about-us", "services", "contact-us", "blog", ...SYSTEMS].includes(slug)) continue;
  const d = read(slug);
  if (d.status !== 200 || !d.content.length) continue;
  const route = "/" + slug.replace(/__/g, "/");
  const faq = d.content.filter((i) => i.t === "faq").map(({ q, a }) => ({ q, a }));
  rich[route] = { blocks: blocks(d.content.filter((i) => i.t !== "faq")), ...(faq.length ? { faq } : {}) };
}
write(path.join(OUT, "pages.json"), rich);

// ---- blog posts ----------------------------------------------------------------------------------------------
const mediaId = (u) => (u || "").match(/media\/([^/~.]+)/)?.[1] ?? null;
const BLOG_MEDIA = path.resolve("public/media/blog");
const have = new Set(fs.existsSync(BLOG_MEDIA) ? fs.readdirSync(BLOG_MEDIA).map((f) => f.replace(/\.\w+$/, "")) : []);
const parseLd = (j) => { if (typeof j !== "string") return j; try { return JSON.parse(j.replace(/[\u0000-\u001f]+/g, " ")); } catch { return null; } };
const posts = [];
for (const f of fs.readdirSync(J).filter((f) => f.startsWith("post__"))) {
  const d = read(f.replace(/\.json$/, ""));
  if (!d.post || d.status !== 200) continue;
  const slug = new URL(d.url).pathname.replace(/^\/post\//, "");
  const ld = (d.head.jsonld || []).map(parseLd).find((j) => j && j["@type"] === "BlogPosting");
  const cover = mediaId(d.head.og["og:image"]);
  const body = [];
  for (const b of d.post.body) {
    if (b.t === "img") { const id = mediaId(b.src); if (id && have.has(id)) body.push({ t: "img", src: `/media/blog/${id}.jpg`, alt: b.alt || "" }); continue; }
    if (b.t === "li") { const prev = body[body.length - 1]; if (prev?.t === "ul") prev.items.push(b.text); else body.push({ t: "ul", items: [b.text] }); continue; }
    const blk = { t: b.t, text: b.text };
    if (b.links) blk.links = b.links.map((l) => ({ text: l.text, href: local(l.href) }));
    body.push(blk);
  }
  // the live feed's excerpt: the post's text, run together, cut at 480 characters (or the feed's own, where it differs)
  const plain = body.flatMap((b) => (b.t === "ul" ? b.items : b.text ? [b.text] : [])).join(" ");
  posts.push({
    slug,
    title: d.post.title,
    seoTitle: d.head.title,
    description: d.head.description,
    author: d.post.author,
    readTime: d.post.readTime,
    date: ld?.datePublished ?? null,
    modified: ld?.dateModified ?? ld?.datePublished ?? null,
    cover: cover && have.has(cover) ? `/media/blog/${cover}.jpg` : null,
    excerpt: d.feedExcerpt ?? plain.slice(0, 480),
    blocks: body,
  });
}
// Posts that are broken on the live site (a server error, or a blank page) keep the version captured while they
// worked, so their URLs still answer.
const previousFile = path.resolve("content/posts.json");
const previous = fs.existsSync(previousFile) ? JSON.parse(fs.readFileSync(previousFile, "utf8")) : [];
const legacy = previous.filter((p) => !posts.some((q) => q.slug === p.slug));
for (const p of legacy) {
  const plain = p.blocks.flatMap((b) => (b.items ? b.items : b.text ? [b.text] : [])).join(" ");
  const d = fs.existsSync(path.join(J, `post__${p.slug}.json`)) ? read(`post__${p.slug}`) : {};
  const date = d.published ?? p.date;
  posts.push({ slug: p.slug, title: p.title, seoTitle: p.seoTitle, description: p.description, author: p.author, readTime: p.readTime, date, modified: p.modified && p.modified > date ? p.modified : date, cover: p.cover, excerpt: d.feedExcerpt ?? p.excerpt ?? plain.slice(0, 480), blocks: p.blocks, legacy: true });
}
posts.sort((x, y) => (y.date || "").localeCompare(x.date || ""));
write(previousFile, posts);

// ---- SEO, per route --------------------------------------------------------------------------------------------
const seo = {};
for (const f of fs.readdirSync(J).filter((f) => f.endsWith(".json"))) {
  const slug = f.replace(/\.json$/, "");
  if (redirected.has(slug)) continue;
  const d = read(slug);
  if (d.status !== 200 || (slug.startsWith("post__") && !d.post)) continue;
  const route = slug === "home" ? "/" : slug.startsWith("post__") ? "/post/" + new URL(d.url).pathname.replace(/^\/post\//, "") : "/" + slug.replace(/__/g, "/");
  const og = d.head.og, tw = d.head.twitter;
  const img = mediaId(og["og:image"]);
  const share = slug.startsWith("post__") ? (img && have.has(img) ? `/media/blog/${img}.jpg` : null) : "/media/og-share.png";
  seo[route] = {
    title: d.head.title,
    description: d.head.description,
    canonical: (d.head.canonical || SITE + route).replace(SITE, "") || "/",
    og: { title: og["og:title"] ?? null, description: og["og:description"] ?? null, type: og["og:type"] ?? null, siteName: og["og:site_name"] ?? null, image: share, width: Number(og["og:image:width"]) || null, height: Number(og["og:image:height"]) || null },
    twitter: { card: tw["twitter:card"] ?? null, title: tw["twitter:title"] ?? null, description: tw["twitter:description"] ?? null },
    jsonld: (d.head.jsonld || []).map(parseLd).filter(Boolean),
  };
}
for (const p of posts.filter((p) => p.legacy)) {
  seo["/post/" + p.slug] = {
    title: p.seoTitle || p.title, description: p.description, canonical: "/post/" + p.slug,
    og: { title: p.seoTitle || p.title, description: p.description, type: "article", siteName: "Revolt", image: p.cover, width: null, height: null },
    twitter: { card: "summary_large_image", title: p.seoTitle || p.title, description: p.description },
    jsonld: [],
  };
}
write(path.join(OUT, "seo.json"), seo);

// ---- sitemap: every route served here, with the live sitemaps' own dates ---------------------------------------
const lastmod = {};
for (const f of ["pages-sitemap.xml", "blog-posts-sitemap.xml", "blog-categories-sitemap.xml"]) {
  const file = path.join(SRC, f);
  if (!fs.existsSync(file)) continue;
  for (const m of fs.readFileSync(file, "utf8").matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
    const route = m[1].replace(SITE, "") || "/";
    if (seo[route]) lastmod[route] = m[2];
  }
}
write(path.join(OUT, "sitemap.json"), Object.keys(seo).sort().map((route) => ({ route, lastmod: lastmod[route] ?? null })));

console.log(`site.json · systems ${systems.length} · rich pages ${Object.keys(rich).length} · posts ${posts.length} · seo routes ${Object.keys(seo).length}`);
