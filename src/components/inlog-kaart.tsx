"use client";

import { useState } from "react";
import { MerkKnop } from "@/components/aanvraag-stappen";

type Soort = "particulier" | "bedrijf";

const teksten: Record<Soort, { kop: string; tekst: string }> = {
  particulier: {
    kop: "Welkom terug",
    tekst: "Log in om je aanvragen en de reacties daarop te bekijken.",
  },
  bedrijf: {
    kop: "Inloggen als bedrijf",
    tekst: "Beheer je profiel, je beschikbaarheid en de aanvragen die binnenkomen.",
  },
};

/**
 * De keuze tussen particulier en bedrijf staat bovenaan, want het zijn twee
 * verschillende soorten accounts: de een doet aanvragen, de ander krijgt ze.
 */
export function InlogKaart() {
  const [soort, setSoort] = useState<Soort>("particulier");
  const [email, setEmail] = useState("");
  const [gestuurd, setGestuurd] = useState(false);

  return (
    <div className="kaart mt-8 overflow-hidden">
      <div className="grid grid-cols-2">
        {(["particulier", "bedrijf"] as Soort[]).map((optie) => (
          <button
            key={optie}
            type="button"
            onClick={() => {
              setSoort(optie);
              setGestuurd(false);
            }}
            aria-pressed={soort === optie}
            className={`border-b-2 py-4 font-display text-basis font-medium capitalize transition ${
              soort === optie
                ? "border-brand text-brand-deep"
                : "border-lijn text-ink-soft hover:text-ink"
            }`}
          >
            {optie}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {gestuurd ? (
          <div className="text-center">
            <h1 className="font-display text-h4 text-ink">Kijk in je mail</h1>
            <p className="mt-2 text-basis text-ink-soft">
              We hebben een inloglink gestuurd naar {email}. De link is een uur geldig.
            </p>
            <button
              type="button"
              onClick={() => setGestuurd(false)}
              className="mt-5 text-basis font-semibold text-ink-soft transition hover:text-ink"
            >
              Ander e-mailadres gebruiken
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-center font-display text-h4 text-ink">{teksten[soort].kop}</h1>
            <p className="mt-2 text-center text-basis text-ink-soft">{teksten[soort].tekst}</p>

            <div className="mt-6 space-y-2.5">
              <MerkKnop merk="google" />
              <MerkKnop merk="apple" />
            </div>

            <div className="my-5 flex items-center gap-3 text-mini uppercase tracking-[0.12em] text-ink-soft">
              <span className="h-px flex-1 bg-lijn" />
              of
              <span className="h-px flex-1 bg-lijn" />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (email.trim()) setGestuurd(true);
              }}
            >
              <label htmlFor="inlog-email" className="block text-basis font-semibold text-ink">
                E-mailadres
              </label>
              <input
                id="inlog-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-veld w-full rounded-2xl border border-lijn px-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
              <button
                type="submit"
                className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl bg-ink font-display text-basis font-medium text-white transition hover:bg-brand-deep"
              >
                Doorgaan met e-mail
              </button>
            </form>

            <p className="mt-5 text-center text-klein text-ink-soft">
              {soort === "particulier"
                ? "Nog geen account? Die maken we vanzelf zodra je een aanvraag doet."
                : "Nog geen bedrijfsprofiel? Meld je bedrijf aan via de knop in de header."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
