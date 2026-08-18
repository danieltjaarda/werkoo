import Image from "next/image";
import { CheckIcon, KeurmerkIcon, Squiggle } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { Rating } from "@/components/rating";
import { deelLidwoord, metHoofdletter, type Dienst } from "@/lib/diensten";

function Kop({ dienst, plaats, gecentreerd }: { dienst: Dienst; plaats: string; gecentreerd: boolean }) {
  const { lidwoord, naam } = deelLidwoord(dienst);

  return (
    <h1 className={`font-display text-h1 text-ink ${gecentreerd ? "mx-auto max-w-3xl text-balance" : ""}`}>
      {metHoofdletter(lidwoord)} <span className="font-serif font-medium italic">{naam}</span> in{" "}
      <span className="relative inline-block whitespace-nowrap">
        {plaats}
        {/* Hoogte en afstand in em, niet in px: de kop groeit mee met het scherm en
            met vaste pixels zakt de streep op mobiel dwars door de letters heen. */}
        <Squiggle className="absolute bottom-0 left-0 h-[0.19em] w-full text-turquoise" />
      </span>{" "}
      {dienst.kopStaart}
    </h1>
  );
}

function Pil() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft py-1.5 pl-2 pr-3.5 text-klein font-semibold text-brand-deep">
      <KeurmerkIcon className="h-5 w-5 text-brand" />
      Gratis aanvraag, geen abonnement
    </p>
  );
}

function Vertrouwen({ gecentreerd }: { gecentreerd: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-6 gap-y-3 text-klein text-ink-soft ${
        gecentreerd ? "justify-center" : ""
      }`}
    >
      <span className="flex items-center gap-2">
        <Rating score={9.4} />
        <strong className="font-semibold text-ink">9,4</strong> uit 4.384 beoordelingen
      </span>
      <span className="flex items-center gap-2">
        <CheckIcon className="h-4 w-4 text-brand" />
        Meestal 3 reacties binnen een dag
      </span>
    </div>
  );
}

export function Hero({
  dienst,
  plaats,
  plaatsInvoer,
}: {
  dienst: Dienst;
  plaats: string;
  plaatsInvoer: string;
}) {
  // Zonder uitgesneden foto staat de hero gecentreerd: dan is het formulier het
  // middelpunt in plaats van een half lege rechterkolom.
  if (!dienst.foto) {
    return (
      <section className="relative overflow-x-clip bg-hero">
        {/* Zachte gloed achter de kop. Een cirkel met een rand zou als vorm gaan
            leven; een radiaal verloop dooft uit en blijft achtergrond. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-[34rem] bg-[radial-gradient(65%_100%_at_50%_0%,color-mix(in_oklab,var(--color-brand)_18%,transparent)_0%,transparent_70%)] lg:block"
        />

        <div className="container-page relative flex flex-col items-center gap-7 pb-[var(--ruimte-sectie)] pt-12 text-center lg:pt-16">
          <Pil />
          <Kop dienst={dienst} plaats={plaats} gecentreerd />
          <p className="max-w-2xl text-lead text-ink-soft">{dienst.intro}</p>

          <div className="w-full max-w-2xl text-left">
            <LeadForm dienst={dienst} plaats={plaatsInvoer} />
          </div>

          <Vertrouwen gecentreerd />
        </div>
      </section>
    );
  }

  return (
    // overflow-x-clip houdt de vlek binnen beeld, maar laat de suggestielijst
    // onder het plaatsveld wel naar buiten steken.
    <section className="relative overflow-x-clip bg-hero">
      {/* Zachte vlek achter de foto, in de kleuren van het logo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 hidden h-[680px] w-[680px] rounded-full bg-gradient-to-br from-brand-soft via-brand-soft to-white lg:block"
      />

      <div className="hero-vlak container-page relative grid items-end gap-10 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-0">
        <div className="max-w-[600px] pb-12 lg:self-center lg:py-12">
          <Pil />

          <div className="mt-5">
            <Kop dienst={dienst} plaats={plaats} gecentreerd={false} />
          </div>

          <div className="mt-7">
            <LeadForm dienst={dienst} plaats={plaatsInvoer} />
          </div>

          <div className="mt-6">
            <Vertrouwen gecentreerd={false} />
          </div>
        </div>

        <div className="relative flex justify-center lg:h-full lg:justify-end lg:self-stretch">
          <Image
            src={dienst.foto}
            alt={`${dienst.naam} aan het werk`}
            width={1200}
            height={1419}
            // `priority` is in Next 16 vervangen door `preload`; dit is de LCP-afbeelding.
            preload
            sizes="(min-width: 1024px) 520px, (min-width: 640px) 360px, 280px"
            className="h-auto w-[280px] sm:w-[360px] lg:h-full lg:w-full lg:object-contain lg:object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
