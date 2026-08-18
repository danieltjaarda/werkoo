import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget";
import { ArrowRightIcon } from "@/components/icons";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { categorieIconen, HoeHetWerkt, SlotCta } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CategorieData } from "@/components/structured-data";
import { categorieen, dienstenVanCategorie, getCategorieVanSlug } from "@/lib/diensten";

export function generateStaticParams() {
  return categorieen.map((categorie) => ({ categorie: categorie.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/diensten/[categorie]">): Promise<Metadata> {
  const categorie = getCategorieVanSlug((await params).categorie);
  if (!categorie) return {};

  const aantal = dienstenVanCategorie(categorie.id).length;

  return {
    title: `${categorie.titel} — ${aantal} diensten`,
    description: `${categorie.omschrijving} Doe één gratis aanvraag en ontvang reacties van vakmensen uit je eigen regio.`,
    alternates: { canonical: `/diensten/${categorie.slug}` },
  };
}

export default async function CategoriePagina({ params }: PageProps<"/diensten/[categorie]">) {
  const categorie = getCategorieVanSlug((await params).categorie);
  if (!categorie) notFound();

  const lijst = dienstenVanCategorie(categorie.id);
  const Icoon = categorieIconen[categorie.id];

  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1">
        <section className="sectie bg-brand-soft">
          <div className="container-page">
            <nav aria-label="Kruimelpad" className="flex items-center gap-2 text-klein text-ink-soft">
              <Link href="/" className="underline-offset-4 hover:text-brand-deep hover:underline">
                Home
              </Link>
              <span aria-hidden>/</span>
              <Link href="/diensten" className="underline-offset-4 hover:text-brand-deep hover:underline">
                Alle diensten
              </Link>
              <span aria-hidden>/</span>
              <span className="text-ink">{categorie.titel}</span>
            </nav>

            <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-deep">
              <Icoon className="h-6 w-6" />
            </span>

            <h1 className="mt-5 max-w-3xl text-balance font-display text-h1 text-ink">{categorie.titel}</h1>
            <p className="mt-4 max-w-2xl text-lead text-ink-soft">{categorie.omschrijving}</p>
          </div>
        </section>

        <section className="sectie">
          <div className="container-page">
            <h2 className="font-display text-h3 text-ink">
              {lijst.length} diensten in deze categorie
            </h2>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lijst.map((dienst) => (
                <li key={dienst.slug} className="kaart relative flex flex-col p-5 transition hover:shadow-kaart-op">
                  <h3 className="font-display text-h5 text-ink">
                    <Link href={`/${dienst.slug}`} className="kaart-link underline-offset-4 hover:underline">
                      {dienst.menuLabel}
                    </Link>
                  </h3>
                  <p className="mt-1 text-klein text-ink-soft">{dienst.belofte}</p>
                  <p className="mt-3 flex-1 text-basis text-ink-soft">{dienst.intro}</p>
                  <p className="mt-4 flex items-center gap-1.5 text-basis font-semibold text-brand-deep">
                    Bekijk {dienst.meervoud}
                    <ArrowRightIcon className="h-4 w-4" />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <HoeHetWerkt />
        <SlotCta plaats="jouw regio" />
      </main>
      <SiteFooter />
      <ChatWidget />
      <CategorieData categorie={categorie} lijst={lijst} />
    </PaginaOvergang>
  );
}
