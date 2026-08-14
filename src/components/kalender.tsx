"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { aantalDagen, maandnamen, sleutel, startKolom, weekdagen } from "@/lib/agenda";

/** Vandaag om middernacht, zodat een vergelijking met een dag klopt. */
function vandaag(): Date {
  const nu = new Date();
  return new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
}

function Maand({
  jaar,
  maand,
  gekozen,
  bezet,
  onKies,
}: {
  jaar: number;
  maand: number;
  gekozen: string[];
  bezet: Set<string>;
  onKies: (dag: string) => void;
}) {
  const grens = vandaag();
  const lege = Array.from({ length: startKolom(jaar, maand) });
  const dagen = Array.from({ length: aantalDagen(jaar, maand) }, (_, i) => i + 1);

  return (
    <div>
      <p className="text-center font-display text-basis font-semibold text-ink">
        {maandnamen[maand]} {jaar}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {weekdagen.map((dag) => (
          <span key={dag} className="pb-1 text-mini font-medium text-ink-soft">
            {dag}
          </span>
        ))}

        {lege.map((_, index) => (
          <span key={`leeg-${index}`} />
        ))}

        {dagen.map((dag) => {
          const datum = new Date(jaar, maand, dag);
          const waarde = sleutel(datum);
          const verleden = datum < grens;
          const isVol = bezet.has(waarde);
          const vrij = !verleden && !isVol;
          const staatAan = gekozen.includes(waarde);

          return (
            <button
              key={waarde}
              type="button"
              disabled={!vrij}
              aria-pressed={staatAan}
              aria-label={`${dag} ${maandnamen[maand]}${isVol ? " (bezet)" : ""}`}
              onClick={() => onKies(waarde)}
              className={`flex h-9 items-center justify-center rounded-lg text-basis transition ${
                staatAan
                  ? "bg-ink font-semibold text-white"
                  : vrij
                    ? "bg-brand-soft text-ink hover:bg-brand/25"
                    : // Doorstrepen betekent bezet; een dag die al geweest is vervaagt alleen.
                      `cursor-not-allowed text-ink-soft/40 ${isVol ? "line-through" : ""}`
              }`}
            >
              {dag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Twee maanden naast elkaar, net als bij de grote platforms: dagen waarop de
 * gekozen vakman al bezet is zijn doorgestreept, en je mag meerdere dagen
 * aanvinken zodat er iets te schuiven valt.
 */
export function Kalender({
  gekozen,
  onWijzig,
  bezet = [],
}: {
  gekozen: string[];
  onWijzig: (dagen: string[]) => void;
  /** Dagen waarop de gekozen vakman al vol zit; komt uit zijn beschikbaarheid. */
  bezet?: string[];
}) {
  const nu = vandaag();
  const volleDagen = new Set(bezet);
  const [verschuiving, setVerschuiving] = useState(0);

  const eerste = new Date(nu.getFullYear(), nu.getMonth() + verschuiving, 1);
  const tweede = new Date(nu.getFullYear(), nu.getMonth() + verschuiving + 1, 1);

  const wissel = (dag: string) => {
    onWijzig(gekozen.includes(dag) ? gekozen.filter((d) => d !== dag) : [...gekozen, dag]);
  };

  return (
    <div className="kaart p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setVerschuiving((v) => Math.max(0, v - 1))}
          disabled={verschuiving === 0}
          aria-label="Vorige maand"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-deep transition hover:bg-brand/25 disabled:opacity-40"
        >
          <ChevronDownIcon className="h-4 w-4 rotate-90" />
        </button>
        <p className="text-klein text-ink-soft">Kies één of meerdere dagen</p>
        <button
          type="button"
          onClick={() => setVerschuiving((v) => Math.min(11, v + 1))}
          aria-label="Volgende maand"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-deep transition hover:bg-brand/25"
        >
          <ChevronDownIcon className="h-4 w-4 -rotate-90" />
        </button>
      </div>

      <div className="mt-5 grid gap-7 sm:grid-cols-2 sm:gap-8">
        <Maand
          jaar={eerste.getFullYear()}
          maand={eerste.getMonth()}
          gekozen={gekozen}
          bezet={volleDagen}
          onKies={wissel}
        />
        <div className="hidden sm:block">
          <Maand
            jaar={tweede.getFullYear()}
            maand={tweede.getMonth()}
            gekozen={gekozen}
            bezet={volleDagen}
            onKies={wissel}
          />
        </div>
      </div>
    </div>
  );
}
