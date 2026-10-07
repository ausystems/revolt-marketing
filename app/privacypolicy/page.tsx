import type { Metadata } from "next";
import { richPage } from "@/content/live";
import PrivacyPage from "@/components/pages/PrivacyPage";
import JsonLd from "@/components/ui/JsonLd";
import { seoFor } from "@/lib/seo";

export const metadata: Metadata = seoFor("/privacypolicy");

export default function Page() {
  return (
    <>
      <JsonLd route="/privacypolicy" />
      <PrivacyPage page={richPage("/privacypolicy")!} />
    </>
  );
}
