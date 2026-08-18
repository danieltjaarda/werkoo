import Image from "next/image";
import Link from "next/link";
import { ChatWidget } from "@/components/chat-widget";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Paginatekst } from "@/lib/pagina-teksten";

/** "Wat wij met je gegevens doen" -> "wat-wij-met-je-gegevens-doen" */
function anker(kop: string): string {
  return kop
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Pagina's die uit lopende tekst bestaan: de voorwaarden, de privacyverklaring,
 * over ons en de aanmeldpagina. Links loopt een inhoudsopgave mee, want die
 * teksten zijn te lang om als één lap te lezen.
 */
export function TekstPagina({
  pagina,
  eyebrow,
  cta,
  kopKnop,
  kopBeeld,
}: {
  pagina: Paginatekst;
  eyebrow: string;
  cta?: { titel: string; tekst: string; label: string; href: string };
  /** Knop bovenin de kop, voor pagina's met één duidelijke vervolgstap. */
  kopKnop?: { label: string; href: string };
  /** Illustratie naast de kop. */
  kopBeeld?: string;
}) {
  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1">
        <section className="sectie bg-brand-soft">
          <div className={kopBeeld ? "container-page grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]" : "container-page"}>
            <div>
            <p className="font-display text-klein font-medium uppercase tracking-[0.14em] text-brand-deep">
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-balance font-display text-h1 text-ink">{pagina.titel}</h1>
            {pagina.inleiding ? (
              <p className="mt-4 max-w-2xl text-lead text-ink-soft">{pagina.inleiding}</p>
            ) : null}
            {kopKnop ? (
              <Link
                href={kopKnop.href}
                className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-zon px-7 font-display text-basis font-semibold text-ink transition hover:bg-zon-dark"
              >
                {kopKnop.label}
              </Link>
            ) : null}
            </div>
            {kopBeeld ? (
              <Image
                src={kopBeeld}
                alt=""
                width={700}
                height={700}
                sizes="(min-width: 1024px) 380px, 260px"
                className="mx-auto h-[280px] w-auto object-contain lg:h-[340px]"
                priority
              />
            ) : null}
          </div>
        </section>

        <section className="sectie">
          <div className="container-page grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            {/* Loopt mee tijdens het scrollen; anders staat de hele linkerkolom
                na het eerste scherm leeg bij een lange tekst. */}
            <nav
              aria-label="Op deze pagina"
              className="hidden lg:sticky lg:top-[calc(var(--hoogte-kop)+2rem)] lg:block lg:self-start"
            >
              <p className="font-display text-klein font-semibold uppercase tracking-[0.12em] text-ink-soft">
                Op deze pagina
              </p>
              <ul className="mt-4 space-y-1 border-l border-lijn">
                {pagina.secties.map((sectie) => (
                  <li key={sectie.kop}>
                    <a
                      href={`#${anker(sectie.kop)}`}
                      className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-klein text-ink-soft transition hover:border-brand hover:text-brand-deep"
                    >
                      {sectie.kop}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="max-w-2xl">
              {pagina.secties.map((sectie, index) => (
                <section
                  key={sectie.kop}
                  id={anker(sectie.kop)}
                  className={`scroll-mt-32 ${index > 0 ? "mt-12 border-t border-lijn pt-12" : ""}`}
                >
                  <h2 className="font-display text-h3 text-ink">{sectie.kop}</h2>

                  {sectie.alineas.map((alinea) => (
                    <p key={alinea} className="mt-4 text-lees text-ink-soft">
                      {alinea}
                    </p>
                  ))}

                  {sectie.lijst?.length ? (
                    <ul className="mt-5 space-y-2.5">
                      {sectie.lijst.map((punt) => (
                        <li key={punt} className="flex items-start gap-3 text-lees text-ink-soft">
                          <CheckIcon className="mt-1.5 h-4 w-4 shrink-0 text-brand" />
                          {punt}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              {cta ? (
                <div className="mt-14 rounded-3xl bg-ink px-7 py-8 sm:px-9">
                  <h2 className="max-w-md font-display text-h4 text-white">{cta.titel}</h2>
                  <p className="mt-2.5 max-w-md text-basis text-white/65">{cta.tekst}</p>
                  <Link
                    href={cta.href}
                    className="mt-6 inline-flex h-veld items-center gap-2 rounded-2xl bg-zon px-6 font-display text-basis font-medium text-ink transition hover:bg-zon-dark"
                  >
                    {cta.label}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ChatWidget />
    </PaginaOvergang>
  );
}
