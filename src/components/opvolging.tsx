import Link from "next/link";
import { KlokIcon, WaarschuwingIcon } from "@/components/icons-extra";
import type { Opvolging as Cijfers } from "@/lib/aanvragen";

/**
 * Hoe snel een vakman reageert, over de laatste dertig dagen. De verdeling is
 * geordend van snel naar traag, dus de balken lopen van donker naar licht in
 * één kleur; alleen "niet gereageerd" valt eruit en krijgt de aandachtskleur.
 * Elke balk draagt zijn eigen percentage, zodat de kleur nooit de enige drager
 * van de betekenis is.
 */
const BAKKEN = [
  { sleutel: "binnen4", label: "Binnen 4 uur", kleur: "bg-brand-deep" },
  { sleutel: "binnen8", label: "Binnen 8 uur", kleur: "bg-brand-dark" },
  { sleutel: "binnen24", label: "Binnen 24 uur", kleur: "bg-brand" },
  { sleutel: "na24", label: "Na 24 uur", kleur: "bg-brand/40" },
  { sleutel: "geen", label: "Niet gereageerd", kleur: "bg-zon-dark" },
] as const;

/** Het oordeel dat bij een mediane reactietijd hoort. */
function oordeel(uren: number | null): { woord: string; toon: string } {
  if (uren === null) return { woord: "Nog geen", toon: "text-ink-soft" };
  if (uren <= 2) return { woord: "Heel snel", toon: "text-emerald-700" };
  if (uren <= 4) return { woord: "Snel", toon: "text-emerald-700" };
  if (uren <= 24) return { woord: "Gemiddeld", toon: "text-ink" };
  return { woord: "Traag", toon: "text-zon-dark" };
}

function tijd(uren: number): string {
  if (uren < 1) return `${Math.max(1, Math.round(uren * 60))} min`;
  if (uren < 24) return `${uren.toFixed(uren < 10 ? 1 : 0).replace(".", ",")} uur`;
  return `${Math.round(uren / 24)} dagen`;
}

export function Opvolging({ cijfers, dagen = 30 }: { cijfers: Cijfers; dagen?: number }) {
  const { totaal, medianeUren } = cijfers;
  const { woord, toon } = oordeel(medianeUren);
  const snelPercentage = totaal ? Math.round((cijfers.binnen4 / totaal) * 100) : 0;

  return (
    <section className="kaart p-5 sm:p-6" aria-labelledby="opvolging-kop">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="opvolging-kop" className="font-display text-h4 text-ink">
          Opvolging
        </h2>
        <p className="text-klein text-ink-soft">laatste {dagen} dagen</p>
      </div>

      {totaal === 0 ? (
        <p className="mt-3 text-basis text-ink-soft">
          Zodra je aanvragen binnenkrijgt zie je hier hoe snel je reageert. Dat weegt mee in hoe vaak klanten
          jou aanwijzen.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <p className="flex items-center gap-2">
                <KlokIcon className="h-8 w-8 text-brand-deep" />
                <span className={`font-display text-h2 leading-none ${toon}`}>{woord}</span>
              </p>
              <p className="mt-1.5 text-klein text-ink-soft">
                {medianeUren === null
                  ? `${totaal} ${totaal === 1 ? "aanvraag" : "aanvragen"}, nog niet op gereageerd`
                  : `Meestal binnen ${tijd(medianeUren)}`}
              </p>
            </div>
            <div>
              <p className="font-display text-h2 leading-none text-ink">{snelPercentage}%</p>
              <p className="mt-1.5 text-klein text-ink-soft">binnen 4 uur beantwoord</p>
            </div>
          </div>

          <ul className="mt-6 space-y-2.5">
            {BAKKEN.map((bak) => {
              const aantal = cijfers[bak.sleutel];
              const deel = totaal ? (aantal / totaal) * 100 : 0;
              return (
                <li key={bak.sleutel} className="grid grid-cols-[9.5rem_1fr_3rem] items-center gap-3">
                  <span className="text-klein text-ink-soft">{bak.label}</span>
                  {/* De balk is de vorm, het getal ernaast de waarde: kleur is nooit de enige drager. */}
                  <span className="h-2.5 overflow-hidden rounded-full bg-brand-soft">
                    <span
                      className={`block h-full rounded-full ${bak.kleur}`}
                      style={{ width: `${Math.max(deel, aantal > 0 ? 3 : 0)}%` }}
                    />
                  </span>
                  <span className="text-right text-klein font-semibold text-ink">{Math.round(deel)}%</span>
                </li>
              );
            })}
          </ul>

          {cijfers.geen > 0 || (medianeUren !== null && medianeUren > 4) ? (
            <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-zon-soft px-4 py-3 text-basis text-ink-soft">
              <WaarschuwingIcon className="mt-0.5 h-7 w-7 shrink-0 text-zon-dark" />
              <span>
                Reageer binnen een paar uur; dat vergroot de kans op de opdracht flink. Zet meldingen aan of kijk
                een paar keer per dag in{" "}
                <Link href="/pro/aanvragen" className="font-semibold text-brand-deep underline underline-offset-4">
                  je aanvragen
                </Link>
                .
              </span>
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
