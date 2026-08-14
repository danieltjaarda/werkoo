"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { inloggen, registreren, type Uitkomst } from "@/lib/auth-acties";

type Modus = "inloggen" | "registreren";
type Soort = "particulier" | "bedrijf";

const veldklassen =
  "mt-2 h-veld w-full rounded-2xl border border-lijn bg-white px-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15";

const leeg: Uitkomst = {};

function Veld({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  verplicht = true,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  verplicht?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-basis font-semibold text-ink">
        {label}
        {verplicht ? "" : <span className="ml-1.5 font-normal text-ink-soft">(optioneel)</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={verplicht}
        className={veldklassen}
      />
      {hint ? <p className="mt-1.5 text-klein text-ink-soft">{hint}</p> : null}
    </div>
  );
}

/**
 * Inloggen en registreren in één kaart. Bij registreren kies je eerst wat voor
 * account je wil: een particulier doet aanvragen, een bedrijf ontvangt ze. Dat
 * onderscheid bepaalt naar welk dashboard je daarna gaat.
 */
export function InlogKaart({ verder = "", beginModus = "inloggen" }: { verder?: string; beginModus?: Modus }) {
  const [modus, setModus] = useState<Modus>(beginModus);
  const [soort, setSoort] = useState<Soort>("particulier");

  const [inlogStaat, inlogActie, inlogBezig] = useActionState(inloggen, leeg);
  const [regStaat, regActie, regBezig] = useActionState(registreren, leeg);

  const registreert = modus === "registreren";
  const staat = registreert ? regStaat : inlogStaat;
  const bezig = registreert ? regBezig : inlogBezig;

  return (
    <div className="kaart mt-8 overflow-hidden">
      <div className="grid grid-cols-2">
        {(["inloggen", "registreren"] as Modus[]).map((optie) => (
          <button
            key={optie}
            type="button"
            onClick={() => setModus(optie)}
            aria-pressed={modus === optie}
            className={`border-b-2 py-4 font-display text-basis font-medium transition ${
              modus === optie ? "border-brand text-brand-deep" : "border-lijn text-ink-soft hover:text-ink"
            }`}
          >
            {optie === "inloggen" ? "Inloggen" : "Account maken"}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {registreert ? (
          <>
            <h1 className="text-center font-display text-h4 text-ink">Maak een account</h1>
            <p className="mt-2 text-center text-basis text-ink-soft">
              Zo zie je al je aanvragen en de reacties daarop bij elkaar.
            </p>

            <fieldset className="mt-6">
              <legend className="sr-only">Wat voor account wil je?</legend>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    { id: "particulier", kop: "Ik zoek een vakman", regel: "Je doet aanvragen" },
                    { id: "bedrijf", kop: "Ik ben vakman", regel: "Je ontvangt aanvragen" },
                  ] as const
                ).map((optie) => (
                  <label
                    key={optie.id}
                    className="flex cursor-pointer flex-col rounded-2xl border border-lijn bg-white px-4 py-3 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-deep"
                  >
                    <input
                      type="radio"
                      name="soort"
                      value={optie.id}
                      form="account-formulier"
                      checked={soort === optie.id}
                      onChange={() => setSoort(optie.id)}
                      className="peer sr-only"
                    />
                    <span className="text-basis font-semibold text-ink">{optie.kop}</span>
                    <span className="mt-0.5 text-klein text-ink-soft">{optie.regel}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <form id="account-formulier" action={regActie} className="mt-5 space-y-4">
              <input type="hidden" name="verder" value={verder} />
              <Veld id="naam" label="Je naam" autoComplete="name" />
              {soort === "bedrijf" ? (
                <Veld id="bedrijfsnaam" label="Naam van je bedrijf" autoComplete="organization" />
              ) : null}
              <Veld id="email" label="E-mailadres" type="email" autoComplete="email" />
              <Veld id="telefoon" label="Telefoonnummer" type="tel" autoComplete="tel" verplicht={false} />
              <Veld
                id="wachtwoord"
                label="Wachtwoord"
                type="password"
                autoComplete="new-password"
                hint="Minstens 8 tekens."
              />

              {staat.fout ? (
                <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-basis font-medium text-red-700">
                  {staat.fout}
                </p>
              ) : null}

              <button
                type="submit"
                aria-disabled={bezig}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-ink font-display text-basis font-medium text-white transition hover:bg-brand-deep"
              >
                {bezig ? "Bezig…" : "Account maken"}
              </button>
            </form>

            <p className="mt-5 text-center text-klein text-ink-soft">
              Door een account te maken ga je akkoord met onze{" "}
              <Link href="/voorwaarden" className="font-semibold text-brand-deep underline underline-offset-4">
                voorwaarden
              </Link>{" "}
              en{" "}
              <Link href="/privacy" className="font-semibold text-brand-deep underline underline-offset-4">
                privacyverklaring
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="text-center font-display text-h4 text-ink">Welkom terug</h1>
            <p className="mt-2 text-center text-basis text-ink-soft">
              Log in om je aanvragen en de reacties daarop te bekijken.
            </p>

            <form action={inlogActie} className="mt-6 space-y-4">
              <input type="hidden" name="verder" value={verder} />
              <Veld id="email" label="E-mailadres" type="email" autoComplete="email" />
              <Veld id="wachtwoord" label="Wachtwoord" type="password" autoComplete="current-password" />

              {staat.fout ? (
                <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-basis font-medium text-red-700">
                  {staat.fout}
                </p>
              ) : null}

              <button
                type="submit"
                aria-disabled={bezig}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-ink font-display text-basis font-medium text-white transition hover:bg-brand-deep"
              >
                {bezig ? "Bezig…" : "Inloggen"}
              </button>
            </form>

            <p className="mt-5 text-center text-klein text-ink-soft">
              Nog geen account?{" "}
              <button
                type="button"
                onClick={() => setModus("registreren")}
                className="font-semibold text-brand-deep underline underline-offset-4"
              >
                Maak er een aan
              </button>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
