import type { Metadata } from "next";
import { DienstPagina } from "@/components/dienst-pagina";
import { videograaf } from "@/lib/diensten";
import { plaatsen, plaatsnaamVanSlug, slugVanPlaatsnaam } from "@/lib/plaatsen";

/** De plaatsen die we kennen worden bij de build al gebouwd; de rest op aanvraag. */
export function generateStaticParams() {
  return plaatsen.map((plaats) => ({ plaats: slugVanPlaatsnaam(plaats) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/videograaf/[plaats]">): Promise<Metadata> {
  const { plaats } = await params;
  const plaatsnaam = plaatsnaamVanSlug(plaats);

  return {
    title: `${videograaf.naam} zoeken in ${plaatsnaam}`,
    description: `Vertel kort wat je zoekt en ontvang reacties van videografen uit de omgeving van ${plaatsnaam}. Gratis en zonder verplichtingen.`,
    alternates: { canonical: `/videograaf/${plaats}` },
  };
}

export default async function VideograafPlaatsPagina({
  params,
}: PageProps<"/videograaf/[plaats]">) {
  const { plaats } = await params;
  const plaatsnaam = plaatsnaamVanSlug(plaats);

  return <DienstPagina dienst={videograaf} plaats={plaatsnaam} plaatsInvoer={plaatsnaam} />;
}
