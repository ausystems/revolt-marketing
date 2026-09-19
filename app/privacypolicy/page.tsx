import type { Metadata } from "next";
import privacy from "@/content/privacy.json";
import PrivacyPage from "@/components/pages/PrivacyPage";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Revolt" },
  description: "How Revolt Creative Marketing collects, uses and protects personal information.",
  alternates: { canonical: "/privacypolicy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <PrivacyPage policy={privacy} />;
}
