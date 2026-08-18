"use client";

import { PROVINCIES } from "@/lib/provincie-kaart";

/**
 * Kaart van Nederland waarop je provincies aan- en uitzet. De echte invoer
 * zijn gewone checkboxes (toetsenbord, schermlezer, formulier); de kaart is
 * een tweede manier om dezelfde vinkjes te zetten.
 */
export function ProvincieKaart({
  gekozen,
  onWissel,
  naam = "provincie",
  compact = false,
}: {
  gekozen: string[];
  onWissel: (provincie: string) => void;
  /** Naam van de checkbox-velden in het formulier. */
  naam?: string;
  compact?: boolean;
}) {
  const alles = gekozen.length === PROVINCIES.length;

  return (
    <div className={`grid gap-5 ${compact ? "" : "sm:grid-cols-[minmax(0,1fr)_14rem]"}`}>
      <svg
        viewBox="0 0 404 484"
        role="group"
        aria-label="Kaart van Nederland, klik een provincie om hem aan of uit te zetten"
        className="mx-auto w-full max-w-[22rem] select-none"
      >
        {PROVINCIES.map((p) => {
          const aan = gekozen.includes(p.naam);
          return (
            <g key={p.slug} onClick={() => onWissel(p.naam)} className="cursor-pointer">
              <path
                d={p.d}
                className={`transition-colors ${
                  aan ? "fill-brand stroke-brand-deep" : "fill-brand-soft stroke-brand-deep/60 hover:fill-brand/40"
                }`}
                strokeWidth={1.2}
                strokeLinejoin="round"
              />
              <title>{p.naam}</title>
            </g>
          );
        })}
        {PROVINCIES.map((p) => (
          <text
            key={`${p.slug}-label`}
            x={p.cx}
            y={p.cy}
            textAnchor="middle"
            className={`pointer-events-none font-display text-[11px] font-semibold ${
              gekozen.includes(p.naam) ? "fill-white" : "fill-ink"
            }`}
          >
            {p.naam}
          </text>
        ))}
      </svg>

      <div>
        <ul className={`grid gap-1.5 ${compact ? "grid-cols-2 sm:grid-cols-3" : ""}`}>
          {PROVINCIES.map((p) => {
            const aan = gekozen.includes(p.naam);
            return (
              <li key={p.slug}>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-basis text-ink hover:bg-brand-soft">
                  <input type="checkbox" name={naam} value={p.naam} checked={aan} onChange={() => onWissel(p.naam)} />
                  {p.naam}
                </label>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            if (alles) PROVINCIES.forEach((p) => gekozen.includes(p.naam) && onWissel(p.naam));
            else PROVINCIES.forEach((p) => !gekozen.includes(p.naam) && onWissel(p.naam));
          }}
          className="mt-2 px-2 text-klein font-semibold text-brand-deep underline-offset-4 hover:underline"
        >
          {alles ? "Alles uitzetten" : "Heel Nederland"}
        </button>
      </div>
    </div>
  );
}
