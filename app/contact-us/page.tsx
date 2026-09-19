import type { Metadata } from "next";
import ContactPage from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: { absolute: "Contact Us | Revolt" },
  description: "Get in touch with our Golf Simulator Marketing team in North America to discuss your business goals. Whether you want a free consultation or a detailed marketing strategy, we’re here to help.",
  alternates: { canonical: "/contact-us" },
};

export default function Page() {
  return <ContactPage />;
}
