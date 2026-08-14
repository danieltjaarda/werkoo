import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardKop } from "@/components/dashboard-kop";
import { ArrowLeftIcon, CheckIcon, EuroIcon, MapPinIcon, PhoneIcon, QuoteIcon } from "@/components/icons";
import { aanvraagVanGebruiker } from "@/lib/aanvragen";
import { leesbaar } from "@/lib/agenda";
import { vereisGebruiker } from "@/lib/auth";
import { getDienst } from "@/lib/diensten";

export const metadata: Metadata = {
  title: "Je aanvraag",
  robots: { index: false, follow: false },
};

const datumTijd = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function Regel({ label, waarde }: { label: string; waarde: string }) {
  if (!waarde) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-lijn py-3 last:border-0 sm:flex-row sm:gap-6">
      <dt className="w-44 shrink-0 text-basis text-ink-soft">{label}</dt>
      <dd className="text-basis text-ink">{waarde}</dd>
    </div>
  );
}

export default async function AanvraagDetail({ params }: PageProps<"/account/[referentie]">) {
  const { referentie } = await params;
  const gebruiker = await vereisGebruiker(`/account/${referentie}`);

  const uitkomst = await aanvraagVanGebruiker(referentie, gebruiker.id);
  if (!uitkomst) notFound();

  const { aanvraag, reacties } = uitkomst;
  const dienst = getDienst(aanvraag.dienst);
  const optie = dienst?.opties.find((o) => o.id === aanvraag.type);

  return (
    <>
      <DashboardKop
        gebruiker={gebruiker}
        huidig="/account"
        links={[{ label: "Mijn aanvragen", href: "/account" }]}
      />

      <main className="flex-1 bg-brand-soft/40">
        <div className="container-page sectie">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-basis font-semibold text-ink-soft transition hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Al mijn aanvragen
          </Link>

          <h1 className="mt-5 font-display text-h2 text-ink">
            {dienst?.naam ?? aanvraag.dienst} in {aanvraag.plaats}
          </h1>
          <p className="mt-2 text-basis text-ink-soft">
            Referentie {aanvraag.referentie} · verstuurd op {datumTijd.format(new Date(aanvraag.aangemaakt_op))}
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
            <section>
              <h2 className="font-display text-h4 text-ink">
                {reacties.length === 0
                  ? aanvraag.ontvangers === 0
                    ? "Nog geen vakman gevonden"
                    : "Nog geen reacties"
                  : `${reacties.length} ${reacties.length === 1 ? "reactie" : "reacties"}`}
              </h2>

              {reacties.length === 0 ? (
                <p className="kaart mt-4 p-6 text-basis text-ink-soft">
                  {aanvraag.ontvangers === 0
                    ? `Voor deze dienst hebben we in ${aanvraag.plaats} nog geen vakmensen aangesloten. We gaan er zelf achteraan en laten het je weten zodra we iemand hebben gevonden.`
                    : "Je aanvraag staat klaar bij de vakmensen. De eerste reactie komt meestal binnen 24 uur; we sturen je een bericht zodra er iets binnen is."}
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {reacties.map((reactie) => (
                    <li key={reactie.id} className="kaart p-5 sm:p-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="font-display text-h5 text-ink">{reactie.bedrijf_naam}</h3>
                        <span className="text-klein text-ink-soft">
                          {datumTijd.format(new Date(reactie.aangemaakt_op))}
                        </span>
                      </div>

                      <QuoteIcon className="mt-4 h-6 w-6 text-brand/50" />
                      <p className="mt-2 whitespace-pre-line text-basis text-ink">{reactie.bericht}</p>

                      {reactie.prijs ? (
                        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-soft px-4 py-3 text-basis font-semibold text-brand-deep">
                          <EuroIcon className="h-5 w-5" />
                          {reactie.prijs}
                        </p>
                      ) : null}

                      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-lijn pt-4">
                        <a
                          href={`tel:${reactie.bedrijf_telefoon.replace(/\s/g, "")}`}
                          className="flex items-center gap-2 text-basis font-semibold text-brand-deep underline-offset-4 hover:underline"
                        >
                          <PhoneIcon className="h-4 w-4" />
                          {reactie.bedrijf_telefoon || "Geen nummer opgegeven"}
                        </a>
                        <Link
                          href={`/${aanvraag.dienst}`}
                          className="text-basis text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                        >
                          Bekijk profiel
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <aside>
              <h2 className="font-display text-h4 text-ink">Wat je hebt gevraagd</h2>
              <dl className="kaart mt-4 px-5 py-2 sm:px-6">
                <Regel label="Dienst" waarde={dienst?.naam ?? aanvraag.dienst} />
                <Regel label="Waarvoor" waarde={optie?.label ?? aanvraag.type} />
                <Regel label="Plaats" waarde={aanvraag.plaats} />
                <Regel label="Adres" waarde={aanvraag.adres} />
                <Regel
                  label={aanvraag.dagen.length === 1 ? "Gewenste dag" : "Gewenste dagen"}
                  waarde={aanvraag.dagen.map(leesbaar).join(", ")}
                />
                <Regel label="Wensen" waarde={aanvraag.wensen} />
              </dl>

              <div className="kaart mt-6 p-5 sm:p-6">
                <h3 className="font-display text-h5 text-ink">Je gegevens</h3>
                <p className="mt-3 space-y-1 text-basis text-ink-soft">
                  <span className="block text-ink">{aanvraag.naam}</span>
                  <span className="block">{aanvraag.email}</span>
                  <span className="block">{aanvraag.telefoon}</span>
                </p>
                {aanvraag.whatsapp ? (
                  <p className="mt-4 flex items-center gap-2 text-klein text-ink-soft">
                    <CheckIcon className="h-4 w-4 text-emerald-600" />
                    Je hebt toestemming gegeven voor updates via WhatsApp.
                  </p>
                ) : null}
                <p className="mt-4 flex items-start gap-2 text-klein text-ink-soft">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  Deze gegevens zijn alleen gedeeld met de vakmensen die je aanvraag hebben ontvangen.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
