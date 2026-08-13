"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CloseIcon, MenuIcon, RasterIcon } from "@/components/icons";
import { categorieen, dienstenVanCategorie } from "@/lib/diensten";

type NavLink = { label: string; href: string };

export function MobileMenu({ over }: { over: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const knop = useRef<HTMLButtonElement>(null);
  const sluit = () => setOpen(false);

  // Escape sluit het menu en zet de focus terug op de knop, net als bij het
  // mega-menu op desktop.
  useEffect(() => {
    if (!open) return;

    const opToets = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      knop.current?.focus();
    };

    document.addEventListener("keydown", opToets);
    return () => document.removeEventListener("keydown", opToets);
  }, [open]);

  return (
    <div className="ml-auto lg:hidden">
      <button
        ref={knop}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobiel-menu"
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition hover:bg-brand-soft"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {open ? (
        <nav
          id="mobiel-menu"
          aria-label="Hoofdmenu"
          className="absolute inset-x-0 top-full z-30 max-h-[calc(100svh-var(--hoogte-kop))] overflow-y-auto border-t border-lijn bg-hero px-5 pb-8 pt-4 shadow-paneel"
        >
          <p className="px-1 text-mini font-semibold uppercase tracking-[0.12em] text-ink-soft">Diensten</p>

          <div className="mt-2 divide-y divide-lijn border-y border-lijn">
            {categorieen.map((categorie) => (
              <details key={categorie.id} className="uitklapper group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-basis font-semibold text-ink marker:content-['']">
                  {categorie.titel}
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <ul className="pb-3">
                  {dienstenVanCategorie(categorie.id).map((dienst) => (
                    <li key={dienst.slug}>
                      <Link
                        href={`/${dienst.slug}`}
                        onClick={sluit}
                        className="block rounded-lg py-2 pl-3 text-basis text-ink-soft transition hover:text-brand-deep"
                      >
                        {dienst.menuLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <Link
            href="/diensten"
            onClick={sluit}
            className="mt-4 flex items-center gap-2 rounded-lg px-1 py-2 text-basis font-semibold text-brand-deep"
          >
            <RasterIcon className="h-4 w-4" />
            Alle diensten op een rij
          </Link>

          <p className="mt-5 px-1 text-mini font-semibold uppercase tracking-[0.12em] text-ink-soft">Over ons</p>
          <ul className="mt-1 mb-5">
            {over.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={sluit}
                  className="block rounded-lg px-1 py-2.5 text-basis font-semibold text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/inloggen" onClick={sluit} className="block rounded-lg px-1 py-2.5 text-basis font-semibold text-ink">
                Inloggen
              </Link>
            </li>
          </ul>

          <Link
            href="/aanmelden"
            onClick={sluit}
            className="block rounded-full bg-ink px-4 py-3 text-center font-display text-basis font-medium text-white"
          >
            Werk ontvangen
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
