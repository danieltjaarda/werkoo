import type { Metadata } from "next";
import { DienstPagina } from "@/components/dienst-pagina";
import { videograaf } from "@/lib/diensten";
import { bepaalPlaats } from "@/lib/locatie";

function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? waarde[0] : waarde;
}

export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const { weergave, bron } = await bepaalPlaats(eerste((await searchParams).plaats));

  if (bron === "onbekend") {
    return {
      title: `${videograaf.naam} zoeken bij jou in de buurt`,
      description:
        "Vertel kort wat je zoekt en ontvang reacties van videografen uit je eigen regio. Gratis en zonder verplichtingen.",
    };
  }

  return {
    title: `${videograaf.naam} zoeken in ${weergave}`,
    description: `Vertel kort wat je zoekt en ontvang reacties van videografen uit de omgeving van ${weergave}. Gratis en zonder verplichtingen.`,
  };
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const plaats = await bepaalPlaats(eerste((await searchParams).plaats));

  return <DienstPagina dienst={videograaf} plaats={plaats.weergave} plaatsInvoer={plaats.invoer} />;
}
