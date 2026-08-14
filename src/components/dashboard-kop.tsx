import Image from "next/image";
import Link from "next/link";
import { uitloggen } from "@/lib/auth-acties";
import type { Gebruiker } from "@/lib/auth";

/** Twee letters uit de naam, voor het rondje rechtsboven. */
function initialen(naam: string): string {
  const delen = naam.trim().split(/\s+/);
  return ((delen[0]?.[0] ?? "") + (delen.length > 1 ? (delen.at(-1)?.[0] ?? "") : "")).toUpperCase() || "?";
}

/**
 * De kop van de ingelogde omgeving. Bewust een andere balk dan op de openbare
 * site: hier hoort geen dienstenmenu, maar de plekken van je eigen account.
 */
export function DashboardKop({
  gebruiker,
  links,
  huidig,
}: {
  gebruiker: Gebruiker;
  links: { label: string; href: string }[];
  huidig: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-lijn bg-white">
      <div className="container-page flex h-[72px] items-center gap-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Werkoo, naar de homepage">
          <Image src="/logo-werkoo.svg" alt="Werkoo" width={250} height={50} className="h-9 w-auto" />
        </Link>

        <nav aria-label="Mijn omgeving" className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const actief = huidig === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={actief ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-basis font-medium transition ${
                  actief ? "bg-brand-soft text-brand-deep" : "text-ink-soft hover:bg-brand-soft hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft font-display text-klein font-bold text-brand-deep"
          >
            {initialen(gebruiker.naam)}
          </span>
          <span className="hidden text-basis text-ink sm:block">{gebruiker.naam}</span>
          <form action={uitloggen}>
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-basis font-medium text-ink-soft transition hover:bg-brand-soft hover:text-ink"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
