"use client";

import Link from "next/link";
import { useActionState } from "react";
import { wachtwoordHerstellen, wachtwoordVergeten, type Uitkomst } from "@/lib/auth-acties";

const leeg: Uitkomst = {};

const veldklassen =
  "mt-2 h-veld w-full rounded-2xl border border-lijn bg-white px-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15";

const knopklassen =
  "flex h-12 w-full items-center justify-center rounded-2xl bg-ink font-display text-basis font-medium text-white transition hover:bg-brand-deep";

function Melding({ staat }: { staat: Uitkomst }) {
  if (staat.fout)
    return (
      <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-basis font-medium text-red-700">
        {staat.fout}
      </p>
    );
  if (staat.gelukt)
    return (
      <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-basis font-medium text-emerald-800">
        {staat.gelukt}
      </p>
    );
  return null;
}

/** Stap 1: e-mailadres invullen, link ontvangen. */
export function WachtwoordVergetenKaart() {
  const [staat, actie, bezig] = useActionState(wachtwoordVergeten, leeg);

  return (
    <div className="kaart mt-8 p-6 sm:p-8">
      <h1 className="text-center font-display text-h4 text-ink">Wachtwoord vergeten</h1>
      <p className="mt-2 text-center text-basis text-ink-soft">
        Vul je e-mailadres in en we sturen je een link om een nieuw wachtwoord te kiezen.
      </p>

      <form action={actie} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-basis font-semibold text-ink">
            E-mailadres
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className={veldklassen} />
        </div>
        <Melding staat={staat} />
        <button type="submit" aria-disabled={bezig} className={knopklassen}>
          {bezig ? "Bezig…" : "Stuur me een link"}
        </button>
      </form>

      <p className="mt-5 text-center text-klein text-ink-soft">
        <Link href="/inloggen" className="font-semibold text-brand-deep underline underline-offset-4">
          Terug naar inloggen
        </Link>
      </p>
    </div>
  );
}

/** Stap 2: nieuw wachtwoord kiezen met het token uit de link. */
export function WachtwoordHerstellenKaart({ token }: { token: string }) {
  const [staat, actie, bezig] = useActionState(wachtwoordHerstellen, leeg);

  return (
    <div className="kaart mt-8 p-6 sm:p-8">
      <h1 className="text-center font-display text-h4 text-ink">Nieuw wachtwoord</h1>
      <p className="mt-2 text-center text-basis text-ink-soft">Kies een nieuw wachtwoord van minstens 8 tekens.</p>

      <form action={actie} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="wachtwoord" className="block text-basis font-semibold text-ink">
            Nieuw wachtwoord
          </label>
          <input
            id="wachtwoord"
            name="wachtwoord"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={veldklassen}
          />
        </div>
        <Melding staat={staat} />
        <button type="submit" aria-disabled={bezig} className={knopklassen}>
          {bezig ? "Bezig…" : "Wachtwoord opslaan"}
        </button>
      </form>

      <p className="mt-5 text-center text-klein text-ink-soft">
        Link verlopen?{" "}
        <Link href="/wachtwoord-vergeten" className="font-semibold text-brand-deep underline underline-offset-4">
          Vraag een nieuwe aan
        </Link>
        .
      </p>
    </div>
  );
}
