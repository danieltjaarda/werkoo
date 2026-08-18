import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChatWidget } from "@/components/chat-widget";
import { CijferBalk } from "@/components/cijfer-balk";
import { OpdrachtVlak } from "@/components/opdracht-vlak";
import { ArrowRightIcon, CheckIcon, KeurmerkIcon } from "@/components/icons";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { Rating } from "@/components/rating";
import {
  Beoordelingen,
  CategorieRaster,
  Faq,
  HoeHetWerkt,
  SectionTitle,
  SlotCta,
  Voordelen,
} from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { algemeneVragen } from "@/lib/content";
import { diensten } from "@/lib/diensten";
import { bepaalPlaats } from "@/lib/locatie";
import { normaliseerPlaats } from "@/lib/plaatsen";
import { OrganisatieData } from "@/components/structured-data";

function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? waarde[0] : waarde;
}

/**
 * De titel en beschrijving zijn bewust níét afhankelijk van het ip-adres van
 * de bezoeker: een crawler uit Nederland zou anders "Vakmensen zoeken in
 * Bolsward" indexeren voor de homepage van heel Nederland, en een gedeelde
 * link kreeg de plaats van degene die hem deelde. Alleen een plaats die
 * expliciet in de url staat mag de titel kleuren; de canonical blijft "/".
 */
export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const uitUrl = normaliseerPlaats(eerste((await searchParams).plaats));
  const waar = uitUrl ? `in ${uitUrl}` : "bij jou in de buurt";
  const regio = uitUrl ? `uit de omgeving van ${uitUrl}` : "uit je eigen regio";
  const title = `Vakmensen zoeken ${waar}`;
  const description = `Beschrijf je klus en ontvang reacties van vakmensen ${regio}. ${diensten.length} diensten, gratis en zonder verplichtingen.`;

  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/" },
  };
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const plaats = await bepaalPlaats(eerste((await searchParams).plaats));

  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-x-clip bg-hero">
          {/* Zie hero.tsx: radiaal verloop in plaats van een cirkel met een rand. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-[34rem] bg-[radial-gradient(65%_100%_at_50%_0%,color-mix(in_oklab,var(--color-brand)_18%,transparent)_0%,transparent_70%)] lg:block"
          />

          <div className="container-page relative flex flex-col items-center gap-5 pb-[var(--ruimte-sectie)] pt-6 text-center lg:gap-6 lg:pt-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft py-1.5 pl-2 pr-3.5 text-klein font-semibold text-brand-deep">
              <KeurmerkIcon className="h-5 w-5 text-brand" />
              Gratis aanvraag, geen abonnement
            </p>

            <h1 className="mx-auto max-w-3xl text-balance font-display text-h1 text-ink">
              Vakmensen in{" "}
              <span className="font-serif font-medium italic">{plaats.weergave}</span> die bij jouw klus
              passen
            </h1>

            <p className="max-w-3xl text-balance text-lead text-ink-soft">
              Eén aanvraag, meerdere reacties uit je eigen regio, en jij kiest.
            </p>

            <OpdrachtVlak beginPlaats={plaats.invoer} />

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-klein text-ink-soft">
              <span className="flex items-center gap-2">
                <Rating score={9.4} />
                <strong className="font-semibold text-ink">9,4</strong> uit 4.384 beoordelingen
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-brand" />
                Meestal 3 reacties binnen een dag
              </span>
            </div>

            {/*
              De vakmensen zelf, groot en meteen zichtbaar: de foto staat onder
              het zoekvlak zodat hij de aandacht niet van de invoer wegtrekt,
              maar wel boven de vouw meekomt. Op mobiel schaalt hij mee en
              schuift hij iets buiten de marge, zodat de gezichten groot blijven.
            */}
            <div className="-mx-4 mt-2 w-[calc(100%+2rem)] sm:mx-0 sm:mt-4 sm:w-full">
              <Image
                src="/images/beroepen-groep.webp"
                alt="Een timmerman, schilder, zonnepaneelmonteur, loodgieter, makelaar, schoonmaker en fotograaf die via Werkoo werk aannemen"
                width={2000}
                height={942}
                sizes="(min-width: 1280px) 1120px, 100vw"
                className="h-auto w-full"
                preload
              />
            </div>
          </div>
        </section>

        <CijferBalk />

        <section className="sectie">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle
                eyebrow="Alle diensten"
                titel="Waar zoek je iemand voor?"
                tekst="Zes categorieën, van een lekkend dak tot een nieuwe website. Kies er een of typ hierboven waar je naar op zoek bent."
              />
              <Link
                href="/diensten"
                className="flex items-center gap-2 text-basis font-semibold text-brand-deep underline-offset-4 hover:underline"
              >
                Bekijk alle {diensten.length} diensten
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10">
              <CategorieRaster />
            </div>
          </div>
        </section>

        <HoeHetWerkt />
        <Voordelen />
        <Beoordelingen />
        <Faq vragen={algemeneVragen} />
        <SlotCta plaats={plaats.weergave} />
      </main>
      <SiteFooter />
      <ChatWidget />
      <OrganisatieData />
    </PaginaOvergang>
  );
}
