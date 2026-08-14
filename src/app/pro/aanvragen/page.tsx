import type { Metadata } from "next";
import Link from "next/link";
import { DashboardKop } from "@/components/dashboard-kop";
import { ArrowRightIcon } from "@/components/icons";
import { aanvragenVanBedrijf, statusLabels, type Status } from "@/lib/aanvragen";
import { vereisBedrijf } from "@/lib/auth";
import { getDienst } from "@/lib/diensten";
import { PRO_LINKS } from "@/lib/pro-links";

export const metadata: Metadata = {
  title: "Aanvragen",
  robots: { index: false, follow: false },
};

const datum = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" });

const statusKleur: Record<Status, string> = {
  nieuw: "bg-zon-soft text-ink",
  in_behandeling: "bg-brand-soft text-brand-deep",
  gereageerd: "bg-brand-soft text-brand-deep",
  gewonnen: "bg-emerald-50 text-emerald-700",
  verloren: "bg-lijn text-ink-soft",
};

export default async function ProAanvragen({ searchParams }: PageProps<"/pro/aanvragen">) {
  const { gebruiker, bedrijf } = await vereisBedrijf("/pro/aanvragen");
  const alles = await aanvragenVanBedrijf(bedrijf.id);

  const params = await searchParams;
  const gevraagd = Array.isArray(params.status) ? params.status[0] : params.status;
  const filter = gevraagd && gevraagd in statusLabels ? (gevraagd as Status) : undefined;
  const lijst = filter ? alles.filter((a) => a.status === filter) : alles;

  const tellingen = (Object.keys(statusLabels) as Status[]).map((status) => ({
    status,
    aantal: alles.filter((a) => a.status === status).length,
  }));

  return (
    <>
      <DashboardKop gebruiker={gebruiker} huidig="/pro/aanvragen" links={PRO_LINKS} />

      <main className="flex-1 bg-brand-soft/40">
        <div className="container-page sectie">
          <h1 className="font-display text-h2 text-ink">Aanvragen</h1>
          <p className="mt-2 text-lead text-ink-soft">
            Alles wat er via Werkoo bij {bedrijf.naam} is binnengekomen.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/pro/aanvragen"
              className={`rounded-full px-4 py-2 text-basis font-medium transition ${
                filter ? "border border-lijn bg-white text-ink hover:border-brand" : "bg-ink text-white"
              }`}
            >
              Alle {alles.length}
            </Link>
            {tellingen
              .filter((t) => t.aantal > 0)
              .map((t) => (
                <Link
                  key={t.status}
                  href={`/pro/aanvragen?status=${t.status}`}
                  className={`rounded-full px-4 py-2 text-basis font-medium transition ${
                    filter === t.status ? "bg-ink text-white" : "border border-lijn bg-white text-ink hover:border-brand"
                  }`}
                >
                  {statusLabels[t.status]} {t.aantal}
                </Link>
              ))}
          </div>

          {lijst.length === 0 ? (
            <p className="kaart mt-8 p-6 text-basis text-ink-soft">
              {alles.length === 0
                ? "Er zijn nog geen aanvragen binnengekomen. Controleer of je profiel zichtbaar staat en of je de juiste diensten hebt gekozen."
                : "Geen aanvragen met deze status."}
            </p>
          ) : (
            <ul className="kaart mt-8 divide-y divide-lijn">
              {lijst.map((aanvraag) => (
                <li key={aanvraag.id}>
                  <Link
                    href={`/pro/aanvragen/${aanvraag.id}`}
                    className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 transition hover:bg-brand-soft/50 sm:px-6"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-basis font-bold text-ink">
                        {aanvraag.naam}
                      </span>
                      <span className="block truncate text-klein text-ink-soft">
                        {getDienst(aanvraag.dienst)?.naam ?? aanvraag.dienst} · {aanvraag.plaats}
                        {aanvraag.wensen ? ` · ${aanvraag.wensen.slice(0, 70)}${aanvraag.wensen.length > 70 ? "…" : ""}` : ""}
                      </span>
                    </span>

                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-mini font-semibold ${statusKleur[aanvraag.status]}`}>
                      {statusLabels[aanvraag.status]}
                    </span>
                    <span className="w-24 shrink-0 text-klein text-ink-soft">
                      {datum.format(new Date(aanvraag.aangemaakt_op))}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-soft/50" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
