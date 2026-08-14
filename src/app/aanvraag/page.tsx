import type { Metadata } from "next";
import { AanvraagKeuze } from "@/components/aanvraag-keuze";
import { AanvraagStappen } from "@/components/aanvraag-stappen";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteHeader } from "@/components/site-header";
import { bedrijfVanSlug, bedrijvenVoorDienst, bezetteDagen } from "@/lib/aanvragen";
import { huidigeGebruiker } from "@/lib/auth";
import { getDienst } from "@/lib/diensten";
import { bepaalPlaats } from "@/lib/locatie";

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

  if (!dienst) {
    return (
      <PaginaOvergang>
        <SiteHeader />
        <main className="flex-1">
          <AanvraagKeuze />
        </main>
      </PaginaOvergang>
    );
  }

  // Zonder dit staat het plaatsveld weer leeg zodra iemand vanaf een dienstpagina
  // doorklikt: de url draagt de plaats niet altijd mee, het cookie wel.
  const plaats = await bepaalPlaats(eerste(params.plaats));
  const gebruiker = await huidigeGebruiker();

  // De lijst en de bezette dagen komen uit de database; de flow zelf draait in
  // de browser en kan daar niet zelf bij.
  const gevonden = await bedrijvenVoorDienst(dienst.slug, plaats.invoer);
  const gekozenSlug = eerste(params.vakman);

  /**
   * De vakman waarop iemand klikte zoeken we los op, niet in de lijst hierboven:
   * die lijst hangt aan de plaats en kan hem missen als hij een werkgebied heeft
   * ingesteld. Hij komt vooraan te staan, want hij is degene die de bezoeker
   * koos — anders staat zijn naam in de zijkolom terwijl de aanvraag naar
   * iemand anders gaat.
   */
  const vakman = gekozenSlug ? await bedrijfVanSlug(gekozenSlug, dienst.slug) : undefined;
  const vakmensen = vakman
    ? [vakman, ...gevonden.filter((bedrijf) => bedrijf.slug !== vakman.slug)]
    : gevonden;
  const bezet = vakman ? await bezetteDagen(vakman.id) : [];

  return (
    <PaginaOvergang>
      <SiteHeader />
      {/* Geen voettekst: in de aanvraag hoort niets af te leiden van de vraag op het scherm. */}
      <main className="flex-1">
        <AanvraagStappen
          dienst={dienst}
          vakman={vakman}
          vakmensen={vakmensen}
          bezet={bezet}
          beginType={eerste(params.type)}
          beginPlaats={plaats.invoer}
          ingelogdAls={gebruiker ? { naam: gebruiker.naam, email: gebruiker.email, telefoon: gebruiker.telefoon } : null}
        />
      </main>
    </PaginaOvergang>
  );
}
