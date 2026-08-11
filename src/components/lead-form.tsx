"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { ArrowRightIcon, MapPinIcon } from "@/components/icons";
import type { Dienst } from "@/lib/diensten";
import { PLAATS_COOKIE } from "@/lib/plaatsen";

const JAAR_IN_SECONDEN = 60 * 60 * 24 * 365;

/**
 * Onthoudt de plaats die iemand zelf invult, zodat die bij een volgend bezoek
 * voorgaat op wat het ip-adres suggereert.
 */
function onthoudPlaats(plaats: string) {
  document.cookie = `${PLAATS_COOKIE}=${encodeURIComponent(plaats)}; path=/; max-age=${JAAR_IN_SECONDEN}; samesite=lax`;
}

export function LeadForm({ dienst, plaats }: { dienst: Dienst; plaats?: string }) {
  const router = useRouter();
  const groupId = useId();
  const [gekozenOptie, setGekozenOptie] = useState("");
  const [plaatsnaam, setPlaatsnaam] = useState(plaats ?? "");
  const [fout, setFout] = useState<string | null>(null);

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
    router.push(`/aanvraag?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-lijn bg-white p-5 shadow-[0_18px_50px_-24px_rgba(18,20,26,0.35)] sm:p-6"
    >
      <fieldset>
        <legend className="text-[15px] font-semibold text-ink">
          Selecteer waar {dienst.lidwoordNaam} voor nodig is
        </legend>

        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          {dienst.opties.map((optie) => (
            <label
              key={optie.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-lijn bg-white px-4 py-3.5 transition hover:border-brand has-[:checked]:border-ink has-[:checked]:ring-1 has-[:checked]:ring-ink"
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
              <span className="text-[14px] text-ink">{optie.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor={`${groupId}-plaats`} className="sr-only">
            Plaats
          </label>
          <MapPinIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
          <input
            id={`${groupId}-plaats`}
            name="plaats"
            type="text"
            autoComplete="address-level2"
            placeholder="In welke plaats?"
            value={plaatsnaam}
            onChange={(event) => {
              setPlaatsnaam(event.target.value);
              setFout(null);
            }}
            className="h-13 w-full rounded-2xl border border-lijn bg-white pl-12 pr-4 text-[15px] text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </div>

        <button
          type="submit"
          className="flex h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-zon px-6 font-display text-[15px] font-medium text-ink transition hover:bg-zon-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Bekijk vakmensen
          <ArrowRightIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      {fout ? (
        <p role="alert" className="mt-3 text-[13px] font-medium text-red-600">
          {fout}
        </p>
      ) : null}
    </form>
  );
}
