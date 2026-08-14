import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DashboardKop } from "@/components/dashboard-kop";
import { ArrowRightIcon, CheckIcon, KeurmerkIcon } from "@/components/icons";
import { Rating } from "@/components/rating";
import { aanvragenVanBedrijf, cijfersVanBedrijf, statusLabels } from "@/lib/aanvragen";
import { vereisBedrijf } from "@/lib/auth";
import { vraag } from "@/lib/db";
import { getDienst } from "@/lib/diensten";
import { PRO_LINKS } from "@/lib/pro-links";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const datum = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" });

function Cijfer({ getal, label, nadruk = false }: { getal: number | string; label: string; nadruk?: boolean }) {
  return (
    <div className={`kaart p-5 ${nadruk ? "border-brand" : ""}`}>
      <p className="font-display text-h2 leading-none text-ink">{getal}</p>
      <p className="mt-2 text-klein text-ink-soft">{label}</p>
    </div>
  );
}

export default async function ProDashboard() {
  const { gebruiker, bedrijf } = await vereisBedrijf("/pro");

  const [cijfers, aanvragen, diensten] = await Promise.all([
    cijfersVanBedrijf(bedrijf.id),
    aanvragenVanBedrijf(bedrijf.id),
    vraag<{ dienst: string }>("select dienst from bedrijf_diensten where bedrijf_id = $1", [bedrijf.id]),
  ]);

  const recent = aanvragen.slice(0, 6);
  const uur = new Date().getHours();
  const groet = uur < 12 ? "Goedemorgen" : uur < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <>
      <DashboardKop gebruiker={gebruiker} huidig="/pro" links={PRO_LINKS} />

      <main className="flex-1 bg-brand-soft/40">
        <div className="container-page sectie">
          <h1 className="font-display text-h2 text-ink">
            {groet} {gebruiker.naam.split(" ")[0]}
          </h1>
          <p className="mt-2 text-lead text-ink-soft">
            {cijfers.open === 0
              ? "Je hebt alles bijgewerkt. Er staan geen aanvragen meer open."
              : `Er ${cijfers.open === 1 ? "staat 1 aanvraag" : `staan ${cijfers.open} aanvragen`} open.`}
          </p>

          {!bedrijf.actief ? (
            <div className="mt-6 rounded-2xl border border-zon-dark bg-zon-soft px-5 py-4">
              <p className="text-basis font-semibold text-ink">Je profiel staat nog op onzichtbaar</p>
              <p className="mt-1 text-basis text-ink-soft">
                Zolang dat zo is kom je niet in de lijsten en krijg je geen aanvragen.{" "}
                <Link href="/pro/instellingen" className="font-semibold text-brand-deep underline underline-offset-4">
                  Zet je profiel aan
                </Link>
                .
              </p>
            </div>
          ) : null}

          {diensten.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-zon-dark bg-zon-soft px-5 py-4">
              <p className="text-basis font-semibold text-ink">Je hebt nog geen diensten gekozen</p>
              <p className="mt-1 text-basis text-ink-soft">
                We weten daardoor niet welke aanvragen bij je passen.{" "}
                <Link href="/pro/instellingen" className="font-semibold text-brand-deep underline underline-offset-4">
                  Kies je diensten
                </Link>
                .
              </p>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Cijfer getal={cijfers.open} label="Open aanvragen" nadruk={cijfers.open > 0} />
            <Cijfer getal={cijfers.deze_maand} label="Binnengekomen, 30 dagen" />
            <Cijfer getal={cijfers.gereageerd} label="Gereageerd" />
            <Cijfer getal={cijfers.gewonnen} label="Gewonnen" />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-8">
            <section>
              <h2 className="font-display text-h4 text-ink">Jouw profiel</h2>
              <div className="kaart mt-4 p-5">
                <div className="flex items-center gap-4">
                  {bedrijf.foto ? (
                    <Image
                      src={bedrijf.foto}
                      alt=""
                      width={120}
                      height={120}
                      className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-soft font-display text-h4 text-brand-deep">
                      {bedrijf.naam.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-display text-h5 text-ink">{bedrijf.naam}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-display text-basis font-bold text-ink">
                        {bedrijf.score.toLocaleString("nl-NL")}
                      </span>
                      <Rating score={bedrijf.score} />
                      <span className="text-klein text-ink-soft">({bedrijf.reviews})</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 flex items-center gap-2 text-klein text-ink-soft">
                  {bedrijf.actief ? (
                    <>
                      <CheckIcon className="h-4 w-4 text-emerald-600" />
                      Zichtbaar in de lijsten
                    </>
                  ) : (
                    <>
                      <KeurmerkIcon className="h-4 w-4 text-ink-soft" />
                      Nog niet zichtbaar
                    </>
                  )}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/pro/instellingen"
                    className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 font-display text-basis font-medium text-white transition hover:bg-brand-deep"
                  >
                    Profiel bijwerken
                  </Link>
                  {bedrijf.actief && diensten[0] ? (
                    <Link
                      href={`/${diensten[0].dienst}`}
                      className="flex items-center gap-2 rounded-xl border border-lijn px-4 py-2.5 font-display text-basis font-medium text-ink transition hover:bg-brand-soft"
                    >
                      Bekijk op de site
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-h4 text-ink">Laatste aanvragen</h2>
                <Link
                  href="/pro/aanvragen"
                  className="flex items-center gap-1.5 text-basis font-semibold text-brand-deep underline-offset-4 hover:underline"
                >
                  Alle {aanvragen.length}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {recent.length === 0 ? (
                <p className="kaart mt-4 p-6 text-basis text-ink-soft">
                  Er zijn nog geen aanvragen binnengekomen. Zodra iemand in jouw regio een klus beschrijft die
                  bij je diensten past, staat hij hier.
                </p>
              ) : (
                <ul className="kaart mt-4 divide-y divide-lijn">
                  {recent.map((aanvraag) => (
                    <li key={aanvraag.id}>
                      <Link
                        href={`/pro/aanvragen/${aanvraag.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-brand-soft/50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-basis font-semibold text-ink">
                            {aanvraag.naam}
                          </span>
                          <span className="block truncate text-klein text-ink-soft">
                            {getDienst(aanvraag.dienst)?.naam ?? aanvraag.dienst} · {aanvraag.plaats}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-mini font-semibold ${
                              aanvraag.status === "nieuw"
                                ? "bg-zon-soft text-ink"
                                : aanvraag.status === "gewonnen"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-brand-soft text-brand-deep"
                            }`}
                          >
                            {statusLabels[aanvraag.status]}
                          </span>
                          <span className="text-klein text-ink-soft">
                            {datum.format(new Date(aanvraag.aangemaakt_op))}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
