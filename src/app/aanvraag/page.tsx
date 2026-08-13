import type { Metadata } from "next";
import { AanvraagKeuze } from "@/components/aanvraag-keuze";
import { AanvraagStappen } from "@/components/aanvraag-stappen";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteHeader } from "@/components/site-header";
import { getDienst } from "@/lib/diensten";
import { bepaalPlaats } from "@/lib/locatie";
import { vakmanVanSlug } from "@/lib/vakmensen";

export const metadata: Metadata = {
  title: "Beschrijf je klus",
  description:
    "Beantwoord een paar korte vragen en ontvang reacties van vakmensen uit je eigen regio. Gratis en zonder verplichtingen.",
  // De flow hoort niet in de zoekresultaten; de dienstpagina's zijn de ingang.
  robots: { index: false, follow: true },
};

function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? (waarde[0] ?? "") : (waarde ?? "");
}

export default async function AanvraagPagina({ searchParams }: PageProps<"/aanvraag">) {
  const params = await searchParams;
  const dienst = getDienst(eerste(params.dienst));

  // Zonder dit staat het plaatsveld weer leeg zodra iemand vanaf een dienstpagina
  // doorklikt: de url draagt de plaats niet altijd mee, het cookie wel.
  const plaats = await bepaalPlaats(eerste(params.plaats));

  return (
    <PaginaOvergang>
      <SiteHeader />
      {/* Geen voettekst: in de aanvraag hoort niets af te leiden van de vraag op het scherm. */}
      <main className="flex-1">
        {dienst ? (
          <AanvraagStappen
            dienst={dienst}
            vakman={vakmanVanSlug(eerste(params.vakman), dienst.slug)}
            beginType={eerste(params.type)}
            beginPlaats={plaats.invoer}
          />
        ) : (
          <AanvraagKeuze />
        )}
      </main>
    </PaginaOvergang>
  );
}
