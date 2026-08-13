import Image from "next/image";
import { CheckIcon, KeurmerkIcon, Squiggle } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { Rating } from "@/components/rating";
import type { Dienst } from "@/lib/diensten";

export function Hero({
  dienst,
  plaats,
  plaatsInvoer,
}: {
  dienst: Dienst;
  plaats: string;
  plaatsInvoer: string;
}) {
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
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft py-1.5 pl-2 pr-3.5 text-[13px] font-semibold text-brand-deep">
            <KeurmerkIcon className="h-5 w-5 text-brand" />
            Gratis aanvraag, geen abonnement
          </p>

          <h1 className="mt-5 font-display text-[34px] font-bold leading-[1.18] tracking-[-0.02em] text-ink sm:text-[46px]">
            De{" "}
            <span className="font-serif font-medium italic">{dienst.naam.toLowerCase()}</span> in{" "}
            <span className="relative inline-block whitespace-nowrap">
              {plaats}
              {/* Hoogte en afstand in em, niet in px: de kop groeit van 34 naar 46px en
                  met vaste pixels zakt de streep op mobiel dwars door de letters heen. */}
              <Squiggle className="absolute bottom-0 left-0 h-[0.19em] w-full text-turquoise" />
            </span>{" "}
            die bij jouw verhaal past
          </h1>

          <div className="mt-7">
            <LeadForm dienst={dienst} plaats={plaatsInvoer} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-soft">
            <span className="flex items-center gap-2">
              <Rating score={9.4} />
              <strong className="font-semibold text-ink">9,4</strong> uit 4.384 beoordelingen
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-brand" />
              Meestal 3 reacties binnen een dag
            </span>
          </div>
        </div>

        <div className="relative flex justify-center lg:h-full lg:justify-end lg:self-stretch">
          <Image
            src="/images/videograaf.png"
            alt={`${dienst.naam} met camera op statief`}
            width={1200}
            height={1419}
            priority
            sizes="(min-width: 1024px) 520px, 80vw"
            className="h-auto w-[280px] sm:w-[360px] lg:h-full lg:w-full lg:object-contain lg:object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
