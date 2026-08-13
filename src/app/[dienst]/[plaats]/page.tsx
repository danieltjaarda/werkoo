import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DienstPagina } from "@/components/dienst-pagina";
import { diensten, getDienst } from "@/lib/diensten";
import { bekendePlaats, plaatsen, slugVanPlaatsnaam } from "@/lib/plaatsen";
import { heeftProfielen } from "@/lib/vakmensen";

/**
 * We bouwen bij de build alleen de combinaties waar we ook echt vakmensen voor
 * hebben staan; 87 diensten maal 40 plaatsen zou de build onnodig opblazen. De
 * rest wordt bij het eerste bezoek gerenderd en daarna bewaard.
 */
export function generateStaticParams() {
  return diensten
    .filter((dienst) => heeftProfielen(dienst.slug))
    .flatMap((dienst) =>
      plaatsen.map((plaats) => ({ dienst: dienst.slug, plaats: slugVanPlaatsnaam(plaats) })),
    );
}

/** Zoekt dienst en plaats op; allebei moeten wij ze kennen, anders is het geen pagina. */
async function bepaalPagina(params: Promise<{ dienst: string; plaats: string }>) {
  const { dienst: dienstSlug, plaats: plaatsSlug } = await params;
  const dienst = getDienst(dienstSlug);
  const plaatsnaam = bekendePlaats(decodeURIComponent(plaatsSlug));

  if (!dienst || !plaatsnaam) return null;

  // Het pad komt uit de opgezochte naam en niet uit het ruwe url-segment:
  // /videograaf/JOURE en /videograaf/joure horen dezelfde canonical te krijgen.
  return { dienst, plaatsnaam, pad: `/${dienst.slug}/${slugVanPlaatsnaam(plaatsnaam)}` };
}

export async function generateMetadata({ params }: PageProps<"/[dienst]/[plaats]">): Promise<Metadata> {
  const pagina = await bepaalPagina(params);
  if (!pagina) return {};

  const { dienst, plaatsnaam, pad } = pagina;

  return {
    title: `${dienst.naam} zoeken in ${plaatsnaam}`,
    description: `Vertel kort wat je zoekt en ontvang reacties van ${dienst.meervoud} uit de omgeving van ${plaatsnaam}. Gratis en zonder verplichtingen.`,
    alternates: { canonical: pad },
  };
}

export default async function DienstPlaatsPagina({ params }: PageProps<"/[dienst]/[plaats]">) {
  const pagina = await bepaalPagina(params);
  if (!pagina) notFound();

  return (
    <DienstPagina
      dienst={pagina.dienst}
      plaats={pagina.plaatsnaam}
      plaatsInvoer={pagina.plaatsnaam}
      pad={pagina.pad}
    />
  );
}
