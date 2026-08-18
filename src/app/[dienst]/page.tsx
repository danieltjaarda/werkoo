import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DienstPagina } from "@/components/dienst-pagina";
import { getDienst } from "@/lib/diensten";
import { bepaalPlaats } from "@/lib/locatie";
import { normaliseerPlaats } from "@/lib/plaatsen";

/**
 * De landingspagina van één dienst. De plaats komt van de bezoeker zelf (url,
 * cookie of geo-header), dus deze pagina wordt per bezoeker gerenderd. De
 * variant met de plaats in het pad — /dakdekker/joure — blijft wél statisch en
 * is daarom de route voor zoekmachines en advertenties.
 */
function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? waarde[0] : waarde;
}

/**
 * Zie de opmerking bij de homepage: de plaats uit het ip-adres blijft uit de
 * titel en beschrijving, anders indexeert een crawler een toevallige plaats
 * op de landelijke dienstpagina. De pagina's mét plaats in het pad zijn er
 * juist voor het lokale zoekverkeer.
 */
export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[dienst]">): Promise<Metadata> {
  const dienst = getDienst((await params).dienst);
  if (!dienst) return {};

  const uitUrl = normaliseerPlaats(eerste((await searchParams).plaats));
  const waar = uitUrl ? `in ${uitUrl}` : "bij jou in de buurt";
  const regio = uitUrl ? `uit de omgeving van ${uitUrl}` : "uit je eigen regio";
  const title = `${dienst.naam} zoeken ${waar}`;
  const description = `Vertel kort wat je zoekt en ontvang reacties van ${dienst.meervoud} ${regio}. Gratis en zonder verplichtingen.`;

  return {
    title,
    description,
    alternates: { canonical: `/${dienst.slug}` },
    openGraph: { title, description, url: `/${dienst.slug}` },
  };
}

export default async function DienstLanding({ params, searchParams }: PageProps<"/[dienst]">) {
  const dienst = getDienst((await params).dienst);
  if (!dienst) notFound();

  const plaats = await bepaalPlaats(eerste((await searchParams).plaats));

  return (
    <DienstPagina
      dienst={dienst}
      plaats={plaats.weergave}
      plaatsInvoer={plaats.invoer}
      pad={`/${dienst.slug}`}
    />
  );
}
