import type { Metadata } from "next";
import { AanvraagStappen } from "@/components/aanvraag-stappen";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteHeader } from "@/components/site-header";
import { vakmanVanSlug } from "@/lib/content";
import { videograaf } from "@/lib/diensten";

export const metadata: Metadata = {
  title: "Beschrijf je klus",
  description: "Beantwoord een paar korte vragen en ontvang reacties van videografen uit je eigen regio.",
};

function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? (waarde[0] ?? "") : (waarde ?? "");
}

export default async function AanvraagPagina({ searchParams }: PageProps<"/aanvraag">) {
  const params = await searchParams;

  return (
    <PaginaOvergang>
      <SiteHeader />
      {/* Geen voettekst: in de aanvraag hoort niets af te leiden van de vraag op het scherm. */}
      <main className="flex-1">
        <AanvraagStappen
          dienst={videograaf}
          vakman={vakmanVanSlug(eerste(params.vakman))}
          beginType={eerste(params.type)}
          beginPlaats={eerste(params.plaats)}
        />
      </main>
    </PaginaOvergang>
  );
}
