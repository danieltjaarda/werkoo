import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/icons";
import { MobileMenu } from "@/components/mobile-menu";

export const dienstenLinks = [
  { label: "Videograaf", href: "/videograaf" },
  { label: "Fotograaf", href: "/videograaf" },
  { label: "DJ", href: "/videograaf" },
  { label: "Cateraar", href: "/videograaf" },
];

export const overLinks = [
  { label: "Zo werkt het", href: "/#zo-werkt-het" },
  { label: "Ervaringen", href: "/#ervaringen" },
  { label: "Vragen", href: "/#vragen" },
];

function NavDropdown({
  label,
  links,
}: {
  label: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-medium text-ink transition hover:bg-brand-soft"
      >
        {label}
        <ChevronDownIcon className="h-4 w-4 text-ink-soft transition group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-1/2 top-full z-20 w-56 -translate-x-1/2 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <ul className="rounded-2xl border border-lijn bg-white p-2 shadow-xl">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="block rounded-xl px-3 py-2 text-[15px] text-ink transition hover:bg-brand-soft hover:text-brand-deep"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header
      // Blijft staan tijdens een paginaovergang, zodat de bezoeker een vast punt houdt.
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-50 border-b border-lijn bg-hero"
    >
      <div className="container-page flex h-[84px] items-center gap-8">
        <Link
          href="/"
          // Het logo gaat altijd een niveau omhoog, dus schuift de pagina terug.
          transitionTypes={["nav-terug"]}
          className="flex shrink-0 items-center"
          aria-label="Werkoo, naar de homepage"
        >
          <Image
            src="/logo-werkoo.svg"
            alt="Werkoo"
            width={250}
            height={50}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <NavDropdown label="Diensten" links={dienstenLinks} />
          <NavDropdown label="Over ons" links={overLinks} />
          <Link
            href="/inloggen"
            className="rounded-lg px-3 py-2 text-[15px] font-medium text-ink transition hover:bg-brand-soft"
          >
            Inloggen
          </Link>
          <Link
            href="/aanmelden"
            className="ml-2 rounded-full border-2 border-ink px-5 py-2 font-display text-[15px] font-medium text-ink transition hover:bg-ink hover:text-white"
          >
            Werk ontvangen
          </Link>
        </nav>

        <MobileMenu diensten={dienstenLinks} over={overLinks} />
      </div>
    </header>
  );
}
