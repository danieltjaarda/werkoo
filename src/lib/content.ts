export const stappen = [
  {
    titel: "Beschrijf je klus",
    tekst:
      "Een paar vragen over wat je zoekt, waar en wanneer. Je bent in een minuut klaar en het kost je niets.",
  },
  {
    titel: "Wij zoeken de match",
    tekst:
      "We leggen je vraag voor aan vakmensen die op dat moment vrij zijn en het soort werk doen dat jij zoekt.",
  },
  {
    titel: "Jij kiest wie mag komen",
    tekst:
      "Bekijk hun werk, prijzen en ervaringen van eerdere klanten. Niets erbij? Dan houdt het gewoon op.",
  },
];

export const voordelen = [
  {
    titel: "Iedereen is nagekeken",
    tekst: "We controleren de KvK-inschrijving en eerder werk voordat iemand op het platform komt.",
  },
  {
    titel: "Prijzen naast elkaar",
    tekst: "Meerdere reacties op één aanvraag laten meteen zien wat een eerlijke prijs is voor jouw klus.",
  },
  {
    titel: "Nergens aan vast",
    tekst: "Geen abonnement, geen bemiddelingskosten en geen verplichting om iemand te boeken.",
  },
  {
    titel: "Mensen aan de telefoon",
    tekst: "Ons team zit in Nederland en denkt mee als je twijfelt over je keuze of je budget.",
  },
];

export type Troef = {
  label: string;
  soort: "aanbod" | "snelheid" | "keurmerk";
};

export type Vakman = {
  slug: string;
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

export const videografen: Vakman[] = [
  {
    // Gegevens overgenomen uit de schema.org-data op mediaspot.nl.
    slug: "mediaspot",
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

export const reviews = [
  {
    naam: "Lianne Hoekstra",
    plaats: "Joure",
    score: 10,
    tekst:
      "Ik had de volgende ochtend al drie reacties voor onze trouwfilm. De verschillen in prijs waren fors, dus fijn om te kunnen kiezen.",
  },
  {
    naam: "Bas Terpstra",
    plaats: "Leeuwarden",
    score: 10,
    tekst:
      "We zochten iemand voor een bedrijfsfilm en kwamen uit bij een studio die onze branche kende. Dat scheelde enorm veel uitleg.",
  },
  {
    naam: "Sanne Bouma",
    plaats: "Heerenveen",
    score: 8,
    tekst:
      "Prettig dat niemand aan je begint te trekken als je nog twijfelt. De videograaf die we kozen dacht goed mee over het draaiboek.",
  },
];

export const veelgesteldeVragen = [
  {
    vraag: "Wat kost een videograaf?",
    antwoord:
      "Een dagdeel filmen ligt meestal tussen de € 450 en € 900. Voor een complete trouwfilm reken je op € 1.200 tot € 2.500, afhankelijk van het aantal uren, de montage en of er met twee camera's wordt gewerkt.",
  },
  {
    vraag: "Wat kost het mij om een aanvraag te doen?",
    antwoord:
      "Niets. Wij krijgen een vergoeding van de vakman op het moment dat hij via ons een opdracht binnenhaalt. Jij betaalt ons nooit iets.",
  },
  {
    vraag: "Hoe snel hoor ik iets?",
    antwoord:
      "Gemiddeld staat de eerste reactie er binnen achttien uur. Heb je haast, geef dat dan aan in het formulier: die aanvragen zetten we vooraan.",
  },
  {
    vraag: "Wie laten jullie toe?",
    antwoord:
      "We kijken naar de KvK-inschrijving, eerder werk en de beoordelingen die binnenkomen. Zakt iemand onder een 8,0 gemiddeld, dan gaat het profiel eraf.",
  },
  {
    vraag: "Kan ik zelf iemand benaderen?",
    antwoord:
      "Ja. Bekijk de profielen in jouw regio en stuur rechtstreeks een bericht. Je kunt dat prima combineren met een gewone aanvraag.",
  },
];

export function vakmanVanSlug(slug: string | undefined): Vakman | undefined {
  if (!slug) return undefined;
  return videografen.find((vakman) => vakman.slug === slug);
}

/**
 * De volgorde waarin we vakmensen voorleggen in de aanvraagflow: uitgelichte
 * partners eerst, dan wie in de gevraagde plaats zit, dan de hoogste beoordeling.
 * We filteren bewust niet op plaats, want dan houdt iemand buiten Friesland een
 * lege lijst over. Zodra er echte dekking per regio is, hoort dat hier te gebeuren.
 */
export function vakmensenVoorPlaats(plaats: string): Vakman[] {
  const gezocht = plaats.trim().toLowerCase();
  const rang = (vakman: Vakman) => [
    vakman.uitgelicht ? 0 : 1,
    vakman.plaats.toLowerCase() === gezocht ? 0 : 1,
  ];

  return [...videografen].sort((a, b) => {
    const [aUit, aRaak] = rang(a);
    const [bUit, bRaak] = rang(b);
    return aUit - bUit || aRaak - bRaak || b.score - a.score;
  });
}
