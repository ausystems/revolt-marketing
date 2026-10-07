import type { Metadata } from "next";
import ContactPage from "@/components/pages/ContactPage";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";

export const metadata: Metadata = seoFor("/contact-us");

export default function Page() {
  return (
    <>
      <JsonLd route="/contact-us" />
      <ContactPage />
    </>
  );
}
