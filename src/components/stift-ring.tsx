/**
 * Een met de hand getrokken ovaal om een knop of woord, in dezelfde stijl als
 * de lijn om de foto's en de ring om de iconen. Hij rekt mee met wat eromheen
 * staat: `preserveAspectRatio="none"` laat de vorm meeschalen en
 * `vectorEffect="non-scaling-stroke"` houdt de lijn overal even dik, ook als
 * de knop breed en laag is.
 */
const OVAAL =
  "M143.0 6.6Q151.8 7.6 160.3 9.1Q168.2 11.0 175.2 13.3Q181.2 15.9 186.1 18.6Q190.0 21.4 193.2 24.3Q195.6 27.2 197.1 30.1Q197.2 33.0 195.7 35.8Q192.5 38.5 187.8 41.0Q181.9 43.2 175.4 45.2Q168.2 47.1 160.3 48.9Q151.7 50.7 142.4 52.5Q132.6 54.1 122.4 55.5Q112.2 56.6 101.9 57.2Q91.4 57.3 80.8 56.8Q70.3 55.9 60.1 54.6Q50.5 53.0 41.7 51.2Q33.6 49.2 26.3 47.0Q19.7 44.7 14.2 42.1Q9.9 39.4 7.1 36.7Q5.8 33.9 5.7 31.1Q6.3 28.4 7.6 25.7Q9.4 23.0 12.3 20.3Q16.3 17.5 21.7 14.8Q28.2 12.1 35.7 9.7Q43.8 7.7 52.6 6.0Q62.0 4.9 72.0 4.1Q82.5 3.7 93.3 3.7Q104.0 3.8 114.5 4.2Q124.6 4.9 134.5 5.9Q144.0 7.3 153.1 8.9Q161.6 10.9 169.1 13.0Q175.7 15.2 181.6 17.5Q186.9 19.8 191.6 22.3";

export function StiftRing({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <path
        d={OVAAL}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
