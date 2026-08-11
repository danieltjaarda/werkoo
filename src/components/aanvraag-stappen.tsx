"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import type { Dienst } from "@/lib/diensten";

type Formulier = {
  type: string;
  plaats: string;
  datum: string;
  budget: string;
  toelichting: string;
  naam: string;
  email: string;
  telefoon: string;
};

const budgetten = ["Tot € 750", "€ 750 – € 1.500", "€ 1.500 – € 3.000", "Meer dan € 3.000", "Weet ik nog niet"];

const stapTitels = ["Je opdracht", "Datum en plaats", "Budget", "Contactgegevens"];

const invoerklassen =
  "h-12 w-full rounded-2xl border border-lijn px-4 text-[15px] text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-brand focus:ring-4 focus:ring-brand/15";

export function AanvraagStappen({
  dienst,
  beginType,
  beginPlaats,
}: {
  dienst: Dienst;
  beginType: string;
  beginPlaats: string;
}) {
  const [stap, setStap] = useState(0);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [referentie, setReferentie] = useState<string | null>(null);
  const [waarden, setWaarden] = useState<Formulier>({
    type: dienst.opties.some((optie) => optie.id === beginType) ? beginType : "",
    plaats: beginPlaats,
    datum: "",
    budget: "",
    toelichting: "",
    naam: "",
    email: "",
    telefoon: "",
  });

  const zet = <K extends keyof Formulier>(veld: K, waarde: Formulier[K]) => {
    setWaarden((vorige) => ({ ...vorige, [veld]: waarde }));
    setFout(null);
  };

  function valideerStap() {
    if (stap === 0 && !waarden.type) return "Kies waar je de videograaf voor nodig hebt.";
    if (stap === 1 && !waarden.plaats.trim()) return "Vul de plaats van de opdracht in.";
    if (stap === 3) {
      if (!waarden.naam.trim()) return "Vul je naam in.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waarden.email)) return "Vul een geldig e-mailadres in.";
      if (!waarden.telefoon.trim()) return "Vul je telefoonnummer in.";
    }
    return null;
  }

  async function volgende() {
    const melding = valideerStap();
    if (melding) {
      setFout(melding);
      return;
    }

    if (stap < stapTitels.length - 1) {
      setStap((vorige) => vorige + 1);
      return;
    }

    setBezig(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dienst: dienst.slug, ...waarden }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFout(data.fout ?? "Er ging iets mis. Probeer het opnieuw.");
        return;
      }
      setReferentie(data.referentie);
    } catch {
      setFout("We konden je aanvraag niet versturen. Controleer je verbinding.");
    } finally {
      setBezig(false);
    }
  }

  if (referentie) {
    return (
      <div className="rounded-3xl border border-lijn bg-white p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/12 text-brand-deep">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-display text-[24px] font-bold tracking-[-0.02em] text-ink">
          Je aanvraag staat klaar
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
          We sturen je aanvraag door naar beschikbare videografen in {waarden.plaats}. Je ontvangt meestal binnen 24
          uur de eerste reacties op {waarden.email}.
        </p>
        <p className="mt-4 text-[13px] text-ink-soft">
          Referentie <span className="font-semibold text-ink">{referentie}</span>
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-12 items-center rounded-2xl bg-ink px-6 font-display text-[15px] font-medium text-white transition hover:bg-brand-deep"
        >
          Terug naar de homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-lijn bg-white p-6 sm:p-8">
      <ol className="flex flex-wrap gap-x-6 gap-y-2">
        {stapTitels.map((titel, index) => (
          <li
            key={titel}
            className={`flex items-center gap-2 text-[13px] font-medium ${
              index === stap ? "text-brand-deep" : "text-ink-soft"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${
                index < stap
                  ? "bg-brand text-white"
                  : index === stap
                    ? "bg-ink text-white"
                    : "bg-brand-soft text-ink-soft"
              }`}
            >
              {index < stap ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
            </span>
            {titel}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {stap === 0 ? (
          <fieldset>
            <legend className="font-display text-[18px] font-bold text-ink">
              Waar heb je {dienst.lidwoordNaam} voor nodig?
            </legend>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {dienst.opties.map((optie) => (
                <label
                  key={optie.id}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-lijn px-4 py-3.5 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft"
                >
                  <input
                    type="radio"
                    name="type"
                    value={optie.id}
                    checked={waarden.type === optie.id}
                    onChange={(event) => zet("type", event.target.value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-ink-soft/50 transition peer-checked:border-[5.5px] peer-checked:border-ink"
                  />
                  <span className="text-[15px] text-ink">{optie.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {stap === 1 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="plaats" className="block text-[14px] font-semibold text-ink">
                Plaats van de opdracht
              </label>
              <input
                id="plaats"
                value={waarden.plaats}
                onChange={(event) => zet("plaats", event.target.value)}
                placeholder="Bijvoorbeeld Joure"
                className={`mt-2 ${invoerklassen}`}
              />
            </div>
            <div>
              <label htmlFor="datum" className="block text-[14px] font-semibold text-ink">
                Gewenste datum <span className="font-normal text-ink-soft">(optioneel)</span>
              </label>
              <input
                id="datum"
                type="date"
                value={waarden.datum}
                onChange={(event) => zet("datum", event.target.value)}
                className={`mt-2 ${invoerklassen}`}
              />
            </div>
          </div>
        ) : null}

        {stap === 2 ? (
          <div>
            <fieldset>
              <legend className="font-display text-[18px] font-bold text-ink">Wat is je indicatieve budget?</legend>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {budgetten.map((budget) => (
                  <label
                    key={budget}
                    className="cursor-pointer rounded-full border border-lijn px-4 py-2 text-[14px] text-ink transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft has-[:checked]:font-semibold"
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={budget}
                      checked={waarden.budget === budget}
                      onChange={(event) => zet("budget", event.target.value)}
                      className="sr-only"
                    />
                    {budget}
                  </label>
                ))}
              </div>
            </fieldset>

            <label htmlFor="toelichting" className="mt-6 block text-[14px] font-semibold text-ink">
              Toelichting <span className="font-normal text-ink-soft">(optioneel)</span>
            </label>
            <textarea
              id="toelichting"
              rows={4}
              value={waarden.toelichting}
              onChange={(event) => zet("toelichting", event.target.value)}
              placeholder="Vertel kort wat je voor ogen hebt, hoeveel uur je nodig hebt en waar het opgenomen wordt."
              className="mt-2 w-full rounded-2xl border border-lijn p-4 text-[15px] text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
          </div>
        ) : null}

        {stap === 3 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="naam" className="block text-[14px] font-semibold text-ink">
                Naam
              </label>
              <input
                id="naam"
                autoComplete="name"
                value={waarden.naam}
                onChange={(event) => zet("naam", event.target.value)}
                className={`mt-2 ${invoerklassen}`}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-[14px] font-semibold text-ink">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={waarden.email}
                onChange={(event) => zet("email", event.target.value)}
                className={`mt-2 ${invoerklassen}`}
              />
            </div>
            <div>
              <label htmlFor="telefoon" className="block text-[14px] font-semibold text-ink">
                Telefoonnummer
              </label>
              <input
                id="telefoon"
                type="tel"
                autoComplete="tel"
                value={waarden.telefoon}
                onChange={(event) => zet("telefoon", event.target.value)}
                className={`mt-2 ${invoerklassen}`}
              />
            </div>
            <p className="text-[13px] leading-relaxed text-ink-soft sm:col-span-2">
              We delen je gegevens alleen met de videografen die op je aanvraag reageren. Je zit nergens aan vast.
            </p>
          </div>
        ) : null}
      </div>

      {fout ? (
        <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
          {fout}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStap((vorige) => Math.max(0, vorige - 1))}
          disabled={stap === 0}
          className="text-[14px] font-semibold text-ink-soft transition hover:text-ink disabled:invisible"
        >
          Vorige
        </button>
        <button
          type="button"
          onClick={volgende}
          disabled={bezig}
          className="flex h-13 items-center gap-2 rounded-2xl bg-zon px-7 font-display text-[15px] font-medium text-ink transition hover:bg-zon-dark disabled:opacity-60"
        >
          {stap === stapTitels.length - 1 ? (bezig ? "Versturen…" : "Aanvraag versturen") : "Volgende"}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
