"use client";

import Link from "next/link";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";

type NavLink = { label: string; href: string };

export function MobileMenu({ diensten, over }: { diensten: NavLink[]; over: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ml-auto lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition hover:bg-brand-soft"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-30 border-t border-lijn bg-hero px-5 pb-6 pt-4 shadow-lg">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Menu</p>
          <ul className="mt-2 mb-4">
            {[...diensten, ...over].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-1 py-2.5 text-[15px] font-semibold text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/aanmelden"
            onClick={() => setOpen(false)}
            className="block rounded-full bg-ink px-4 py-3 text-center font-display text-[15px] font-medium text-white"
          >
            Werk ontvangen
          </Link>
        </div>
      ) : null}
    </div>
  );
}
