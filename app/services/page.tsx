import type { Metadata } from "next";
import ServicesPage from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: { absolute: "Our Services | Revolt" },
  description: "Explore Revolt’s complete marketing services for golf simulator businesses—SEO, automation, ads, branding, and growth systems tailored to scale.",
  alternates: { canonical: "/services" },
};

export default function Page() {
  return <ServicesPage />;
}
