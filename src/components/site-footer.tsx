import Image from "next/image";
import Link from "next/link";
import { categorieen, populaireDiensten } from "@/lib/diensten";
import { CONTACT } from "@/lib/site";

const overLinks = [
  { label: "Over Werkoo", href: "/over-ons" },
  { label: "Zo werkt het", href: "/#zo-werkt-het" },
  { label: "Ervaringen", href: "/#ervaringen" },
  { label: "Veelgestelde vragen", href: "/#vragen" },
  { label: "Werk ontvangen", href: "/aanmelden" },
  { label: "Inloggen", href: "/inloggen" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-lijn bg-white pb-8 pt-14">
      <div className="container-page grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Image src="/logo-werkoo.svg" alt="Werkoo" width={250} height={50} className="h-11 w-auto" />
          <p className="mt-5 max-w-xs text-basis text-ink-soft">
            Werkoo brengt je in contact met vakmensen uit je eigen regio. Zonder abonnement, zonder
            bemiddelingskosten en zonder dat je ergens aan vastzit.
          </p>
          <ul className="mt-5 space-y-1.5 text-basis text-ink-soft">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="transition hover:text-brand-deep">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={`tel:${CONTACT.telefoonLink}`} className="transition hover:text-brand-deep">
                {CONTACT.telefoon}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-basis font-bold text-ink">Categorieën</h2>
          <ul className="mt-4 space-y-2.5">
            {categorieen.map((categorie) => (
              <li key={categorie.id}>
                <Link
                  href={`/diensten/${categorie.slug}`}
                  className="text-basis text-ink-soft transition hover:text-brand-deep"
                >
                  {categorie.titel}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-basis font-bold text-ink">Vaak gezocht</h2>
          <ul className="mt-4 space-y-2.5">
            {populaireDiensten().map((dienst) => (
              <li key={dienst.slug}>
                <Link
                  href={`/${dienst.slug}`}
                  className="text-basis text-ink-soft transition hover:text-brand-deep"
                >
                  {dienst.menuLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-basis font-bold text-ink">Over ons</h2>
          <ul className="mt-4 space-y-2.5">
            {overLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-basis text-ink-soft transition hover:text-brand-deep">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-page mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-lijn pt-6 text-klein text-ink-soft">
        <p>
          © {new Date().getFullYear()} Werkoo. KvK {CONTACT.kvk}.
        </p>
        <ul className="flex flex-wrap gap-x-5">
          <li>
            <Link href="/privacy" className="transition hover:text-brand-deep">
              Privacyverklaring
            </Link>
          </li>
          <li>
            <Link href="/voorwaarden" className="transition hover:text-brand-deep">
              Algemene voorwaarden
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
