import type { Metadata } from "next";
import ServicesPage from "@/components/pages/ServicesPage";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";

export const metadata: Metadata = seoFor("/services");

export default function Page() {
  return (
    <>
      <JsonLd route="/services" />
      <ServicesPage />
    </>
  );
}
