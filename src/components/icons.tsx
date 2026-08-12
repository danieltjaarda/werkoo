type IconProps = {
  className?: string;
};

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="m13.5 13.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M10 18s6-5.2 6-9.4A6 6 0 0 0 4 8.6C4 12.8 10 18 10 18Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.4" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function SlotIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="4" y="8.6" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8.6V6.8a3 3 0 0 1 6 0v1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M4 3.6h3l1.1 3-1.6 1.2a9.4 9.4 0 0 0 4.7 4.7l1.2-1.6 3 1.1v3a1.4 1.4 0 0 1-1.5 1.4C7.9 16 4 12.1 3.4 5.1A1.4 1.4 0 0 1 4 3.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ZegelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="8.2" r="5.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.8 12.4 5.9 17l4.1-1.9 4.1 1.9-.9-4.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FotoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="2.8" y="4.6" width="14.4" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.4 13.4 3.3-3.2 2.6 2.4 2.5-2.9 3.1 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7.2" cy="8.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="m5.5 8 4.5 4.5L14.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v7a1.5 1.5 0 0 1-1.5 1.5H8l-4 3v-3a1 1 0 0 1-1-1v-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M3 3.8h1.6l1.7 8.3h8l1.6-5.9H5.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="15.6" r="1.2" fill="currentColor" />
      <circle cx="14" cy="15.6" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Zelfde vinkje als hierboven, maar het tekent zichzelf zodra het verschijnt. */
export function VinkjeTekentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="m4.5 10.5 3.5 3.5 7.5-8"
        pathLength={1}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="vinkje-pad"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M16 10H5m4.5-4.5L5 10l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Keurmerkvinkje met schulprand. Het pad is gegenereerd met
 * scripts/keurmerk-pad.mjs (11 lobben rond een cirkel van 32 bij 32).
 */
export function KeurmerkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <path
        d="M16 0.6C17.18 0.6 18.16 3.5 19.55 3.91C20.94 4.32 23.33 2.4 24.33 3.04C25.32 3.68 24.58 6.66 25.52 7.75C26.47 8.84 29.52 8.53 30.01 9.6C30.5 10.68 28.27 12.78 28.47 14.21C28.68 15.64 31.41 17.02 31.24 18.19C31.07 19.36 28.06 19.92 27.46 21.23C26.86 22.55 28.41 25.19 27.64 26.08C26.86 26.98 24.03 25.82 22.81 26.6C21.6 27.38 21.47 30.44 20.34 30.78C19.2 31.11 17.45 28.6 16 28.6C14.55 28.6 12.8 31.11 11.66 30.78C10.53 30.44 10.4 27.38 9.19 26.6C7.97 25.82 5.14 26.98 4.36 26.08C3.59 25.19 5.14 22.55 4.54 21.23C3.94 19.92 0.93 19.36 0.76 18.19C0.59 17.02 3.32 15.64 3.53 14.21C3.73 12.78 1.5 10.68 1.99 9.6C2.48 8.53 5.53 8.84 6.48 7.75C7.42 6.66 6.68 3.68 7.67 3.04C8.67 2.4 11.06 4.32 12.45 3.91C13.84 3.5 14.82 0.6 16 0.6Z"
        fill="currentColor"
      />
      <path d="m10.2 16.4 4.2 4.2 8-8.2" stroke="#fff" strokeWidth="3.4" strokeLinecap="square" />
    </svg>
  );
}

export function QuoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M9.4 5C6 6.6 4 9.6 4 13.2 4 16.4 5.8 19 8.6 19c2 0 3.6-1.5 3.6-3.5S10.8 12 9 12c-.4 0-.8 0-1 .2.4-2.2 1.9-4 4-5.1L9.4 5Zm10 0C16 6.6 14 9.6 14 13.2c0 3.2 1.8 5.8 4.6 5.8 2 0 3.6-1.5 3.6-3.5S20.8 12 19 12c-.4 0-.8 0-1 .2.4-2.2 1.9-4 4-5.1L19.4 5Z" />
    </svg>
  );
}

/** Handgetekende onderstreping onder een woord in de titel. */
export function Squiggle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden className={className}>
      <path
        d="M2 8.5c26-4.6 62-6.4 96-5.2 34 1.2 70 4 100 7"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
