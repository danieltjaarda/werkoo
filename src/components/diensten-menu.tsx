"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { ArrowRightIcon, ChevronDownIcon, RasterIcon, SearchIcon } from "@/components/icons";
import { categorieen, dienstenVanCategorie, zoekDiensten } from "@/lib/diensten";

/** Zo lang blijft het paneel nog open als de muis eraf gaat, zodat de weg erheen vergevend is. */
const SLUITVERTRAGING = 140;

/** Meer treffers dan dit passen niet in het paneel zonder te gaan scrollen. */
const MAX_TREFFERS = 18;

export function DienstenMenu() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  const knop = useRef<HTMLButtonElement>(null);
  const paneel = useRef<HTMLDivElement>(null);
  const teller = useRef<ReturnType<typeof setTimeout> | null>(null);

  function annuleerSluiten() {
    if (teller.current) clearTimeout(teller.current);
    teller.current = null;
  }

  function sluitStraks() {
    annuleerSluiten();
    teller.current = setTimeout(() => setOpen(false), SLUITVERTRAGING);
  }

  function sluit() {
    annuleerSluiten();
    setOpen(false);
    setTerm("");
  }

  /**
   * Tabben voorbij de laatste link hoort het paneel te sluiten. Zonder dit blijft
   * het paneel plus de verduistering over de pagina liggen terwijl de focus er
   * onder verder loopt.
   */
  function opFocusUit(event: FocusEvent<HTMLElement>) {
    const naar = event.relatedTarget as Node | null;
    if (naar && (knop.current?.contains(naar) || paneel.current?.contains(naar))) return;
    sluit();
  }

  useEffect(() => annuleerSluiten, []);

  // Escape sluit het paneel waar de focus ook staat en zet hem terug op de knop.
  useEffect(() => {
    if (!open) return;

    const opToets = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (teller.current) clearTimeout(teller.current);
      setOpen(false);
      setTerm("");
      knop.current?.focus();
    };

    document.addEventListener("keydown", opToets);
    return () => document.removeEventListener("keydown", opToets);
  }, [open]);

  const treffers = term.trim() ? zoekDiensten(term, MAX_TREFFERS) : [];
  const zoekt = term.trim().length > 0;

  return (
    <>
      <button
        ref={knop}
        type="button"
        aria-expanded={open}
        aria-controls="diensten-paneel"
        onClick={() => (open ? sluit() : setOpen(true))}
        onMouseEnter={() => {
          annuleerSluiten();
          setOpen(true);
        }}
        onMouseLeave={sluitStraks}
        onBlur={opFocusUit}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-basis font-medium transition ${
          open ? "bg-brand-soft text-brand-deep" : "text-ink hover:bg-brand-soft"
        }`}
      >
        Diensten
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <>
          {/* De pagina dimt, zodat het paneel het enige is waar je oog naartoe gaat. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => sluit()}
            className="fixed inset-x-0 bottom-0 top-[var(--hoogte-kop)] cursor-default bg-ink/25"
          />

          <div
            ref={paneel}
            id="diensten-paneel"
            onMouseEnter={annuleerSluiten}
            onMouseLeave={sluitStraks}
            onBlur={opFocusUit}
            className="menu-paneel absolute inset-x-0 top-full border-b border-lijn bg-white shadow-paneel"
          >
            {/* Breder dan de rest van de site: met zes kolommen naast elkaar
                breken de langere labels anders halverwege af. */}
            <div className="mx-auto max-h-[calc(100svh-var(--hoogte-kop)-1rem)] w-full max-w-[1560px] overflow-y-auto px-8 py-7">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
                <div className="relative w-full max-w-sm">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="search"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Zoek een dienst"
                    aria-label="Zoek een dienst"
                    className="h-11 w-full rounded-xl border border-lijn bg-white pl-11 pr-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </div>

                <Link
                  href="/diensten"
                  onClick={() => sluit()}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-basis font-semibold text-brand-deep transition hover:bg-brand-soft"
                >
                  <RasterIcon className="h-4 w-4" />
                  Alle diensten
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {zoekt ? (
                <div className="border-t border-lijn pt-6">
                  {treffers.length === 0 ? (
                    <p className="py-6 text-basis text-ink-soft">
                      Geen dienst gevonden voor{" "}
                      <span className="font-semibold text-ink">{term.trim()}</span>. Beschrijf je klus dan
                      gewoon in{" "}
                      <Link href="/aanvraag" onClick={() => sluit()} className="font-semibold text-brand-deep underline underline-offset-4">
                        een aanvraag
                      </Link>
                      , dan zoeken wij mee.
                    </p>
                  ) : (
                    <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                      {treffers.map((dienst) => (
                        <li key={dienst.slug}>
                          <Link
                            href={`/${dienst.slug}`}
                            onClick={() => sluit()}
                            className="flex items-baseline justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-brand-soft"
                          >
                            <span className="text-basis text-ink">{dienst.menuLabel}</span>
                            <span className="shrink-0 text-mini text-ink-soft">
                              {categorieen.find((categorie) => categorie.id === dienst.categorie)?.titel}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-lijn pt-6 md:grid-cols-3 xl:grid-cols-6">
                  {categorieen.map((categorie) => (
                    <div key={categorie.id}>
                      <Link
                        href={`/diensten/${categorie.slug}`}
                        onClick={() => sluit()}
                        className="font-display text-basis font-bold text-ink underline-offset-4 hover:underline"
                      >
                        {categorie.titel}
                      </Link>
                      <ul className="mt-3 space-y-0.5">
                        {dienstenVanCategorie(categorie.id).map((dienst) => (
                          <li key={dienst.slug}>
                            <Link
                              href={`/${dienst.slug}`}
                              onClick={() => sluit()}
                              className="-mx-2 block rounded-lg px-2 py-1 text-basis text-ink-soft transition hover:bg-brand-soft hover:text-brand-deep"
                            >
                              {dienst.menuLabel}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
