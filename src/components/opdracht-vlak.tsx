"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { HomeZoekform } from "@/components/home-zoekform";
import { ArrowRightIcon, SearchIcon, SterIcon } from "@/components/icons";

/**
 * Het zoekvlak op de homepage met twee ingangen: je klus in eigen woorden
 * beschrijven (dan zoekt de assistent de dienst erbij) of zelf de dienst
 * kiezen. Het eerste tabblad staat voor: mensen weten wel wat er kapot is,
 * niet hoe het vak heet.
 */
const VOORBEELDEN = [
  "We verbouwen onze badkamer en zoeken een betrouwbare aannemer die binnen 3 maanden kan starten",
  "Onze cv-ketel maakt een raar geluid en de radiatoren worden niet meer warm",
  "Ik zoek een videograaf voor onze bruiloft in juni in Amsterdam",
  "De tuin is compleet overwoekerd en moet opnieuw worden ingericht",
];

const SNELLE = ["Schilder voor woonkamer", "Verhuizing binnen Utrecht", "Boekhouder voor zzp'ers", "Dakkapel plaatsen"];

/** Typt de voorbeelden letter voor letter, wacht, en wist ze weer. */
function useTypendeTekst(actief: boolean): string {
  const [tekst, setTekst] = useState("");
  const staat = useRef({ zin: 0, teken: 0, wissen: false });

  useEffect(() => {
    if (!actief) return;
    let stop = false;

    function stap() {
      if (stop) return;
      const s = staat.current;
      const doel = VOORBEELDEN[s.zin % VOORBEELDEN.length]!;

      if (!s.wissen) {
        s.teken += 1;
        setTekst(doel.slice(0, s.teken));
        if (s.teken >= doel.length) {
          s.wissen = true;
          setTimeout(stap, 2600);
          return;
        }
        setTimeout(stap, 32);
        return;
      }

      s.teken -= 3;
      if (s.teken <= 0) {
        s.teken = 0;
        s.wissen = false;
        s.zin += 1;
        setTekst("");
        setTimeout(stap, 350);
        return;
      }
      setTekst(doel.slice(0, s.teken));
      setTimeout(stap, 12);
    }

    const start = setTimeout(stap, 600);
    return () => {
      stop = true;
      clearTimeout(start);
    };
  }, [actief]);

  return tekst;
}

export function OpdrachtVlak({ beginPlaats = "" }: { beginPlaats?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"beschrijven" | "dienst">("beschrijven");
  const [tekst, setTekst] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const voorbeeld = useTypendeTekst(tab === "beschrijven" && tekst === "");

  async function zoek(omschrijving: string) {
    const schoon = omschrijving.trim();
    if (schoon.length < 3) {
      setFout("Vertel in een zin wat je zoekt, dan zoeken wij de juiste vakmensen erbij.");
      return;
    }
    setFout("");
    setBezig(true);
    try {
      const antwoord = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tekst: schoon }),
      });
      const data = (await antwoord.json()) as { pad?: string; fout?: string };
      if (!antwoord.ok || !data.pad) throw new Error(data.fout ?? "Dat lukte even niet.");
      router.push(data.pad, { transitionTypes: ["nav-vooruit"] });
    } catch (e) {
      setBezig(false);
      setFout((e as Error).message || "Dat lukte even niet. Probeer het nog eens of kies zelf een dienst.");
    }
  }

  function opVerzenden(event: FormEvent) {
    event.preventDefault();
    void zoek(tekst);
  }

  return (
    <div className="w-full">
      <div className="kaart overflow-hidden p-0 text-left shadow-paneel">
        <div className="grid grid-cols-2" role="tablist" aria-label="Manier van zoeken">
          {(
            [
              { id: "beschrijven", label: "Beschrijf je opdracht", ai: true },
              { id: "dienst", label: "Zoeken op dienst", ai: false },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 font-display text-basis font-semibold transition ${
                tab === t.id ? "bg-white text-brand-deep" : "bg-brand-soft/70 text-ink-soft hover:text-ink"
              }`}
            >
              {t.ai ? <SterIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
              {t.label}
              {t.ai ? (
                <span className="rounded-md bg-brand px-1.5 py-0.5 font-display text-mini font-bold text-white">AI</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {tab === "beschrijven" ? (
            <form onSubmit={opVerzenden}>
              <label htmlFor="opdracht" className="sr-only">
                Beschrijf je opdracht
              </label>
              <div className="relative">
                <textarea
                  id="opdracht"
                  value={tekst}
                  onChange={(e) => {
                    setTekst(e.target.value);
                    setFout("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void zoek(tekst);
                    }
                  }}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-lijn bg-white p-3.5 text-lead text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                />
                {/* De typende voorbeeldzin ligt achter het lege veld; hij is decoratie, geen echte placeholder. */}
                {tekst === "" ? (
                  <p aria-hidden className="pointer-events-none absolute inset-0 p-3.5 text-lead text-ink-soft">
                    {voorbeeld}
                    <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-ink-soft align-middle" />
                  </p>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-end gap-3">
                {fout ? (
                  <p role="alert" className="mr-auto text-klein font-medium text-red-600">
                    {fout}
                  </p>
                ) : null}
                <button
                  type="submit"
                  aria-disabled={bezig}
                  className="flex h-veld items-center justify-center gap-2 rounded-2xl bg-zon px-6 font-display text-basis font-semibold text-ink transition hover:bg-zon-dark aria-disabled:opacity-70"
                >
                  {bezig ? "Even zoeken…" : "Help mij zoeken"}
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </button>
              </div>
            </form>
          ) : (
            <HomeZoekform beginPlaats={beginPlaats} kaal />
          )}
        </div>
      </div>

      {tab === "beschrijven" ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-klein text-ink-soft">Probeer:</span>
          {SNELLE.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setTekst(s);
                void zoek(s);
              }}
              className="rounded-full border border-lijn bg-white px-3.5 py-1.5 text-klein text-ink transition hover:border-brand hover:text-brand-deep"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
