export type DienstOptie = {
  id: string;
  label: string;
};

export type Dienst = {
  slug: string;
  /** Enkelvoud, zoals gebruikt in de kop: "De videograaf in Joure die ..." */
  naam: string;
  meervoud: string;
  /** Woord in de zin "Selecteer waar de videograaf voor nodig is" */
  lidwoordNaam: string;
  opties: DienstOptie[];
};

export const videograaf: Dienst = {
  slug: "videograaf",
  naam: "Videograaf",
  meervoud: "videografen",
  lidwoordNaam: "de videograaf",
  opties: [
    { id: "bruiloft", label: "Bruiloft" },
    { id: "promotie", label: "Reclame & social" },
    { id: "evenement", label: "Evenement / feest" },
    { id: "bedrijfsfilm", label: "Bedrijfsfilm" },
    { id: "overig", label: "Iets anders" },
  ],
};

export const diensten: Dienst[] = [videograaf];

export function getDienst(slug: string): Dienst | undefined {
  return diensten.find((dienst) => dienst.slug === slug);
}
