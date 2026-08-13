import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DienstPagina } from "@/components/dienst-pagina";
import { getDienst } from "@/lib/diensten";
import { bepaalPlaats } from "@/lib/locatie";

/**
 * De landingspagina van één dienst. De plaats komt van de bezoeker zelf (url,
 * cookie of geo-header), dus deze pagina wordt per bezoeker gerenderd. De
 * variant met de plaats in het pad — /dakdekker/joure — blijft wél statisch en
 * is daarom de route voor zoekmachines en advertenties.
 */
function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? waarde[0] : waarde;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[dienst]">): Promise<Metadata> {
  const dienst = getDienst((await params).dienst);
  if (!dienst) return {};

  const { weergave, bron } = await bepaalPlaats(eerste((await searchParams).plaats));
  const alternates = { canonical: `/${dienst.slug}` };

  if (bron === "onbekend") {
    return {
      title: `${dienst.naam} zoeken bij jou in de buurt`,
      description: `Vertel kort wat je zoekt en ontvang reacties van ${dienst.meervoud} uit je eigen regio. Gratis en zonder verplichtingen.`,
      alternates,
    };
  }

  return {
    title: `${dienst.naam} zoeken in ${weergave}`,
    description: `Vertel kort wat je zoekt en ontvang reacties van ${dienst.meervoud} uit de omgeving van ${weergave}. Gratis en zonder verplichtingen.`,
    alternates,
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
