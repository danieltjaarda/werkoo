"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { MapPinIcon } from "@/components/icons";
import {
  eigenSuggesties,
  voegSamen,
  zoekAdressen,
  zoekPlaatsen,
  type Suggestie,
} from "@/lib/plaats-suggesties";

/** Zo lang wachten we na een toetsaanslag voordat we de Locatieserver bevragen. */
const WACHTTIJD = 180;

/** Ongeveer de hoogte van een volle lijst; bepaalt of hij omlaag of omhoog klapt. */
const LIJSTHOOGTE = 200;

export function PlaatsInvoer({
  id,
  naam = "plaats",
  waarde,
  onWaarde,
  placeholder = "In welke plaats?",
  klassen,
  metPin = false,
  soort = "plaats",
}: {
  id: string;
  naam?: string;
  waarde: string;
  onWaarde: (waarde: string) => void;
  placeholder?: string;
  klassen: string;
  metPin?: boolean;
  /** Woonplaatsen of hele adressen; bepaalt wat de Locatieserver teruggeeft. */
  soort?: "plaats" | "adres";
}) {
  const lijstId = `${useId()}-suggesties`;
  const [suggesties, setSuggesties] = useState<Suggestie[]>([]);
  const [open, setOpen] = useState(false);
  const [actief, setActief] = useState(-1);
  const [omhoog, setOmhoog] = useState(false);

  const veld = useRef<HTMLInputElement>(null);
  const teller = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lopendeVraag = useRef<AbortController | null>(null);

  /** Onderaan het scherm is er geen plek meer onder het veld, dan klapt de lijst omhoog. */
  function bepaalRichting() {
    const rand = veld.current?.getBoundingClientRect();
    if (!rand) return;
    const onder = window.innerHeight - rand.bottom;
    setOmhoog(onder < LIJSTHOOGTE && rand.top > onder);
  }

  useEffect(() => {
    return () => {
      if (teller.current) clearTimeout(teller.current);
      lopendeVraag.current?.abort();
    };
  }, []);

  function zoek(term: string) {
    if (teller.current) clearTimeout(teller.current);
    lopendeVraag.current?.abort();

    // Onze eigen lijst staat er meteen, het net mag daarna aanvullen.
    const eigen = soort === "plaats" ? eigenSuggesties(term) : [];
    setSuggesties(eigen);
    setActief(-1);
    setOpen(term.trim().length > 0);
    bepaalRichting();

    if (!term.trim()) return;

    teller.current = setTimeout(async () => {
      const vraag = new AbortController();
      lopendeVraag.current = vraag;
      try {
        const gevonden = soort === "plaats" ? await zoekPlaatsen(term, vraag.signal) : await zoekAdressen(term, vraag.signal);
        setSuggesties(voegSamen(eigen, gevonden));
      } catch {
        // Netwerk weg of vraag afgebroken: de eigen lijst blijft gewoon staan.
      }
    }, WACHTTIJD);
  }

  function kies(suggestie: Suggestie) {
    onWaarde(suggestie.naam);
    setOpen(false);
    setSuggesties([]);
    setActief(-1);
  }

  function opToets(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!open || suggesties.length === 0) {
      if (event.key === "ArrowDown" && suggesties.length > 0) setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActief((huidig) => (huidig + 1) % suggesties.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActief((huidig) => (huidig - 1 + suggesties.length) % suggesties.length);
    } else if (event.key === "Enter" && actief >= 0) {
      event.preventDefault();
      kies(suggesties[actief]);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  const toon = open && suggesties.length > 0;

  return (
    <div className="relative">
      {metPin ? (
        <MapPinIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
      ) : null}

      <input
        ref={veld}
        id={id}
        name={naam}
        type="text"
        role="combobox"
        aria-expanded={toon}
        aria-controls={lijstId}
        aria-autocomplete="list"
        aria-activedescendant={actief >= 0 ? `${lijstId}-${actief}` : undefined}
        // Uit, anders legt de suggestielijst van de browser zich over de onze heen.
        autoComplete="off"
        placeholder={placeholder}
        value={waarde}
        onChange={(event) => {
          onWaarde(event.target.value);
          zoek(event.target.value);
        }}
        onFocus={() => {
          if (suggesties.length === 0) return;
          bepaalRichting();
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={opToets}
        className={klassen}
      />

      {toon ? (
        <ul
          id={lijstId}
          role="listbox"
          className={`absolute left-0 right-0 z-30 overflow-hidden rounded-2xl border border-lijn bg-white py-1.5 shadow-paneel ${
            omhoog ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {suggesties.map((suggestie, index) => (
            // De handlers staan op de <li> zelf: een role="option" mag geen
            // knop bevatten, en het toetsenbord loopt toch via aria-activedescendant.
            <li
              key={suggestie.naam}
              id={`${lijstId}-${index}`}
              role="option"
              aria-selected={index === actief}
              // Voorkomt dat het veld de focus verliest voordat de klik aankomt.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => kies(suggestie)}
              onMouseEnter={() => setActief(index)}
              className={`flex cursor-pointer items-baseline gap-3 px-4 py-2.5 transition ${
                index === actief ? "bg-brand-soft" : ""
              }`}
            >
              <span className="truncate text-basis text-ink">{suggestie.naam}</span>
              {suggestie.toelichting ? (
                <span className="ml-auto shrink-0 text-klein text-ink-soft">{suggestie.toelichting}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
