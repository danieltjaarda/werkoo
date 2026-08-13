"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { ArrowRightIcon, VinkjeTekentIcon } from "@/components/icons";
import { PlaatsInvoer } from "@/components/plaats-invoer";
import type { Dienst } from "@/lib/diensten";
import { onthoudPlaats } from "@/lib/plaats-cookie";

/** Even lang als de tekenanimatie van het vinkje in globals.css. */
const VINKJE_DUUR = 320;

export function LeadForm({ dienst, plaats }: { dienst: Dienst; plaats?: string }) {
  const router = useRouter();
  const groupId = useId();
  const [gekozenOptie, setGekozenOptie] = useState("");
  const [plaatsnaam, setPlaatsnaam] = useState(plaats ?? "");
  const [fout, setFout] = useState<string | null>(null);
  const [bevestigd, setBevestigd] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gekozenOptie) {
      setFout(`Selecteer waar ${dienst.lidwoordNaam} voor nodig is.`);
      return;
    }
    if (!plaatsnaam.trim()) {
      setFout("Vul je plaats in, dan zoeken we in de buurt.");
      return;
    }

    const gekozenPlaats = plaatsnaam.trim();
    onthoudPlaats(gekozenPlaats);

    const params = new URLSearchParams({
      dienst: dienst.slug,
      type: gekozenOptie,
      plaats: gekozenPlaats,
    });

    // Eerst het vinkje laten zien, daarna pas doorschuiven naar de aanvraag.
    setBevestigd(true);
    setTimeout(() => {
      router.push(`/aanvraag?${params.toString()}`, { transitionTypes: ["nav-vooruit"] });
    }, VINKJE_DUUR);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="kaart p-5 shadow-paneel sm:p-6"
    >
      <fieldset>
        <legend className="text-basis font-semibold text-ink">
          Selecteer waar {dienst.lidwoordNaam} voor nodig is
        </legend>

        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          {dienst.opties.map((optie) => (
            <label
              key={optie.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-lijn bg-white px-4 py-3.5 transition hover:border-brand has-[:checked]:border-ink has-[:checked]:ring-1 has-[:checked]:ring-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-deep"
            >
              <input
                type="radio"
                name={`${groupId}-optie`}
                value={optie.id}
                checked={gekozenOptie === optie.id}
                onChange={(event) => {
                  setGekozenOptie(event.target.value);
                  setFout(null);
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-ink-soft/50 transition peer-checked:border-[5.5px] peer-checked:border-ink"
              />
              <span className="text-basis text-ink">{optie.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`${groupId}-plaats`} className="sr-only">
            Plaats
          </label>
          <PlaatsInvoer
            id={`${groupId}-plaats`}
            waarde={plaatsnaam}
            onWaarde={(nieuw) => {
              setPlaatsnaam(nieuw);
              setFout(null);
            }}
            metPin
            klassen="h-veld w-full rounded-2xl border border-lijn bg-white pl-12 pr-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </div>

        <button
          type="submit"
          disabled={bevestigd}
          className="relative flex h-veld shrink-0 items-center justify-center gap-2 rounded-2xl bg-zon px-6 font-display text-basis font-medium text-ink transition hover:bg-zon-dark"
        >
          {/* Het label blijft staan zodat de knop niet van breedte verspringt. */}
          <span
            className={`flex items-center gap-2 transition-opacity duration-150 ${bevestigd ? "opacity-0" : "opacity-100"}`}
          >
            Bekijk vakmensen
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </span>

          {bevestigd ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <VinkjeTekentIcon className="h-6 w-6" />
            </span>
          ) : null}
        </button>
      </div>

      {fout ? (
        <p role="alert" className="mt-3 text-klein font-medium text-red-600">
          {fout}
        </p>
      ) : null}
    </form>
  );
}
