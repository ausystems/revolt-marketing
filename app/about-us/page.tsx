import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";

export const metadata: Metadata = seoFor("/about-us");

export default function Page() {
  return (
    <>
      <JsonLd route="/about-us" />
      <AboutPage />
    </>
  );
}
