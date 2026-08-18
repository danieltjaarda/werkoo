import { ChatWidget } from "@/components/chat-widget";
import { CijferBalk } from "@/components/cijfer-balk";
import { Hero } from "@/components/hero";
import { Kruimelpad } from "@/components/kruimelpad";
import { PaginaOvergang } from "@/components/pagina-overgang";
import {
  AnderePlaatsen,
  Beoordelingen,
  Faq,
  HoeHetWerkt,
  Prijsindicatie,
  SlotCta,
  TopLijst,
  VerwanteDiensten,
  Voordelen,
  WaarOpLetten,
} from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GestructureerdeData } from "@/components/structured-data";
import { vragenVoorDienst } from "@/lib/content";
import { getCategorie, type Dienst } from "@/lib/diensten";

export function DienstPagina({
  dienst,
  plaats,
  plaatsInvoer = "",
  pad,
}: {
  dienst: Dienst;
  /** Plaatsnaam zoals hij in de teksten staat. */
  plaats: string;
  /** Voorgevulde waarde van het plaatsveld; leeg als we de plaats niet zeker weten. */
  plaatsInvoer?: string;
  /** Pad van deze pagina, voor het kruimelpad in de gestructureerde data. */
  pad: string;
}) {
  const vragen = vragenVoorDienst(dienst);
  const categorie = getCategorie(dienst.categorie);
  const opPlaats = pad.split("/").length > 2;
  const kruimels = [
    { naam: "Home", pad: "/" },
    { naam: categorie.titel, pad: `/diensten/${categorie.slug}` },
    { naam: dienst.menuLabel, pad: `/${dienst.slug}` },
    ...(opPlaats ? [{ naam: plaats, pad }] : []),
  ];

  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1">
        <div className="bg-hero">
          <div className="container-page pt-5">
            <Kruimelpad kruimels={kruimels} />
          </div>
        </div>
        <Hero dienst={dienst} plaats={plaats} plaatsInvoer={plaatsInvoer} />
        <CijferBalk />
        <TopLijst dienst={dienst} plaats={plaats} />
        <HoeHetWerkt />
        <Prijsindicatie dienst={dienst} />
        <WaarOpLetten dienst={dienst} />
        <Voordelen dienstSlug={dienst.slug} />
        <Beoordelingen dienstSlug={dienst.slug} />
        <Faq vragen={vragen} />
        <VerwanteDiensten dienst={dienst} />
        <AnderePlaatsen dienst={dienst} huidige={opPlaats ? plaats : ""} />
        <SlotCta dienst={dienst} plaats={plaats} />
      </main>
      <SiteFooter />
      <ChatWidget dienst={dienst.slug} />
      <GestructureerdeData dienst={dienst} plaats={plaats} pad={pad} vragen={vragen} />
    </PaginaOvergang>
  );
}
