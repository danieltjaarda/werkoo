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

type Onboardingstap = { label: string; klaar: boolean; href: string; tip: string };

/**
 * De checklist voor een vers profiel. Verdwijnt zodra alles is afgevinkt; tot
 * die tijd is dit het eerste wat een vakman ziet, want zonder deze stappen
 * komt er geen aanvraag binnen en dan lijkt het platform stil.
 */
function Onboarding({ welkom, stappen, profielPad }: { welkom: boolean; stappen: Onboardingstap[]; profielPad: string }) {
  const klaar = stappen.filter((s) => s.klaar).length;
  if (klaar === stappen.length && !welkom) return null;

  return (
    <section className="kaart mt-6 border-brand p-5 sm:p-6" aria-labelledby="onboarding-kop">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="onboarding-kop" className="font-display text-h4 text-ink">
          {welkom ? "Welkom bij Werkoo!" : "Maak je profiel af"}
        </h2>
        <p className="text-klein text-ink-soft">{klaar} van {stappen.length} klaar</p>
      </div>
      <p className="mt-1 text-basis text-ink-soft">
        {klaar === stappen.length
          ? "Alles staat. Je profiel is live en je ontvangt aanvragen zodra een klant jou aanwijst."
          : "Nog een paar stappen en je kunt aanvragen ontvangen."}
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-soft" role="progressbar" aria-valuemin={0} aria-valuemax={stappen.length} aria-valuenow={klaar}>
        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(klaar / stappen.length) * 100}%` }} />
      </div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {stappen.map((stap) => (
          <li key={stap.label}>
            <Link
              href={stap.href}
              className={`flex h-full items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                stap.klaar ? "border-lijn bg-white" : "border-zon-dark bg-zon-soft hover:border-ink"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  stap.klaar ? "bg-emerald-600 text-white" : "border-2 border-ink/30"
                }`}
                aria-hidden
              >
                {stap.klaar ? <CheckIcon className="h-3.5 w-3.5" /> : null}
              </span>
              <span>
                <span className={`block text-basis font-semibold ${stap.klaar ? "text-ink-soft line-through" : "text-ink"}`}>
                  {stap.label}
                </span>
                <span className="mt-0.5 block text-klein text-ink-soft">{stap.tip}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {klaar === stappen.length ? (
        <p className="mt-4">
          <Link href={profielPad} className="flex items-center gap-1.5 text-basis font-semibold text-brand-deep underline-offset-4 hover:underline">
            Bekijk je openbare profiel
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </p>
      ) : null}
    </section>
  );
}

export default async function ProDashboard({ searchParams }: PageProps<"/pro">) {
  const { gebruiker, bedrijf } = await vereisBedrijf("/pro");
  const welkom = (await searchParams).welkom === "1";

  const [cijfers, aanvragen, diensten, gebied] = await Promise.all([
    cijfersVanBedrijf(bedrijf.id),
    aanvragenVanBedrijf(bedrijf.id),
    vraag<{ dienst: string }>("select dienst from bedrijf_diensten where bedrijf_id = $1", [bedrijf.id]),
    vraag<{ n: number }>("select count(*)::int as n from bedrijf_plaatsen where bedrijf_id = $1", [bedrijf.id]),
  ]);
  const werkgebied = gebied[0]?.n ?? 0;

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

          <Onboarding
            welkom={welkom}
            stappen={[
              { label: "Diensten gekozen", klaar: diensten.length > 0, href: "/pro/instellingen#diensten", tip: "Alleen aanvragen voor deze diensten komen bij je binnen." },
              { label: "Werkgebied ingesteld", klaar: werkgebied > 0, href: "/pro/instellingen#werkgebied", tip: "De plaatsen waar je opdrachten wilt aannemen." },
              { label: "Profieltekst en belofte geschreven", klaar: bedrijf.tekst.trim().length >= 40 && bedrijf.belofte.trim().length > 0, href: "/pro/instellingen#profiel", tip: "Dit is wat klanten lezen voordat ze jou aanwijzen." },
              { label: "Profiel op zichtbaar", klaar: bedrijf.actief, href: "/pro/instellingen#profiel", tip: "Pas dan sta je in de lijsten en op je eigen pagina." },
            ]}
            profielPad={`/vakman/${bedrijf.slug}`}
          />

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
