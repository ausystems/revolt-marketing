import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import WhoWeAre from "@/components/sections/WhoWeAre";
import Systems from "@/components/sections/Systems";
import Ecosystem from "@/components/sections/Ecosystem";
import WhyRevolt from "@/components/sections/WhyRevolt";
import Journey from "@/components/sections/Journey";
import StrategyCall from "@/components/sections/StrategyCall";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: site.seo.title },
  description: site.seo.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <WhoWeAre />
      <Systems />
      <Ecosystem />
      <WhyRevolt />
      <Journey />
      <StrategyCall />
    </main>
  );
}
