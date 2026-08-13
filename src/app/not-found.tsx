import Link from "next/link";
import { ArrowRightIcon, RasterIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { populaireDiensten } from "@/lib/diensten";

/**
 * Deze pagina krijgt geen props mee — geen params en geen pad — dus we sturen de
 * bezoeker door met wat we wél weten: het dienstenoverzicht en de diensten waar
 * het meest naar gezocht wordt.
 */
export default function NietGevonden() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center">
        <div className="container-page sectie">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-display text-klein font-medium uppercase tracking-[0.14em] text-brand-deep">
              404
            </p>
            <h1 className="mt-3 text-balance font-display text-h1 text-ink">Deze pagina bestaat niet</h1>
            <p className="mt-4 text-lead text-ink-soft">
              Misschien is de link verouderd of staat er een typefout in het adres. Zoek hieronder verder, of
              beschrijf gewoon je klus — dan kijken wij welke vakman erbij past.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/diensten"
                className="flex h-veld items-center gap-2 rounded-2xl bg-ink px-6 font-display text-basis font-medium text-white transition hover:bg-brand-deep"
              >
                <RasterIcon className="h-4 w-4" />
                Alle diensten
              </Link>
              <Link
                href="/aanvraag"
                className="flex h-veld items-center gap-2 rounded-2xl bg-zon px-6 font-display text-basis font-medium text-ink transition hover:bg-zon-dark"
              >
                Beschrijf je klus
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 border-t border-lijn pt-8">
              <p className="text-klein text-ink-soft">Vaak gezocht</p>
              <ul className="mt-3 flex flex-wrap justify-center gap-2">
                {populaireDiensten().map((dienst) => (
                  <li key={dienst.slug}>
                    <Link
                      href={`/${dienst.slug}`}
                      className="flex rounded-full border border-lijn bg-white px-3.5 py-1.5 text-klein text-ink transition hover:border-brand hover:text-brand-deep"
                    >
                      {dienst.menuLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
