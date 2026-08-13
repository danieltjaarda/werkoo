import { getCategorie, type Dienst, type Vraag } from "@/lib/diensten";
import { absoluut, SITE_NAAM } from "@/lib/site";

/**
 * Gestructureerde data voor een dienstpagina: het kruimelpad, de dienst zelf en
 * de vragenlijst. Google mag de vragen alleen als rich result tonen als ze ook
 * echt op de pagina staan — dat is hier zo, ze staan in de uitklappers.
 */
export function GestructureerdeData({
  dienst,
  plaats,
  pad,
  vragen,
}: {
  dienst: Dienst;
  plaats: string;
  pad: string;
  vragen: Vraag[];
}) {
  const categorie = getCategorie(dienst.categorie);
  const opPlaats = pad.split("/").length > 2;

  const kruimels = [
    { naam: "Home", pad: "/" },
    { naam: categorie.titel, pad: `/diensten/${categorie.slug}` },
    { naam: dienst.menuLabel, pad: `/${dienst.slug}` },
    ...(opPlaats ? [{ naam: plaats, pad }] : []),
  ];

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: kruimels.map((kruimel, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: kruimel.naam,
          item: absoluut(kruimel.pad),
        })),
      },
      {
        "@type": "Service",
        name: `${dienst.naam} inhuren${opPlaats ? ` in ${plaats}` : ""}`,
        serviceType: dienst.naam,
        description: dienst.intro,
        areaServed: opPlaats ? { "@type": "City", name: plaats } : { "@type": "Country", name: "Nederland" },
        provider: {
          "@type": "Organization",
          name: SITE_NAAM,
          url: absoluut("/"),
        },
        url: absoluut(pad),
      },
      {
        "@type": "FAQPage",
        mainEntity: vragen.map((vraag) => ({
          "@type": "Question",
          name: vraag.vraag,
          acceptedAnswer: { "@type": "Answer", text: vraag.antwoord },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // De inhoud komt uit onze eigen catalogus, niet uit invoer van een bezoeker.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
