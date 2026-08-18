import { getCategorie, type Categorie, type Dienst, type Vraag } from "@/lib/diensten";
import type { Profiel } from "@/lib/aanvragen";
import { absoluut, CONTACT, SITE_NAAM } from "@/lib/site";

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

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Alleen eigen catalogusdata, geen invoer van bezoekers.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Wie we zijn en hoe de site heet — hoort op de homepage. Geen SearchAction:
 * /diensten heeft geen zoekparameter in de url, en beloven wat er niet is
 * levert alleen een waarschuwing in Search Console op.
 */
export function OrganisatieData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": absoluut("/#organisatie"),
            name: SITE_NAAM,
            url: absoluut("/"),
            logo: absoluut("/logo-werkoo.svg"),
            email: CONTACT.email,
            telephone: CONTACT.telefoonLink,
            areaServed: { "@type": "Country", name: "Nederland" },
          },
          {
            "@type": "WebSite",
            "@id": absoluut("/#website"),
            name: SITE_NAAM,
            url: absoluut("/"),
            inLanguage: "nl-NL",
            publisher: { "@id": absoluut("/#organisatie") },
          },
        ],
      }}
    />
  );
}

/** Kruimelpad plus de lijst met diensten van één categorie. */
export function CategorieData({ categorie, lijst }: { categorie: Categorie; lijst: Dienst[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluut("/") },
              { "@type": "ListItem", position: 2, name: "Alle diensten", item: absoluut("/diensten") },
              { "@type": "ListItem", position: 3, name: categorie.titel, item: absoluut(`/diensten/${categorie.slug}`) },
            ],
          },
          {
            "@type": "ItemList",
            name: categorie.titel,
            numberOfItems: lijst.length,
            itemListElement: lijst.map((dienst, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: dienst.menuLabel,
              url: absoluut(`/${dienst.slug}`),
            })),
          },
        ],
      }}
    />
  );
}

/**
 * Een bedrijfsprofiel als LocalBusiness. Het cijfer gaat alleen mee als er
 * echt beoordelingen zijn; een AggregateRating van 0 uit 0 is een reden voor
 * een handmatige actie in Search Console.
 */
export function ProfielData({
  profiel,
  diensten,
  kruimels,
}: {
  profiel: Profiel;
  diensten: Dienst[];
  kruimels: { naam: string; pad: string }[];
}) {
  const { bedrijf, plaatsen } = profiel;
  const url = absoluut(`/vakman/${bedrijf.slug}`);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: kruimels.map((k, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: k.naam,
              item: absoluut(k.pad),
            })),
          },
          {
            "@type": "LocalBusiness",
            "@id": `${url}#bedrijf`,
            name: bedrijf.naam,
            url,
            ...(bedrijf.tekst ? { description: bedrijf.tekst } : {}),
            ...(bedrijf.foto ? { image: absoluut(bedrijf.foto) } : {}),
            ...(bedrijf.telefoon ? { telephone: bedrijf.telefoon } : {}),
            ...(bedrijf.plaats || bedrijf.adres
              ? {
                  address: {
                    "@type": "PostalAddress",
                    ...(bedrijf.adres ? { streetAddress: bedrijf.adres } : {}),
                    ...(bedrijf.plaats ? { addressLocality: bedrijf.plaats } : {}),
                    addressCountry: "NL",
                  },
                }
              : {}),
            ...(plaatsen.length ? { areaServed: plaatsen.map((p) => ({ "@type": "City", name: p })) } : {}),
            ...(diensten.length
              ? {
                  hasOfferCatalog: {
                    "@type": "OfferCatalog",
                    name: "Diensten",
                    itemListElement: diensten.map((d) => ({
                      "@type": "Offer",
                      itemOffered: { "@type": "Service", name: d.naam, url: absoluut(`/${d.slug}`) },
                    })),
                  },
                }
              : {}),
            ...(bedrijf.reviews > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: bedrijf.score,
                    reviewCount: bedrijf.reviews,
                    bestRating: 10,
                    worstRating: 1,
                  },
                }
              : {}),
          },
        ],
      }}
    />
  );
}
