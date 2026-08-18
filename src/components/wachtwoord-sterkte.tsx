"use client";

import { useState } from "react";

/**
 * Drie streepjes onder het wachtwoordveld: rood, oranje, groen. Geen
 * wetenschap — lengte telt het zwaarst, variatie helpt, en de bekende
 * zwakke patronen trekken punten af. Bedoeld als duwtje, niet als slot.
 */
export function beoordeelWachtwoord(w: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!w) return { score: 0, label: "" };
  let punten = 0;
  if (w.length >= 8) punten += 1;
  if (w.length >= 12) punten += 1;
  if (w.length >= 16) punten += 1;
  const soorten = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(w)).length;
  if (soorten >= 2) punten += 1;
  if (soorten >= 3) punten += 1;
  if (/^(.)\1+$/.test(w) || /^(?:0123|1234|2345|abcd|qwer|wachtwoord|password|welkom)/i.test(w)) punten -= 2;
  if (w.length < 8) return { score: 1, label: "Te kort" };
  if (punten <= 2) return { score: 1, label: "Zwak" };
  if (punten <= 4) return { score: 2, label: "Redelijk" };
  return { score: 3, label: "Sterk" };
}

const kleuren = ["", "bg-red-500", "bg-amber-400", "bg-emerald-500"] as const;
const tekstkleuren = ["", "text-red-600", "text-amber-600", "text-emerald-700"] as const;

export function WachtwoordSterkte({ wachtwoord }: { wachtwoord: string }) {
  const { score, label } = beoordeelWachtwoord(wachtwoord);
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-colors ${n <= score ? kleuren[score] : "bg-lijn"}`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-klein ${score ? tekstkleuren[score] : "text-ink-soft"}`}>
        {label ? `${label}. ` : ""}Minstens 8 tekens; langer is beter dan ingewikkelder.
      </p>
    </div>
  );
}

/** Wachtwoordveld met de sterktebalk eronder; houdt zijn eigen waarde bij. */
export function WachtwoordVeld({
  id,
  naam = id,
  label,
  autoComplete = "new-password",
  klassen,
  waarde,
  onWaarde,
}: {
  id: string;
  naam?: string;
  label: string;
  autoComplete?: string;
  klassen: string;
  waarde?: string;
  onWaarde?: (w: string) => void;
}) {
  const [eigen, setEigen] = useState("");
  const huidig = waarde ?? eigen;
  const zet = onWaarde ?? setEigen;
  return (
    <div>
      <label htmlFor={id} className="block text-basis font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name={naam}
        type="password"
        autoComplete={autoComplete}
        required
        minLength={8}
        value={huidig}
        onChange={(e) => zet(e.target.value)}
        className={klassen}
      />
      <WachtwoordSterkte wachtwoord={huidig} />
    </div>
  );
}
