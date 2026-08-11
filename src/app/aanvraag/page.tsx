import type { Metadata } from "next";
import Link from "next/link";
import { AanvraagStappen } from "@/components/aanvraag-stappen";
import { ArrowLeftIcon } from "@/components/icons";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
      <main className="flex-1 bg-brand-soft py-14 sm:py-18">
        <div className="mx-auto w-full max-w-3xl px-5">
          <Link
            href="/"
            transitionTypes={["nav-terug"]}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink-soft transition hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Terug naar zoeken
          </Link>

          <h1 className="mt-5 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[38px]">
            Vertel wat je zoekt
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            Vier korte stappen, samen nog geen minuut werk. Daarna leggen we je vraag voor aan videografen die op dat
            moment vrij zijn.
          </p>

          <div className="mt-8">
            <AanvraagStappen
              dienst={videograaf}
              beginType={eerste(params.type)}
              beginPlaats={eerste(params.plaats)}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </PaginaOvergang>
  );
}
