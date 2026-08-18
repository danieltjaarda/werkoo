/**
 * Aanvullende iconen, in dezelfde lijnstijl als icons.tsx: lijnen in currentColor
 * met een dikte van 1,5 tot 1,6 en verder niets ingevuld. Nieuw is de losse
 * turquoise ring eromheen, met de hand getekend net als de lijn om de foto's:
 * hij zit in het icoon zelf, zodat hij nooit vergeten wordt.
 */
type IconProps = {
  className?: string;
};

/**
 * Drie ringen die net niet rond zijn. Ze wisselen per icoon, zodat een rij
 * iconen naast elkaar niet als gestempeld oogt.
 */
const KRINGEN = [
  "M14.0 1.6C14.9 1.9 18.1 2.5 19.5 3.6C20.9 4.7 21.4 6.8 22.5 8.3C23.5 9.8 25.3 10.9 26.0 12.7C26.7 14.5 27.3 17.3 26.5 19.0C25.8 20.8 23.4 22.1 21.7 23.1C20.0 24.1 18.2 24.9 16.4 25.2C14.6 25.4 12.8 25.0 11.0 24.6C9.2 24.3 6.9 24.1 5.4 23.0C3.9 21.8 2.3 19.8 1.9 18.0C1.6 16.2 2.9 14.1 3.4 12.2C3.8 10.3 3.7 8.4 4.6 6.7C5.5 5.1 7.0 3.3 8.7 2.4C10.4 1.6 12.9 1.4 14.8 1.6C16.6 1.9 19.2 3.7 20.0 4.1",
  "M14.0 2.4C14.8 2.9 17.0 4.3 18.6 5.0C20.3 5.7 22.6 5.6 24.0 6.8C25.5 7.9 27.0 10.2 27.2 12.0C27.4 13.8 26.1 16.0 25.2 17.8C24.4 19.5 23.5 21.3 22.2 22.4C20.8 23.5 19.0 23.9 17.2 24.5C15.5 25.1 13.7 26.0 11.9 25.9C10.1 25.8 7.6 25.3 6.3 24.1C5.0 22.9 4.9 20.4 4.2 18.7C3.5 17.0 2.3 15.5 2.1 13.7C1.9 11.9 1.9 9.5 2.8 7.9C3.6 6.2 5.5 4.9 7.1 3.9C8.7 2.9 10.8 2.0 12.5 2.1C14.3 2.2 16.7 4.0 17.5 4.4",
  "M14.0 3.6C15.1 3.4 18.6 1.8 20.4 2.4C22.2 2.9 24.1 5.2 25.0 7.0C25.8 8.9 25.8 11.3 25.6 13.3C25.4 15.2 24.8 17.0 24.0 18.7C23.2 20.4 22.3 22.1 20.9 23.5C19.5 24.8 17.5 26.7 15.6 26.8C13.8 27.0 11.6 25.3 9.9 24.4C8.2 23.4 6.8 22.5 5.3 21.2C3.9 19.9 2.0 18.3 1.4 16.4C0.8 14.6 1.1 11.9 1.8 10.1C2.6 8.3 4.3 6.4 5.9 5.5C7.6 4.5 9.7 4.9 11.5 4.4C13.3 3.9 14.9 2.5 16.9 2.5C18.9 2.4 22.2 3.8 23.3 4.0",
];

/**
 * Het omhulsel van elk icoon: eerst de ring, daarna de tekening zelf, die vier
 * eenheden naar binnen staat zodat er ruimte overblijft voor de ring.
 */
function Icoon({ className, kring, children }: IconProps & { kring: number; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <path
        d={KRINGEN[kring % KRINGEN.length]}
        stroke="var(--color-turquoise, #2ed4d4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform="translate(4 4)">{children}</g>
    </svg>
  );
}

/** Iedereen is nagekeken. */
export function SchildVinkIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={0}>
      <path
        d="M10 2.6 4.6 4.8v4.6c0 3.3 2.2 6.3 5.4 7.4 3.2-1.1 5.4-4.1 5.4-7.4V4.8L10 2.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m7.6 9.9 1.8 1.8 3.3-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Icoon>
  );
}

/** Prijzen naast elkaar. */
export function WeegschaalIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={1}>
      <path d="M10 3.4v13M6 16.6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 6.2h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 6.2 2.2 10.4a2.4 2.4 0 0 0 3.6 0L4 6.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M16 6.2l-1.8 4.2a2.4 2.4 0 0 0 3.6 0L16 6.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="3.4" r="1.1" stroke="currentColor" strokeWidth="1.4" />
    </Icoon>
  );
}

/** Nergens aan vast: een hangslot dat openstaat. */
export function SlotOpenIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={2}>
      <rect x="4" y="8.6" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8.6V6.8a3 3 0 0 1 5.8-1.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Icoon>
  );
}

/** Mensen aan de telefoon. */
export function HeadsetIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={0}>
      <path d="M4.2 12.4V10a5.8 5.8 0 0 1 11.6 0v2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="2.6" y="11.4" width="3.2" height="4.4" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.2" y="11.4" width="3.2" height="4.4" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.8 15.8v.4a1.8 1.8 0 0 1-1.8 1.8h-2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icoon>
  );
}

/** Open aanvragen: een postvak. */
export function PostvakIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={1}>
      <path
        d="M3 11.4 5.2 4.6a1.4 1.4 0 0 1 1.3-1h7a1.4 1.4 0 0 1 1.3 1L17 11.4v3.2a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 14.6v-3.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3 11.4h3.6l1 2h4.8l1-2H17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </Icoon>
  );
}

/** Binnengekomen: een stijgende lijn. */
export function GrafiekIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={2}>
      <path d="M3 16.4h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.8 13.2 8 8.8l3 2.6 4.6-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.6 5.6h3.4v3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Icoon>
  );
}

/** Gereageerd: een tekstballon met een antwoordpijl. */
export function AntwoordIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={0}>
      <path
        d="M16.6 11.2a1.6 1.6 0 0 1-1.6 1.6H8l-3.4 2.8v-2.8h-.6a1.6 1.6 0 0 1-1.6-1.6V5.8a1.6 1.6 0 0 1 1.6-1.6H15a1.6 1.6 0 0 1 1.6 1.6v5.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11 8.4H7m0 0 1.8-1.8M7 8.4l1.8 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icoon>
  );
}

/** Gewonnen: een beker. */
export function BekerIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={1}>
      <path d="M6.2 3.4h7.6v4.2a3.8 3.8 0 0 1-7.6 0V3.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.2 4.8H4.2a2 2 0 0 0 2 2.6M13.8 4.8h2a2 2 0 0 1-2 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 11.4v2.8M7.2 16.6h5.6M8.4 14.2h3.2l.6 2.4H7.8l.6-2.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icoon>
  );
}

/** Nieuw. */
export function SterretjeIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={2}>
      <path
        d="M10 2.8c0 3 2.2 5.2 5.2 5.2-3 0-5.2 2.2-5.2 5.2 0-3-2.2-5.2-5.2-5.2 3 0 5.2-2.2 5.2-5.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14.8 12.6c0 1.4 1 2.4 2.4 2.4-1.4 0-2.4 1-2.4 2.4 0-1.4-1-2.4-2.4-2.4 1.4 0 2.4-1 2.4-2.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </Icoon>
  );
}

/** In behandeling, en reactietijd. */
export function KlokIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={0}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v4.2l2.8 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Icoon>
  );
}

/** Niet doorgegaan. */
export function KruisCirkelIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={1}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m7.6 7.6 4.8 4.8m0-4.8-4.8 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Icoon>
  );
}

/** E-mail. */
export function EnvelopIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={2}>
      <rect x="2.6" y="4.6" width="14.8" height="10.8" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="m3.4 6 6.6 4.6L16.6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icoon>
  );
}

/** Datum en beschikbaarheid. */
export function KalenderIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={0}>
      <rect x="3" y="4.4" width="14" height="12.2" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14M6.8 2.8v3M13.2 2.8v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6.2" y="10.4" width="3" height="2.6" rx="0.7" stroke="currentColor" strokeWidth="1.3" />
    </Icoon>
  );
}

/** Verwijderen. */
export function PrullenbakIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={1}>
      <path d="M3.6 5.6h12.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.6 5.6V4.4a1.2 1.2 0 0 1 1.2-1.2h2.4a1.2 1.2 0 0 1 1.2 1.2v1.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M5.4 5.6h9.2l-.7 9.6a1.6 1.6 0 0 1-1.6 1.5H7.7a1.6 1.6 0 0 1-1.6-1.5L5.4 5.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8.6 8.6v5M11.4 8.6v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Icoon>
  );
}

/** Waarschuwing en foutmeldingen. */
export function WaarschuwingIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={2}>
      <path
        d="M8.6 3.5a1.6 1.6 0 0 1 2.8 0l6 10.4a1.6 1.6 0 0 1-1.4 2.4H4a1.6 1.6 0 0 1-1.4-2.4l6-10.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 7.8v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="13.6" r="0.9" fill="currentColor" />
    </Icoon>
  );
}

/** Bewerken. */
export function PotloodIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={0}>
      <path
        d="m12.6 3.6 3.8 3.8-8 8-4.4.6.6-4.4 8-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m11 5.2 3.8 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Icoon>
  );
}

/** Foto uploaden. */
export function CameraIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={1}>
      <path
        d="M2.8 7.4a1.6 1.6 0 0 1 1.6-1.6h1.7l1-1.8h5.8l1 1.8h1.7a1.6 1.6 0 0 1 1.6 1.6v7a1.6 1.6 0 0 1-1.6 1.6H4.4a1.6 1.6 0 0 1-1.6-1.6v-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10.8" r="3" stroke="currentColor" strokeWidth="1.5" />
    </Icoon>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={2}>
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
    </Icoon>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={0}>
      <rect x="2.6" y="2.6" width="14.8" height="14.8" rx="4.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.2" cy="5.8" r="1" fill="currentColor" />
    </Icoon>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={1}>
      <rect x="2.6" y="2.6" width="14.8" height="14.8" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12.6 6.6h-1.2a1.6 1.6 0 0 0-1.6 1.6v1.4m0 0H8.2m1.6 0h2m-2 0v5.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icoon>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <Icoon className={className} kring={2}>
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
    </Icoon>
  );
}
