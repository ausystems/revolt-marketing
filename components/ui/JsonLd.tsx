import { jsonLdFor } from "@/lib/seo";

/** The live site's structured data for this route, as JSON-LD. */
export default function JsonLd({ route }: { route: string }) {
  return (
    <>
      {jsonLdFor(route).map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
    </>
  );
}
