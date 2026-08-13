export type Troef = {
  label: string;
  soort: "aanbod" | "snelheid" | "keurmerk";
};

export type Vakman = {
  slug: string;
  /** Slug van de dienst waar dit profiel onder valt. */
  dienst: string;
  naam: string;
  foto: string;
  belofte: string;
  plaats: string;
  adres: string;
  jaren: number;
  telefoon: string;
  score: number;
  reviews: number;
  fotos: number;
  topPro: boolean;
  /**
   * Betaalde uitgelichte plek: staat altijd bovenaan, ongeacht plaats of cijfer.
   * De kaart draagt daarom zichtbaar het label "Uitgelicht", zodat een bezoeker
   * ziet dat dit geen organische nummer één is.
   */
  uitgelicht?: boolean;
  troeven: Troef[];
  tekst: string;
};

/**
 * De profielen die we met de hand hebben nagekeken. Er staan er nu alleen bij
 * videograaf; voor de andere diensten tonen we bewust geen lijst in plaats van
 * verzonnen bedrijven. Zodra er echte aanmeldingen zijn horen die hier te komen,
 * met `dienst` als sleutel naar `src/lib/dienst-data.ts`.
 */
export const vakmensen: Vakman[] = [
  {
    // Gegevens overgenomen uit de schema.org-data op mediaspot.nl.
    slug: "mediaspot",
    dienst: "videograaf",
    naam: "Mediaspot",
    foto: "/images/profielen/mediaspot.webp",
    belofte: "van concept tot montage",
    plaats: "Joure",
    adres: "Brandemeer 6, Joure",
    jaren: 2,
    telefoon: "06 20176727",
    score: 10,
    reviews: 234,
    fotos: 42,
    topPro: true,
    uitgelicht: true,
    troeven: [
      { label: "Gratis kennismaking", soort: "aanbod" },
      { label: "Reageert binnen 1 uur", soort: "snelheid" },
      { label: "Werkoo-keurmerk", soort: "keurmerk" },
    ],
    tekst:
      "Videograaf uit Joure voor bruiloften, evenementen, bedrijfsfilms en social content. Van concept tot montage, actief in Friesland, Groningen, Drenthe, Overijssel, Flevoland en Gelderland.",
  },
  {
    slug: "studio-noordlicht",
    dienst: "videograaf",
    naam: "Studio Noordlicht",
    foto: "/images/profielen/profiel-noordlicht.webp",
    belofte: "elk merk heeft een verhaal",
    plaats: "Heerenveen",
    adres: "Fok 32, Heerenveen",
    jaren: 11,
    telefoon: "0513 820 145",
    score: 9.8,
    reviews: 121,
    fotos: 38,
    topPro: true,
    troeven: [
      { label: "Gratis kennismaking", soort: "aanbod" },
      { label: "Reageert binnen 1 uur", soort: "snelheid" },
      { label: "Werkoo-keurmerk", soort: "keurmerk" },
    ],
    tekst:
      "Team van drie dat korte commercials en socialmediacontent maakt voor het mkb. We schrijven het script mee, filmen met twee camera's en leveren binnen tien werkdagen een versie voor elk kanaal.",
  },
  {
    slug: "djarno-van-elst",
    dienst: "videograaf",
    naam: "Djarno van Elst",
    foto: "/images/profielen/profiel-djarno.webp",
    belofte: "cinematisch, zonder poespas",
    plaats: "Joure",
    adres: "Midstraat 104, Joure",
    jaren: 7,
    telefoon: "0513 745 210",
    score: 9.6,
    reviews: 63,
    fotos: 24,
    topPro: true,
    troeven: [
      { label: "10% korting bij twee dagdelen", soort: "aanbod" },
      { label: "Reageert snel", soort: "snelheid" },
      { label: "Werkoo-keurmerk", soort: "keurmerk" },
    ],
    tekst:
      "Filmt met Sony FX-camera's en doet de kleurcorrectie zelf, zodat het beeld precies wordt wat je voor ogen had. Trouwfilms en bedrijfsvideo's, altijd binnen twee weken geleverd.",
  },
  {
    slug: "marit-de-vries",
    dienst: "videograaf",
    naam: "Marit de Vries",
    foto: "/images/profielen/profiel-marit.webp",
    belofte: "documentair en dichtbij",
    plaats: "Sneek",
    adres: "Oosterdijk 19, Sneek",
    jaren: 5,
    telefoon: "0515 336 802",
    score: 9.4,
    reviews: 48,
    fotos: 16,
    topPro: false,
    troeven: [
      { label: "Gratis draaiboekgesprek", soort: "aanbod" },
      { label: "Reageert binnen een dag", soort: "snelheid" },
    ],
    tekst:
      "Blijft het liefst op de achtergrond en filmt wat er echt gebeurt. Werkt bij drukke dagen samen met een tweede camera, zodat er niets tussen wal en schip valt.",
  },
];

/**
 * Zoekt een profiel op. De dienst hoort erbij: anders kan iemand via
 * `?dienst=dakdekker&vakman=mediaspot` een videograaf naast een dakdekkervraag
 * krijgen. Via de site zelf kan dat niet, via de adresbalk wel.
 */
export function vakmanVanSlug(slug: string | undefined, dienstSlug?: string): Vakman | undefined {
  if (!slug) return undefined;
  const gevonden = vakmensen.find((vakman) => vakman.slug === slug);
  if (!gevonden) return undefined;
  return !dienstSlug || gevonden.dienst === dienstSlug ? gevonden : undefined;
}

export function heeftProfielen(dienstSlug: string): boolean {
  return vakmensen.some((vakman) => vakman.dienst === dienstSlug);
}

/**
 * De volgorde waarin we vakmensen voorleggen: uitgelichte partners eerst, dan
 * wie in de gevraagde plaats zit, dan de hoogste beoordeling. We filteren bewust
 * niet op plaats, want dan houdt iemand buiten de regio een lege lijst over.
 * Zodra er echte dekking per regio is, hoort dat hier te gebeuren.
 */
export function vakmensenVoorPlaats(dienstSlug: string, plaats: string): Vakman[] {
  const gezocht = plaats.trim().toLowerCase();
  const rang = (vakman: Vakman) => [
    vakman.uitgelicht ? 0 : 1,
    vakman.plaats.toLowerCase() === gezocht ? 0 : 1,
  ];

  return vakmensen
    .filter((vakman) => vakman.dienst === dienstSlug)
    .sort((a, b) => {
      const [aUit, aRaak] = rang(a);
      const [bUit, bRaak] = rang(b);
      return aUit - bUit || aRaak - bRaak || b.score - a.score;
    });
}
