import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget";
import { ArrowRightIcon, CheckIcon, KeurmerkIcon, MapPinIcon, PhoneIcon, ZegelIcon } from "@/components/icons";
import { Kruimelpad } from "@/components/kruimelpad";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { Rating } from "@/components/rating";
import { HoeHetWerkt, TroefLabel } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProfielData } from "@/components/structured-data";
import { UitgelichtLabel } from "@/components/uitgelicht-label";
import { actieveBedrijfSlugs, profielVanSlug } from "@/lib/aanvragen";
import { diensten as catalogus, getDienst } from "@/lib/diensten";
import { slugVanPlaatsnaam } from "@/lib/plaatsen";

/** Net als de plaatspagina's: statisch, ververst bij profielwijziging en uiterlijk elke tien minuten. */
export const revalidate = 600;

export async function generateStaticParams() {
  return (await actieveBedrijfSlugs()).map((slug) => ({ slug }));
}

/** Diensten van het bedrijf in de volgorde van de catalogus, onbekende slugs eruit. */
function dienstenVan(slugs: string[]) {
  const set = new Set(slugs);
  return catalogus.filter((d) => set.has(d.slug));
}

export async function generateMetadata({ params }: PageProps<"/vakman/[slug]">): Promise<Metadata> {
  const profiel = await profielVanSlug((await params).slug);
  if (!profiel) return {};

  const { bedrijf } = profiel;
  const lijst = dienstenVan(profiel.diensten);
  const vak = lijst[0]?.naam ?? "Vakman";
  const waar = bedrijf.plaats ? ` in ${bedrijf.plaats}` : "";
  const title = `${bedrijf.naam} — ${vak}${waar}`;
  const description =
    bedrijf.tekst.slice(0, 150) ||
    `${bedrijf.naam} is ${vak.toLowerCase()}${waar}. Vraag gratis en vrijblijvend een reactie aan via Werkoo.`;
  const pad = `/vakman/${bedrijf.slug}`;

  return { title, description, alternates: { canonical: pad }, openGraph: { title, description, url: pad } };
}

export default async function ProfielPagina({ params }: PageProps<"/vakman/[slug]">) {
  const profiel = await profielVanSlug((await params).slug);
  if (!profiel) notFound();

  const { bedrijf, plaatsen } = profiel;
  const lijst = dienstenVan(profiel.diensten);
  const hoofd = lijst[0];
  const aanvraagPad = hoofd
    ? `/aanvraag?dienst=${hoofd.slug}&plaats=${encodeURIComponent(bedrijf.plaats)}&vakman=${bedrijf.slug}`
    : "/aanvraag";
  const kruimels = [
    { naam: "Home", pad: "/" },
    ...(hoofd ? [{ naam: hoofd.menuLabel, pad: `/${hoofd.slug}` }] : []),
    { naam: bedrijf.naam, pad: `/vakman/${bedrijf.slug}` },
  ];

  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1">
        <section className="sectie bg-brand-soft">
          <div className="container-page">
            <Kruimelpad kruimels={kruimels} />

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-3xl bg-white sm:h-64 lg:h-72 lg:w-96">
                {bedrijf.foto ? (
                  <Image
                    src={bedrijf.foto}
                    alt={`Werk van ${bedrijf.naam}`}
                    fill
                    sizes="(min-width: 1024px) 384px, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-h1 text-brand-deep">
                    {bedrijf.naam.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {bedrijf.topPro ? (
                    <span className="flex items-center gap-1.5 font-display text-mini font-bold uppercase tracking-[0.08em] text-ink">
                      <KeurmerkIcon className="h-[18px] w-[18px] text-brand" />
                      Top pro
                    </span>
                  ) : null}
                  {bedrijf.uitgelicht ? <UitgelichtLabel /> : null}
                </div>

                <h1 className="mt-2 text-balance font-display text-h1 text-ink">{bedrijf.naam}</h1>
                {bedrijf.belofte ? <p className="mt-2 text-lead text-ink-soft">{bedrijf.belofte}</p> : null}

                {bedrijf.reviews > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-display text-h4 leading-none text-ink">
                      {bedrijf.score.toLocaleString("nl-NL")}
                    </span>
                    <Rating score={bedrijf.score} />
                    <span className="text-klein text-ink-soft">({bedrijf.reviews} beoordelingen)</span>
                  </div>
                ) : null}

                {bedrijf.troeven.length ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {bedrijf.troeven.map((troef) => (
                      <TroefLabel key={troef.label} troef={troef} />
                    ))}
                  </ul>
                ) : null}

                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-klein text-ink-soft">
                  {bedrijf.adres || bedrijf.plaats ? (
                    <li className="flex items-center gap-1.5">
                      <MapPinIcon className="h-4 w-4 text-ink-soft/70" />
                      {bedrijf.adres || bedrijf.plaats}
                    </li>
                  ) : null}
                  {bedrijf.jaren > 0 ? (
                    <li className="flex items-center gap-1.5">
                      <ZegelIcon className="h-4 w-4 text-ink-soft/70" />
                      {bedrijf.jaren} jaar in bedrijf
                    </li>
                  ) : null}
                  {bedrijf.telefoon ? (
                    <li className="flex items-center gap-1.5">
                      <PhoneIcon className="h-4 w-4 text-ink-soft/70" />
                      <a href={`tel:${bedrijf.telefoon.replace(/\s/g, "")}`} className="text-brand-deep underline underline-offset-4">
                        {bedrijf.telefoon}
                      </a>
                    </li>
                  ) : null}
                </ul>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Link
                    href={aanvraagPad}
                    transitionTypes={["nav-vooruit"]}
                    className="flex items-center justify-center rounded-xl bg-zon px-6 py-3 font-display text-basis font-semibold text-ink transition hover:bg-zon-dark"
                  >
                    Vraag een reactie aan
                  </Link>
                  <p className="flex items-center gap-1.5 text-mini text-ink-soft sm:ml-3">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                    Gratis en vrijblijvend
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sectie">
          <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div>
              <h2 className="font-display text-h3 text-ink">Over {bedrijf.naam}</h2>
              <p className="mt-4 whitespace-pre-line text-basis text-ink-soft">
                {bedrijf.tekst || "Dit bedrijf heeft nog geen omschrijving toegevoegd."}
              </p>
            </div>

            <aside className="space-y-8">
              {lijst.length ? (
                <div>
                  <h2 className="font-display text-h5 text-ink">Diensten</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {lijst.map((dienst) => (
                      <li key={dienst.slug}>
                        <Link
                          href={bedrijf.plaats ? `/${dienst.slug}/${slugVanPlaatsnaam(bedrijf.plaats)}` : `/${dienst.slug}`}
                          className="flex rounded-full border border-lijn bg-white px-4 py-2 text-basis text-ink transition hover:border-brand hover:text-brand-deep"
                        >
                          {dienst.menuLabel}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <h2 className="font-display text-h5 text-ink">Werkgebied</h2>
                {plaatsen.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {plaatsen.map((plaats) => (
                      <li key={plaats}>
                        {hoofd ? (
                          <Link
                            href={`/${hoofd.slug}/${slugVanPlaatsnaam(plaats)}`}
                            className="flex rounded-full border border-lijn bg-white px-4 py-2 text-basis text-ink transition hover:border-brand hover:text-brand-deep"
                          >
                            {plaats}
                          </Link>
                        ) : (
                          <span className="flex rounded-full border border-lijn bg-white px-4 py-2 text-basis text-ink">{plaats}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-basis text-ink-soft">
                    {bedrijf.naam} neemt opdrachten aan in heel Nederland.
                  </p>
                )}
              </div>

              {hoofd ? (
                <Link
                  href={`/${hoofd.slug}`}
                  className="flex items-center gap-1.5 text-basis font-semibold text-brand-deep underline-offset-4 hover:underline"
                >
                  Alle {getDienst(hoofd.slug)?.meervoud ?? "vakmensen"} bekijken
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              ) : null}
            </aside>
          </div>
        </section>

        <HoeHetWerkt />
      </main>
      <SiteFooter />
      <ChatWidget />
      <ProfielData profiel={profiel} diensten={lijst} kruimels={kruimels} />
    </PaginaOvergang>
  );
}
