/**
 * Aanvullende iconen, in dezelfde lijnstijl als icons.tsx: een vierkant van
 * 20 bij 20, lijnen in currentColor met een dikte van 1,5 tot 1,6, en verder
 * niets ingevuld. Ze staan apart zodat icons.tsx overzichtelijk blijft.
 */
type IconProps = {
  className?: string;
};

/* Voordelen op de homepage */

/** Iedereen is nagekeken. */
export function SchildVinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M10 2.6 4.6 4.8v4.6c0 3.3 2.2 6.3 5.4 7.4 3.2-1.1 5.4-4.1 5.4-7.4V4.8L10 2.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m7.6 9.9 1.8 1.8 3.3-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Prijzen naast elkaar. */
export function WeegschaalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M10 3.4v13M6 16.6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 6.2h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 6.2 2.2 10.4a2.4 2.4 0 0 0 3.6 0L4 6.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M16 6.2l-1.8 4.2a2.4 2.4 0 0 0 3.6 0L16 6.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="3.4" r="1.1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Nergens aan vast: een hangslot dat openstaat. */
export function SlotOpenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="4" y="8.6" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8.6V6.8a3 3 0 0 1 5.8-1.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Mensen aan de telefoon. */
export function HeadsetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4.2 12.4V10a5.8 5.8 0 0 1 11.6 0v2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="2.6" y="11.4" width="3.2" height="4.4" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.2" y="11.4" width="3.2" height="4.4" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.8 15.8v.4a1.8 1.8 0 0 1-1.8 1.8h-2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* Tegels op het dashboard */

/** Open aanvragen: een postvak. */
export function PostvakIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M3 11.4 5.2 4.6a1.4 1.4 0 0 1 1.3-1h7a1.4 1.4 0 0 1 1.3 1L17 11.4v3.2a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 14.6v-3.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3 11.4h3.6l1 2h4.8l1-2H17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Binnengekomen: een stijgende lijn. */
export function GrafiekIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M3 16.4h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.8 13.2 8 8.8l3 2.6 4.6-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.6 5.6h3.4v3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Gereageerd: een tekstballon met een antwoordpijl. */
export function AntwoordIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M16.6 11.2a1.6 1.6 0 0 1-1.6 1.6H8l-3.4 2.8v-2.8h-.6a1.6 1.6 0 0 1-1.6-1.6V5.8a1.6 1.6 0 0 1 1.6-1.6H15a1.6 1.6 0 0 1 1.6 1.6v5.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11 8.4H7m0 0 1.8-1.8M7 8.4l1.8 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Gewonnen: een beker. */
export function BekerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M6.2 3.4h7.6v4.2a3.8 3.8 0 0 1-7.6 0V3.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.2 4.8H4.2a2 2 0 0 0 2 2.6M13.8 4.8h2a2 2 0 0 1-2 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 11.4v2.8M7.2 16.6h5.6M8.4 14.2h3.2l.6 2.4H7.8l.6-2.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Statuslabels en losse gaten */

/** Nieuw. */
export function SterretjeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M10 2.8c0 3 2.2 5.2 5.2 5.2-3 0-5.2 2.2-5.2 5.2 0-3-2.2-5.2-5.2-5.2 3 0 5.2-2.2 5.2-5.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14.8 12.6c0 1.4 1 2.4 2.4 2.4-1.4 0-2.4 1-2.4 2.4 0-1.4-1-2.4-2.4-2.4 1.4 0 2.4-1 2.4-2.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/** In behandeling, en reactietijd. */
export function KlokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v4.2l2.8 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Niet doorgegaan. */
export function KruisCirkelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m7.6 7.6 4.8 4.8m0-4.8-4.8 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** E-mail. */
export function EnvelopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="2.6" y="4.6" width="14.8" height="10.8" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="m3.4 6 6.6 4.6L16.6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Datum en beschikbaarheid. */
export function KalenderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="3" y="4.4" width="14" height="12.2" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14M6.8 2.8v3M13.2 2.8v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6.2" y="10.4" width="3" height="2.6" rx="0.7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/** Verwijderen. */
export function PrullenbakIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M3.6 5.6h12.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.6 5.6V4.4a1.2 1.2 0 0 1 1.2-1.2h2.4a1.2 1.2 0 0 1 1.2 1.2v1.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M5.4 5.6h9.2l-.7 9.6a1.6 1.6 0 0 1-1.6 1.5H7.7a1.6 1.6 0 0 1-1.6-1.5L5.4 5.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8.6 8.6v5M11.4 8.6v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Waarschuwing en foutmeldingen. */
export function WaarschuwingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M8.6 3.5a1.6 1.6 0 0 1 2.8 0l6 10.4a1.6 1.6 0 0 1-1.4 2.4H4a1.6 1.6 0 0 1-1.4-2.4l6-10.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 7.8v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="13.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

/** Bewerken. */
export function PotloodIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="m12.6 3.6 3.8 3.8-8 8-4.4.6.6-4.4 8-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m11 5.2 3.8 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Foto uploaden. */
export function CameraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M2.8 7.4a1.6 1.6 0 0 1 1.6-1.6h1.7l1-1.8h5.8l1 1.8h1.7a1.6 1.6 0 0 1 1.6 1.6v7a1.6 1.6 0 0 1-1.6 1.6H4.4a1.6 1.6 0 0 1-1.6-1.6v-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10.8" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* Merken: deze staan bewust ingevuld in plaats van in lijn, omdat ze anders niet
 * herkenbaar zijn. Ze pakken net als de rest de kleur van de tekst. */

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="2.6" y="2.6" width="14.8" height="14.8" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6.6" cy="6.8" r="1.1" fill="currentColor" />
      <path d="M6.6 9.4v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M10 14.6V9.4m0 1.6a2 2 0 0 1 3.9.7v2.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="2.6" y="2.6" width="14.8" height="14.8" rx="4.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.2" cy="5.8" r="1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="2.6" y="2.6" width="14.8" height="14.8" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12.6 6.6h-1.2a1.6 1.6 0 0 0-1.6 1.6v1.4m0 0H8.2m1.6 0h2m-2 0v5.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M3.2 16.8 4.4 13a7 7 0 1 1 2.7 2.6l-3.9 1.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.7 7.4h1l.7 1.8-.8.6a4.6 4.6 0 0 0 2.1 2.1l.6-.8 1.8.7v1a1 1 0 0 1-1.1.9 6 6 0 0 1-5.2-5.2 1 1 0 0 1 .9-1.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
