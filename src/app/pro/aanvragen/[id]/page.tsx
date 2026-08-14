import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardKop } from "@/components/dashboard-kop";
import { ArrowLeftIcon, CheckIcon, EuroIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { ProReactieFormulier } from "@/components/pro-reactie-formulier";
import { aanvraagVanBedrijf, statusLabels, type Status } from "@/lib/aanvragen";
import { leesbaar } from "@/lib/agenda";
import { vereisBedrijf } from "@/lib/auth";
import { getDienst } from "@/lib/diensten";
import { statusWijzigen } from "@/lib/pro-acties";
import { PRO_LINKS } from "@/lib/pro-links";

export const metadata: Metadata = {
  title: "Aanvraag",
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
      <dt className="w-40 shrink-0 text-basis text-ink-soft">{label}</dt>
      <dd className="text-basis text-ink">{waarde}</dd>
    </div>
  );
}

export default async function ProAanvraagDetail({ params }: PageProps<"/pro/aanvragen/[id]">) {
  const { id } = await params;
  const { gebruiker, bedrijf } = await vereisBedrijf(`/pro/aanvragen/${id}`);

  const uitkomst = await aanvraagVanBedrijf(id, bedrijf.id);
  if (!uitkomst) notFound();

  const { aanvraag, reacties } = uitkomst;
  const dienst = getDienst(aanvraag.dienst);
  const optie = dienst?.opties.find((o) => o.id === aanvraag.type);

  return (
    <>
      <DashboardKop gebruiker={gebruiker} huidig="/pro/aanvragen" links={PRO_LINKS} />

      <main className="flex-1 bg-brand-soft/40">
        <div className="container-page sectie">
          <Link
            href="/pro/aanvragen"
            className="inline-flex items-center gap-2 text-basis font-semibold text-ink-soft transition hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Alle aanvragen
          </Link>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-h2 text-ink">{aanvraag.naam}</h1>
              <p className="mt-2 text-basis text-ink-soft">
                {dienst?.naam ?? aanvraag.dienst} in {aanvraag.plaats} ·{" "}
                {datumTijd.format(new Date(aanvraag.aangemaakt_op))}
              </p>
            </div>

            <form action={statusWijzigen} className="flex items-end gap-2">
              <input type="hidden" name="aanvraagId" value={aanvraag.id} />
              <div>
                <label htmlFor="status" className="block text-klein font-semibold text-ink">
                  Status
                </label>
                {/* key op de huidige status: zonder dat houdt React na de actie
                    de oude defaultValue vast en zet "Bijwerken" de status terug. */}
                <select
                  key={aanvraag.status}
                  id="status"
                  name="status"
                  defaultValue={aanvraag.status}
                  className="mt-1.5 h-11 rounded-xl border border-lijn bg-white px-3 text-basis text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                >
                  {(Object.keys(statusLabels) as Status[]).map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="h-11 rounded-xl border border-lijn bg-white px-4 font-display text-basis font-medium text-ink transition hover:bg-brand-soft"
              >
                Bijwerken
              </button>
            </form>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
            <div className="space-y-6">
              {reacties.length > 0 ? (
                <section>
                  <h2 className="font-display text-h4 text-ink">Wat je hebt gestuurd</h2>
                  <ul className="mt-4 space-y-4">
                    {reacties.map((reactie) => (
                      <li key={reactie.id} className="kaart p-5">
                        <p className="text-klein text-ink-soft">
                          {datumTijd.format(new Date(reactie.aangemaakt_op))}
                        </p>
                        <p className="mt-2 whitespace-pre-line text-basis text-ink">{reactie.bericht}</p>
                        {reactie.prijs ? (
                          <p className="mt-3 flex items-center gap-2 text-basis font-semibold text-brand-deep">
                            <EuroIcon className="h-5 w-5" />
                            {reactie.prijs}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <ProReactieFormulier aanvraagId={aanvraag.id} naam={aanvraag.naam} />
            </div>

            <aside>
              <h2 className="font-display text-h4 text-ink">De klus</h2>
              <dl className="kaart mt-4 px-5 py-2 sm:px-6">
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
                <h3 className="font-display text-h5 text-ink">Contact</h3>
                <p className="mt-3 text-basis text-ink">{aanvraag.naam}</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a
                      href={`tel:${aanvraag.telefoon.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-basis font-semibold text-brand-deep underline-offset-4 hover:underline"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      {aanvraag.telefoon}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${aanvraag.email}`}
                      className="flex items-center gap-2 break-all text-basis font-semibold text-brand-deep underline-offset-4 hover:underline"
                    >
                      <MapPinIcon className="h-4 w-4 shrink-0" />
                      {aanvraag.email}
                    </a>
                  </li>
                </ul>
                {aanvraag.whatsapp ? (
                  <p className="mt-4 flex items-center gap-2 text-klein text-ink-soft">
                    <CheckIcon className="h-4 w-4 text-emerald-600" />
                    Mag benaderd worden via WhatsApp.
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
