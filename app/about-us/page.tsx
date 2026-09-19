import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: { absolute: "About Us | Revolt" },
  description: "Meet the two founders of Revolt Marketing, Shayne Mueller and Tristan Costa: a marketing firm built exclusively for golf simulator venues across North America.",
  alternates: { canonical: "/about-us" },
};

export default function Page() {
  return <AboutPage />;
}
