"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { SearchIcon } from "@/components/icons";
import { getCategorie, zoekDiensten, type Dienst } from "@/lib/diensten";

/**
 * Keuzelijst die meetypt over alle diensten. Met 87 diensten is een uitklaplijst
 * niet meer te overzien, dus je typt "dak" en krijgt de drie dakspecialisten.
 * De categorie staat erachter, zodat je Makelaars en Aankoopmakelaars uit elkaar
 * houdt.
 */
export function DienstZoeker({
  id,
  waarde,
  onWaarde,
  onKies,
  placeholder = "Welke vakman zoek je?",
  klassen,
  autoFocus = false,
}: {
  id: string;
  waarde: string;
  onWaarde: (waarde: string) => void;
  onKies: (dienst: Dienst) => void;
  placeholder?: string;
  klassen: string;
  autoFocus?: boolean;
}) {
  const lijstId = `${useId()}-diensten`;
  const [open, setOpen] = useState(false);
  const [actief, setActief] = useState(-1);
  const veld = useRef<HTMLInputElement>(null);

  const treffers = zoekDiensten(waarde, 8);
  const toon = open && treffers.length > 0;

  function kies(dienst: Dienst) {
    onKies(dienst);
    setOpen(false);
    setActief(-1);
    veld.current?.blur();
  }

  function opToets(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!toon) {
      if (event.key === "ArrowDown" && treffers.length > 0) setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActief((huidig) => (huidig + 1) % treffers.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActief((huidig) => (huidig - 1 + treffers.length) % treffers.length);
    } else if (event.key === "Enter" && actief >= 0) {
      event.preventDefault();
      kies(treffers[actief]);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />

      <input
        ref={veld}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={toon}
        aria-controls={lijstId}
        aria-autocomplete="list"
        aria-activedescendant={actief >= 0 ? `${lijstId}-${actief}` : undefined}
        // Uit, anders legt de suggestielijst van de browser zich over de onze heen.
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={waarde}
        onChange={(event) => {
          onWaarde(event.target.value);
          setOpen(event.target.value.trim().length > 0);
          setActief(-1);
        }}
        onFocus={() => setOpen(waarde.trim().length > 0)}
        onBlur={() => setOpen(false)}
        onKeyDown={opToets}
        className={klassen}
      />

      {toon ? (
        <ul
          id={lijstId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-lijn bg-white py-1.5 shadow-paneel"
        >
          {treffers.map((dienst, index) => (
            // De handlers staan op de <li> zelf: een role="option" mag geen
            // knop bevatten, en het toetsenbord loopt toch via aria-activedescendant.
            <li
              key={dienst.slug}
              id={`${lijstId}-${index}`}
              role="option"
              aria-selected={index === actief}
              // Voorkomt dat het veld de focus verliest voordat de klik aankomt.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => kies(dienst)}
              onMouseEnter={() => setActief(index)}
              className={`flex cursor-pointer items-baseline gap-3 px-4 py-2.5 transition ${
                index === actief ? "bg-brand-soft" : ""
              }`}
            >
              <span className="truncate text-basis text-ink">{dienst.menuLabel}</span>
              <span className="ml-auto shrink-0 text-klein text-ink-soft">
                {getCategorie(dienst.categorie).titel}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
