import type { NextConfig } from "next";

/**
 * Every legitimate URL from the live Wix site resolves here. Pages that were duplicates of a service page
 * (28 city-keyword pages that carried the identical "Growth Marketing Systems" or "Branding & Design Strategy"
 * content) and the Wix draft copies redirect permanently to their canonical page.
 */
const growthDupes = [
  "facebook-ads-markham", "facebook-ads-mississauga", "facebook-ads-oakville", "facebook-ads-pickering", "facebook-ads-vaughan",
  "google-ads-burlington", "google-ads-services-ajax", "google-ads-services-brampton", "google-ads-services-caledon", "google-ads-services-markham",
  "google-ads-services-milton", "google-ads-services-mississauga", "google-ads-services-newmarket", "google-ads-services-oakville", "google-ads-services-pickering",
  "google-ads-services-richmond-hill", "google-ads-services-vaughan", "google-ads-services-whitby", "seo-company-oakville", "seo-services-ajax",
  "seo-services-burlington", "seo-services-caledon", "seo-services-newmarket", "seo-services-whitby",
];
const brandingDupes = ["web-design-services-halton-hills", "web-design-services-oshawa", "web-design-whitby", "website-design-burlington"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"], deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920, 2560] },
  async redirects() {
    return [
      ...growthDupes.map((p) => ({ source: `/${p}`, destination: "/growth-marketing-systems", permanent: true })),
      ...brandingDupes.map((p) => ({ source: `/${p}`, destination: "/branding-and-design-strategy", permanent: true })),
      // Legacy Toronto service pages (still linked from older blog posts; the live site redirects them too)
      { source: "/google-ads-agency-toronto", destination: "/growth-marketing-systems/google-ad-management", permanent: true },
      { source: "/facebook-ads-marketing-toronto", destination: "/growth-marketing-systems/meta-ad-management", permanent: true },
      { source: "/seo-services-toronto", destination: "/growth-marketing-systems/seo-ranking", permanent: true },
      { source: "/website-design-toronto", destination: "/website-design-approach", permanent: true },
      { source: "/blog/hashtags/:tag", destination: "/blog", permanent: true },
      { source: "/copy-of-home", destination: "/", permanent: true },
      { source: "/copy-of-home-1", destination: "/contact-us", permanent: true },
      { source: "/copy-of-brand-stategy-design-2", destination: "/branding-and-design-strategy/complete-branding-pack-2", permanent: true },
      { source: "/privacy-policy", destination: "/privacypolicy", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/about", destination: "/about-us", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] }];
  },
};

export default nextConfig;
