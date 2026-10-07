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

/** Site-wide defaults only. Each route sets the live site's own title, description, canonical, social tags and
 *  structured data (lib/seo.ts, components/ui/JsonLd.tsx). */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", width: "device-width", initialScale: 1 };

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
