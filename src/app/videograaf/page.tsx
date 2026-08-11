import type { Metadata } from "next";
import { DienstPagina } from "@/components/dienst-pagina";
import { videograaf } from "@/lib/diensten";
import { bepaalPlaats } from "@/lib/locatie";

export const metadata: Metadata = {
  title: `${videograaf.naam} zoeken bij jou in de buurt`,
  description:
    "Vertel kort wat je zoekt en ontvang reacties van videografen uit je eigen regio. Gratis en zonder verplichtingen.",
};

export default async function VideograafPagina() {
  const plaats = await bepaalPlaats();

  return <DienstPagina dienst={videograaf} plaats={plaats.weergave} plaatsInvoer={plaats.invoer} />;
}
