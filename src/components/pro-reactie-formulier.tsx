"use client";

import { useActionState } from "react";
import { reageren, type Uitkomst } from "@/lib/pro-acties";

const leeg: Uitkomst = {};

/** Het antwoord van de vakman op een aanvraag: een bericht plus een richtprijs. */
export function ProReactieFormulier({ aanvraagId, naam }: { aanvraagId: string; naam: string }) {
  const [staat, actie, bezig] = useActionState(reageren, leeg);

  return (
    <form action={actie} className="kaart p-5 sm:p-6">
      <input type="hidden" name="aanvraagId" value={aanvraagId} />

      <h2 className="font-display text-h4 text-ink">Reageer op {naam}</h2>
      <p className="mt-1.5 text-basis text-ink-soft">
        {naam.split(" ")[0]} ziet je bericht in het eigen overzicht, met je telefoonnummer erbij.
      </p>

      <label htmlFor="bericht" className="mt-5 block text-basis font-semibold text-ink">
        Je bericht
      </label>
      <textarea
        id="bericht"
        name="bericht"
        rows={6}
        required
        placeholder="Vertel wat je voor deze klus kunt doen, wat je nodig hebt om een prijs te geven en wanneer je kunt."
        className="mt-2 w-full rounded-2xl border border-lijn bg-white p-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
      />

      <label htmlFor="prijs" className="mt-4 block text-basis font-semibold text-ink">
        Prijsindicatie <span className="font-normal text-ink-soft">(optioneel)</span>
      </label>
      <input
        id="prijs"
        name="prijs"
        placeholder="Bijvoorbeeld: € 850 tot € 1.200, afhankelijk van het aantal uren"
        className="mt-2 h-veld w-full rounded-2xl border border-lijn bg-white px-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
      />

      {staat.fout ? (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-basis font-medium text-red-700">
          {staat.fout}
        </p>
      ) : null}
      {staat.gelukt ? (
        <p role="status" className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-basis font-medium text-emerald-700">
          {staat.gelukt}
        </p>
      ) : null}

      <button
        type="submit"
        aria-disabled={bezig}
        className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-zon px-7 font-display text-basis font-medium text-ink transition hover:bg-zon-dark"
      >
        {bezig ? "Versturen…" : "Verstuur reactie"}
      </button>
    </form>
  );
}
