"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DienstZoeker } from "@/components/dienst-zoeker";
import { ArrowRightIcon, VinkjeTekentIcon } from "@/components/icons";
import { PlaatsInvoer } from "@/components/plaats-invoer";
import { populaireDiensten, type Dienst } from "@/lib/diensten";
import { onthoudPlaats } from "@/lib/plaats-cookie";
import { bekendePlaats, slugVanPlaatsnaam } from "@/lib/plaatsen";

/** Even lang als de tekenanimatie van het vinkje in globals.css. */
const VINKJE_DUUR = 320;

const invoerklassen =
  "h-veld w-full rounded-2xl border border-lijn bg-white pl-12 pr-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15";

/**
 * Het zoekvak op de homepage: eerst wát je zoekt, dan waar. Kennen we de plaats,
 * dan gaat de bezoeker naar de statische plaatspagina; anders naar de dienst met
 * de plaats als zoekterm erachter.
 */
export function HomeZoekform({ beginPlaats = "", kaal = false }: { beginPlaats?: string; kaal?: boolean }) {
  const router = useRouter();
  const [dienstTerm, setDienstTerm] = useState("");
  const [dienst, setDienst] = useState<Dienst | null>(null);
  const [plaatsnaam, setPlaatsnaam] = useState(beginPlaats);
  const [fout, setFout] = useState<string | null>(null);
  const [bevestigd, setBevestigd] = useState(false);

  function gaNaar(gekozen: Dienst, plaats: string) {
    const schoon = plaats.trim();
    onthoudPlaats(schoon);

    const bekend = schoon ? bekendePlaats(schoon) : undefined;
    const doel = bekend
      ? `/${gekozen.slug}/${slugVanPlaatsnaam(bekend)}`
      : schoon
        ? `/${gekozen.slug}?plaats=${encodeURIComponent(schoon)}`
        : `/${gekozen.slug}`;

    setBevestigd(true);
    setTimeout(() => router.push(doel, { transitionTypes: ["nav-vooruit"] }), VINKJE_DUUR);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dienst) {
      setFout("Kies waar je hulp bij zoekt, dan zoeken we de juiste vakmensen erbij.");
      return;
    }

    gaNaar(dienst, plaatsnaam);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        noValidate
        className={kaal ? "text-left" : "kaart p-4 text-left shadow-paneel sm:p-5"}
        aria-label="Zoek een vakman"
      >
        <div className="grid gap-2.5 md:grid-cols-[1.15fr_1fr_auto]">
          <div>
            <label htmlFor="home-dienst" className="sr-only">
              Welke vakman zoek je?
            </label>
            <DienstZoeker
              id="home-dienst"
              waarde={dienstTerm}
              onWaarde={(nieuw) => {
                setDienstTerm(nieuw);
                setDienst(null);
                setFout(null);
              }}
              onKies={(gekozen) => {
                setDienst(gekozen);
                setDienstTerm(gekozen.menuLabel);
                setFout(null);
              }}
              klassen={invoerklassen}
            />
          </div>

          <div>
            <label htmlFor="home-plaats" className="sr-only">
              In welke plaats?
            </label>
            <PlaatsInvoer
              id="home-plaats"
              waarde={plaatsnaam}
              onWaarde={(nieuw) => {
                setPlaatsnaam(nieuw);
                setFout(null);
              }}
              metPin
              klassen={invoerklassen}
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

      <div className={`flex flex-wrap items-center justify-center gap-2 ${kaal ? "mt-4" : "mt-5"}`}>
        <span className="text-klein text-ink-soft">Vaak gezocht:</span>
        {populaireDiensten().map((populair) => (
          <Link
            key={populair.slug}
            href={`/${populair.slug}`}
            className="rounded-full border border-lijn bg-white px-3.5 py-1.5 text-klein text-ink transition hover:border-brand hover:text-brand-deep"
          >
            {populair.menuLabel}
          </Link>
        ))}
      </div>
    </div>
  );
}
