import { dienstData } from "@/lib/dienst-data";

export type CategorieId =
  | "verbouwen"
  | "huis-tuin"
  | "duurzaam"
  | "persoonlijk"
  | "zakelijk"
  | "evenementen";

export type Categorie = {
  id: CategorieId;
  /** Zoals in het menu: "Verbouwen & verhuizen" */
  titel: string;
  /** Url-segment onder /diensten */
  slug: string;
  omschrijving: string;
};

export type DienstOptie = {
  id: string;
  label: string;
};

export type Vraag = {
  vraag: string;
  antwoord: string;
};

export type Dienst = {
  /** Url-segment, enkelvoud: /dakdekker */
  slug: string;
  /** Enkelvoud met hoofdletter, zoals in de kop: "De dakdekker in Joure ..." */
  naam: string;
  /** Kleine letters, meervoud: "Dakdekkers die werken in Joure" */
  meervoud: string;
  /** Label in het menu en op de categoriekaart, meervoud met hoofdletter. */
  menuLabel: string;
  /** "de dakdekker" of "het verhuisbedrijf", voor zinnen midden in een tekst. */
  lidwoordNaam: string;
  /** Staart van de kop: "die bij jouw klus past" */
  kopStaart: string;
  /** Korte regel achter de naam in een lijst, kleine letter zonder punt. */
  belofte: string;
  /** Twee zinnen over wat deze vakman doet. */
  intro: string;
  /** Antwoord op "Wat kost een ...?" */
  prijs: string;
  categorie: CategorieId;
  /** Keuzes bij "Waarvoor zoek je ...?" — de laatste is altijd "Iets anders". */
  opties: DienstOptie[];
  /** Drie controlepunten bij het kiezen van deze vakman. */
  letOp: string[];
  /** Twee vragen die specifiek over deze dienst gaan. */
  vragen: Vraag[];
  /**
   * Uitgesneden hero-foto. Alleen gevuld voor de diensten waarvoor we er een
   * hebben; de rest krijgt het paneel met sociaal bewijs in de hero.
   */
  foto?: string;
};

export const categorieen: Categorie[] = dienstData.categorieen;

export const diensten: Dienst[] = dienstData.diensten;

const opSlug = new Map(diensten.map((dienst) => [dienst.slug, dienst]));
const categorieOpId = new Map(categorieen.map((categorie) => [categorie.id, categorie]));
const categorieOpSlug = new Map(categorieen.map((categorie) => [categorie.slug, categorie]));

export function getDienst(slug: string | undefined): Dienst | undefined {
  if (!slug) return undefined;
  return opSlug.get(slug.toLowerCase());
}

export function getCategorie(id: CategorieId): Categorie {
  const categorie = categorieOpId.get(id);
  if (!categorie) throw new Error(`Onbekende categorie: ${id}`);
  return categorie;
}

export function getCategorieVanSlug(slug: string | undefined): Categorie | undefined {
  if (!slug) return undefined;
  return categorieOpSlug.get(slug.toLowerCase());
}

export function dienstenVanCategorie(id: CategorieId): Dienst[] {
  return diensten.filter((dienst) => dienst.categorie === id);
}

/** De diensten waar we bezoekers vanaf de homepage naartoe sturen. */
export const populaireSlugs = [
  "videograaf",
  "fotograaf",
  "loodgieter",
  "elektricien",
  "hovenier",
  "schilder",
  "dakdekker",
  "klusjesman",
] as const;

export function populaireDiensten(): Dienst[] {
  return populaireSlugs.map((slug) => opSlug.get(slug)).filter((dienst): dienst is Dienst => Boolean(dienst));
}

/** Splitst "het verhuisbedrijf" in het lidwoord en de naam eromheen. */
export function deelLidwoord(dienst: Dienst): { lidwoord: string; naam: string } {
  const [lidwoord = "de", ...rest] = dienst.lidwoordNaam.split(" ");
  return { lidwoord, naam: rest.join(" ") || dienst.naam.toLowerCase() };
}

export function metHoofdletter(woord: string): string {
  return woord.charAt(0).toUpperCase() + woord.slice(1);
}

/**
 * Zoekt op naam, meervoud en menulabel. Met 87 diensten is een lijst doorlezen
 * geen optie meer, dus het veld op de homepage typt mee. Een treffer aan het
 * begin van het woord weegt zwaarder dan een treffer in het midden, zodat
 * "dak" eerst Dakdekkers geeft en niet Plat dakwerk.
 */
export function zoekDiensten(zoekterm: string, maximum = 8): Dienst[] {
  const term = zoekterm.trim().toLowerCase();
  if (!term) return [];

  const treffers: { dienst: Dienst; rang: number }[] = [];

  for (const dienst of diensten) {
    const velden = [dienst.naam, dienst.meervoud, dienst.menuLabel, ...dienst.opties.map((o) => o.label)];
    let beste = Infinity;

    for (const [index, veld] of velden.entries()) {
      const positie = veld.toLowerCase().indexOf(term);
      if (positie === -1) continue;
      // Begin van het veld weegt het zwaarst, daarna de positie, daarna welk veld het was.
      beste = Math.min(beste, positie * 10 + (index > 2 ? 5 : 0));
    }

    if (beste < Infinity) treffers.push({ dienst, rang: beste });
  }

  return treffers
    .sort((a, b) => a.rang - b.rang || a.dienst.naam.localeCompare(b.dienst.naam, "nl"))
    .slice(0, maximum)
    .map((treffer) => treffer.dienst);
}

/** Andere diensten uit dezelfde categorie, voor de doorverwijzing onderaan een pagina. */
export function verwanteDiensten(dienst: Dienst, aantal = 6): Dienst[] {
  return dienstenVanCategorie(dienst.categorie)
    .filter((andere) => andere.slug !== dienst.slug)
    .slice(0, aantal);
}
