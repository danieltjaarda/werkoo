import Image from "next/image";
import Link from "next/link";

const kolommen = [
  {
    titel: "Diensten",
    links: [
      { label: "Videograaf", href: "/videograaf" },
      { label: "Videograaf Joure", href: "/videograaf/joure" },
      { label: "Videograaf Leeuwarden", href: "/videograaf/leeuwarden" },
      { label: "Videograaf Heerenveen", href: "/videograaf/heerenveen" },
    ],
  },
  {
    titel: "Over ons",
    links: [
      { label: "Zo werkt het", href: "/#zo-werkt-het" },
      { label: "Ervaringen", href: "/#ervaringen" },
      { label: "Vragen", href: "/#vragen" },
      { label: "Werk ontvangen", href: "/aanmelden" },
    ],
  },
  {
    titel: "Contact",
    links: [
      { label: "hallo@werkoo.nl", href: "mailto:hallo@werkoo.nl" },
      { label: "085 - 123 45 67", href: "tel:+31851234567" },
      { label: "Privacyverklaring", href: "/privacy" },
      { label: "Algemene voorwaarden", href: "/voorwaarden" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-lijn bg-white py-14">
      <div className="container-page grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Image src="/logo-werkoo.svg" alt="Werkoo" width={250} height={50} className="h-11 w-auto" />
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-ink-soft">
            Werkoo brengt je in contact met vakmensen uit je eigen regio. Zonder abonnement, zonder
            bemiddelingskosten en zonder dat je ergens aan vastzit.
          </p>
        </div>

        {kolommen.map((kolom) => (
          <div key={kolom.titel}>
            <h3 className="font-display text-[14px] font-bold text-ink">{kolom.titel}</h3>
            <ul className="mt-4 space-y-2.5">
              {kolom.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] text-ink-soft transition hover:text-brand-deep">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page mt-12 border-t border-lijn pt-6 text-[13px] text-ink-soft">
        © {new Date().getFullYear()} Werkoo. KvK 12345678.
      </div>
    </footer>
  );
}
