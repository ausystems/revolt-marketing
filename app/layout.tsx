import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Curtain from "@/components/motion/Curtain";
import { site } from "@/content/site";

const inter = Inter({ subsets: ["latin", "latin-ext"], weight: "variable", axes: ["opsz"], variable: "--font-inter", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: "variable", variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: "%s | Revolt" },
  description: site.seo.description,
  applicationName: site.name,
  creator: site.name,
  publisher: site.name,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.name, locale: "en_CA", url: site.url, title: site.seo.title, description: site.seo.description, images: [{ url: "/media/og.png", width: 1200, height: 630, alt: "Revolt Marketing" }] },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description, images: ["/media/og.png"] },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", width: "device-width", initialScale: 1 };

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  alternateName: site.legalName,
  url: site.url,
  logo: `${site.url}/media/wordmark.png`,
  email: site.email,
  telephone: "+1-647-951-4131",
  address: { "@type": "PostalAddress", streetAddress: "100 City Centre Drive", addressLocality: "Toronto", addressRegion: "ON", addressCountry: "CA" },
  sameAs: site.social.map((s) => s.href),
  founder: site.founders.map((f) => ({ "@type": "Person", name: f.name })),
};
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  image: `${site.url}/media/og.png`,
  url: site.url,
  telephone: "+1-647-951-4131",
  priceRange: "$$",
  address: { "@type": "PostalAddress", streetAddress: "100 City Centre Drive", addressLocality: "Toronto", addressRegion: "ON", addressCountry: "CA" },
  areaServed: ["Canada", "United States"],
};
const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: "Revolt", url: site.url };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`no-js ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Swap no-js → js before first paint so the page waits under the curtain instead of flashing. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var h=document.documentElement,c=h.classList;c.remove('no-js');c.add('js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||/[?&]nomotion/.test(location.search))c.add('reduced-motion');if(matchMedia('(hover: none), (pointer: coarse)').matches)c.add('touch');}catch(e){}})();",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </head>
      <body>
        <a className="skip-link btn" href="#main">Skip to content</a>
        <SmoothScroll />
        <Curtain />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
