import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AanmeldWizard } from "@/components/aanmeld-wizard";
import { CheckIcon } from "@/components/icons";
import { PaginaOvergang } from "@/components/pagina-overgang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { huidigeGebruiker } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Meld je bedrijf aan",
  description: "Meld je bedrijf in drie stappen aan bij Werkoo en ontvang aanvragen uit je eigen regio. Gratis, zonder abonnement.",
  alternates: { canonical: "/aanmelden/start" },
  robots: { index: false, follow: true },
};

function eerste(waarde: string | string[] | undefined) {
  return Array.isArray(waarde) ? (waarde[0] ?? "") : (waarde ?? "");
}

const beloftes = [
  "Gratis aanmelden, geen abonnement",
  "Je betaalt pas als je een opdracht binnenhaalt",
  "Jij kiest je diensten en je regio",
  "Stoppen kan wanneer je wilt",
];

export default async function AanmeldStartPagina({ searchParams }: PageProps<"/aanmelden/start">) {
  const gebruiker = await huidigeGebruiker();
  if (gebruiker) redirect(gebruiker.soort === "bedrijf" ? "/pro" : "/account");

  const params = await searchParams;

  return (
    <PaginaOvergang>
      <SiteHeader />
      <main className="flex-1 bg-brand-soft py-12 sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="mx-auto w-full max-w-2xl">
            <AanmeldWizard startDienst={eerste(params.dienst)} />
            <p className="mt-5 text-center text-klein text-ink-soft">
              Al een account?{" "}
              <Link href="/inloggen" className="font-semibold text-brand-deep underline underline-offset-4">
                Log in
              </Link>
              .
            </p>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="font-display text-klein font-medium uppercase tracking-[0.14em] text-brand-deep">Voor vakmensen</p>
              <h2 className="mt-2 font-display text-h4 text-ink">Werk ontvangen via Werkoo</h2>
              <ul className="mt-5 space-y-3">
                {beloftes.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-basis text-ink-soft">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-klein text-ink-soft">
                Vragen vooraf?{" "}
                <Link href="/aanmelden" className="font-semibold text-brand-deep underline underline-offset-4">
                  Lees hoe het werkt
                </Link>{" "}
                of mail hallo@werkoo.nl.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </PaginaOvergang>
  );
}
