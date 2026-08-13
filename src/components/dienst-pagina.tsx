import { ChatWidget } from "@/components/chat-widget";
import { CijferBalk } from "@/components/cijfer-balk";
import { Hero } from "@/components/hero";
import { PaginaOvergang } from "@/components/pagina-overgang";
import {
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
import type { Dienst } from "@/lib/diensten";

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

  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1">
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
        <SlotCta dienst={dienst} plaats={plaats} />
      </main>
      <SiteFooter />
      <ChatWidget />
      <GestructureerdeData dienst={dienst} plaats={plaats} pad={pad} vragen={vragen} />
    </PaginaOvergang>
  );
}
