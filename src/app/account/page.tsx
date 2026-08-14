import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ChatIcon, MapPinIcon } from "@/components/icons";
import { DashboardKop } from "@/components/dashboard-kop";
import { aanvragenVanGebruiker } from "@/lib/aanvragen";
import { vereisGebruiker } from "@/lib/auth";
import { getDienst } from "@/lib/diensten";

export const metadata: Metadata = {
  title: "Mijn aanvragen",
  robots: { index: false, follow: false },
};

const datum = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export default async function AccountPagina() {
  const gebruiker = await vereisGebruiker("/account");
  const aanvragen = await aanvragenVanGebruiker(gebruiker.id);

  return (
    <>
      <DashboardKop
        gebruiker={gebruiker}
        huidig="/account"
        links={[{ label: "Mijn aanvragen", href: "/account" }]}
      />

      <main className="flex-1 bg-brand-soft/40">
        <div className="container-page sectie">
          <h1 className="font-display text-h2 text-ink">Hallo {gebruiker.naam.split(" ")[0]}</h1>
          <p className="mt-3 max-w-2xl text-lead text-ink-soft">
            {aanvragen.length === 0
              ? "Je hebt nog geen aanvraag gedaan. Beschrijf je klus, dan leggen we hem voor aan vakmensen in jouw regio."
              : `Je hebt ${aanvragen.length} ${aanvragen.length === 1 ? "aanvraag" : "aanvragen"} gedaan. Hieronder zie je wat er is binnengekomen.`}
          </p>

          {aanvragen.length === 0 ? (
            <Link
              href="/diensten"
              className="mt-8 inline-flex h-veld items-center gap-2 rounded-2xl bg-ink px-6 font-display text-basis font-medium text-white transition hover:bg-brand-deep"
            >
              Beschrijf je klus
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <ul className="mt-10 space-y-4">
              {aanvragen.map((aanvraag) => {
                const dienst = getDienst(aanvraag.dienst);
                return (
                  <li key={aanvraag.id} className="kaart relative p-5 transition hover:shadow-kaart-op sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-display text-h5 text-ink">
                          <Link href={`/account/${aanvraag.referentie}`} className="kaart-link underline-offset-4 hover:underline">
                            {dienst?.naam ?? aanvraag.dienst} in {aanvraag.plaats}
                          </Link>
                        </h2>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-klein text-ink-soft">
                          <span>{datum.format(new Date(aanvraag.aangemaakt_op))}</span>
                          <span className="flex items-center gap-1.5">
                            <MapPinIcon className="h-4 w-4" />
                            {aanvraag.plaats}
                          </span>
                          <span>Referentie {aanvraag.referentie}</span>
                        </p>
                      </div>

                      <span
                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-klein font-semibold ${
                          aanvraag.reacties > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-brand-soft text-brand-deep"
                        }`}
                      >
                        <ChatIcon className="h-4 w-4" />
                        {aanvraag.reacties === 0
                          ? `Verstuurd naar ${aanvraag.ontvangers} ${aanvraag.ontvangers === 1 ? "vakman" : "vakmensen"}`
                          : `${aanvraag.reacties} ${aanvraag.reacties === 1 ? "reactie" : "reacties"}`}
                      </span>
                    </div>

                    {aanvraag.wensen ? (
                      <p className="mt-3 line-clamp-2 text-basis text-ink-soft">{aanvraag.wensen}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
