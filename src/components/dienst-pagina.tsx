import { ChatWidget } from "@/components/chat-widget";
import { CijferBalk } from "@/components/cijfer-balk";
import { Hero } from "@/components/hero";
import { Beoordelingen, Faq, HoeHetWerkt, SlotCta, TopLijst, Voordelen } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Dienst } from "@/lib/diensten";

export function DienstPagina({
  dienst,
  plaats,
  plaatsInvoer = "",
}: {
  dienst: Dienst;
  /** Plaatsnaam zoals hij in de teksten staat. */
  plaats: string;
  /** Voorgevulde waarde van het plaatsveld; leeg als we de plaats niet zeker weten. */
  plaatsInvoer?: string;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero dienst={dienst} plaats={plaats} plaatsInvoer={plaatsInvoer} />
        <CijferBalk />
        <HoeHetWerkt />
        <Voordelen />
        <TopLijst plaats={plaats} />
        <Beoordelingen />
        <Faq />
        <SlotCta plaats={plaats} />
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
