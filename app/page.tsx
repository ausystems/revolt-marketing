import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import WhoWeAre from "@/components/sections/WhoWeAre";
import FourStepProcess from "@/components/sections/FourStepProcess";
import Ecosystem from "@/components/sections/Ecosystem";
import DigitalMatters from "@/components/sections/DigitalMatters";
import StrategyCall from "@/components/sections/StrategyCall";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";

export const metadata: Metadata = seoFor("/");

/** The homepage, section for section as the live site has it: hero, who we are, the four step process, why venues
 *  choose Revolt (the 3D ecosystem), why digital marketing matters, and the free strategy call. */
export default function Home() {
  return (
    <main id="main">
      <JsonLd route="/" />
      <Hero />
      <WhoWeAre />
      <FourStepProcess />
      <Ecosystem />
      <DigitalMatters />
      <StrategyCall />
    </main>
  );
}
