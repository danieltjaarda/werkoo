import Image from "next/image";
import { CheckIcon, KeurmerkIcon, Squiggle, StarIcon } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
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
    <section className="relative overflow-hidden bg-hero">
      {/* Zachte vlek achter de foto, in de kleuren van het logo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 hidden h-[680px] w-[680px] rounded-full bg-gradient-to-br from-brand-soft via-brand-soft to-white lg:block"
      />

      <div className="container-page relative grid items-end gap-10 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-16">
        <div className="max-w-[600px] pb-12 lg:pb-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft py-1.5 pl-2 pr-3.5 text-[13px] font-semibold text-brand-deep">
            <KeurmerkIcon className="h-5 w-5 text-brand" />
            Gratis aanvraag, geen abonnement
          </p>

          <h1 className="mt-5 font-display text-[34px] font-bold leading-[1.18] tracking-[-0.02em] text-ink sm:text-[46px]">
            De {dienst.naam.toLowerCase()} in{" "}
            <span className="relative inline-block whitespace-nowrap">
              {plaats}
              <Squiggle className="absolute bottom-0.5 left-0 h-2.5 w-full text-turquoise" />
            </span>{" "}
            die bij jouw verhaal past
          </h1>

          <div className="mt-7">
            <LeadForm dienst={dienst} plaats={plaatsInvoer} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-soft">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-zon">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} className="h-4 w-4" />
                ))}
              </span>
              <strong className="font-semibold text-ink">4,7</strong> uit 4.384 beoordelingen
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-brand" />
              Meestal 3 reacties binnen een dag
            </span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <Image
            src="/images/videograaf.png"
            alt={`${dienst.naam} met camera op statief`}
            width={1200}
            height={1419}
            priority
            sizes="(min-width: 1024px) 520px, 80vw"
            className="h-auto w-[280px] sm:w-[360px] lg:h-[600px] lg:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
