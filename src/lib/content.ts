import { deelLidwoord, type Dienst, type Vraag } from "@/lib/diensten";

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

export type Review = {
  naam: string;
  plaats: string;
  score: number;
  tekst: string;
};

/** Ervaringen die over Werkoo zelf gaan en dus bij elke dienst kloppen. */
const algemeneReviews: Review[] = [
  {
    naam: "Bas Terpstra",
    plaats: "Leeuwarden",
    score: 10,
    tekst:
      "De volgende ochtend had ik al drie reacties. De verschillen in prijs waren fors, dus fijn om te kunnen kiezen.",
  },
  {
    naam: "Sanne Bouma",
    plaats: "Heerenveen",
    score: 8,
    tekst:
      "Prettig dat niemand aan je begint te trekken als je nog twijfelt. Degene die we kozen dacht goed mee over de aanpak.",
  },
  {
    naam: "Youssef el Amrani",
    plaats: "Utrecht",
    score: 10,
    tekst:
      "In één keer twee offertes naast elkaar in plaats van vijf keer hetzelfde verhaal aan de telefoon doen. Dat scheelde me een avond.",
  },
];

/** Ervaringen die een specifieke dienst noemen; die wegen zwaarder op die pagina. */
const reviewsPerDienst: Record<string, Review[]> = {
  videograaf: [
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
  ],
};

export function reviewsVoorDienst(slug?: string): Review[] {
  return (slug ? reviewsPerDienst[slug] : undefined) ?? algemeneReviews;
}

/** Vragen over Werkoo zelf. Ze staan bij elke dienst onder de dienstvragen. */
export const algemeneVragen: Vraag[] = [
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
      "Staan er profielen bij de dienst die je zoekt, dan kun je die bekijken en rechtstreeks een bericht sturen. Is die lijst er nog niet, dan doe je een gewone aanvraag en leggen wij hem voor aan de vakmensen die in jouw regio werken.",
  },
];

/**
 * De vragenlijst op een dienstpagina: eerst de prijsvraag, dan de twee vragen
 * die over het vak gaan, dan de vragen over Werkoo zelf.
 */
export function vragenVoorDienst(dienst: Dienst): Vraag[] {
  return [
    // Via lidwoordNaam en niet via naam.toLowerCase(): anders wordt
    // "SEO-specialist" in de vraag "seo-specialist".
    { vraag: `Wat kost een ${deelLidwoord(dienst).naam}?`, antwoord: dienst.prijs },
    ...dienst.vragen,
    ...algemeneVragen,
  ];
}
