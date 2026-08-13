import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "@/components/chat-widget";
import { ArrowRightIcon } from "@/components/icons";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { categorieIconen, SlotCta } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categorieen, diensten, dienstenVanCategorie } from "@/lib/diensten";

export const metadata: Metadata = {
  title: `Alle ${diensten.length} diensten`,
  description: `Van dakdekker tot webdesigner: alle ${diensten.length} diensten waarvoor Werkoo vakmensen zoekt, gegroepeerd in ${categorieen.length} categorieën.`,
  alternates: { canonical: "/diensten" },
};

export default function DienstenOverzicht() {
  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1">
        <section className="sectie bg-brand-soft">
          <div className="container-page">
            <p className="font-display text-klein font-medium uppercase tracking-[0.14em] text-brand-deep">
              Diensten
            </p>
            <h1 className="mt-3 max-w-3xl text-balance font-display text-h1 text-ink">
              Alle {diensten.length} diensten waarvoor wij vakmensen zoeken
            </h1>
            <p className="mt-4 max-w-2xl text-lead text-ink-soft">
              Staat jouw klus er niet bij? Beschrijf hem alsnog in een aanvraag, dan kijken wij welke vakman
              erbij past.
            </p>
          </div>
        </section>

        <section className="sectie">
          <div className="container-page space-y-14">
            {categorieen.map((categorie) => {
              const lijst = dienstenVanCategorie(categorie.id);
              const Icoon = categorieIconen[categorie.id];

              return (
                <div key={categorie.id} id={categorie.slug} className="scroll-mt-32">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-lijn pb-5">
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand-deep">
                        <Icoon className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-display text-h3 text-ink">
                          <Link
                            href={`/diensten/${categorie.slug}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {categorie.titel}
                          </Link>
                        </h2>
                        <p className="mt-1.5 max-w-2xl text-basis text-ink-soft">{categorie.omschrijving}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-klein font-semibold text-brand-deep">
                      {lijst.length} diensten
                    </span>
                  </div>

                  <ul className="mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {lijst.map((dienst) => (
                      <li key={dienst.slug}>
                        <Link
                          href={`/${dienst.slug}`}
                          className="-mx-2 flex items-baseline justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-brand-soft"
                        >
                          <span className="text-basis text-ink">{dienst.menuLabel}</span>
                          <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-soft/50" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <SlotCta plaats="jouw regio" />
      </main>
      <SiteFooter />
      <ChatWidget />
    </PaginaOvergang>
  );
}
