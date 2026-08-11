import { plaatsen } from "@/lib/plaatsen";

export type Suggestie = {
  naam: string;
  /** Provincie of gemeente, zodat je twee plaatsen met dezelfde naam uit elkaar houdt. */
  toelichting: string;
};

const PDOK = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest";

/** Onze eigen lijst geeft meteen antwoord, nog voordat het net erbij komt. */
export function eigenSuggesties(zoekterm: string, maximum = 6): Suggestie[] {
  const term = zoekterm.trim().toLowerCase();
  if (!term) return [];

  return plaatsen
    .filter((plaats) => plaats.toLowerCase().startsWith(term))
    .slice(0, maximum)
    .map((plaats) => ({ naam: plaats, toelichting: "" }));
}

/**
 * De Locatieserver van PDOK kent alle Nederlandse woonplaatsen. Hij geeft een
 * weergavenaam als "Weesp, Amsterdam, Noord-Holland": eerst de plaats, dan de
 * gemeente en tot slot de provincie.
 */
export async function zoekPlaatsen(zoekterm: string, signal?: AbortSignal): Promise<Suggestie[]> {
  const term = zoekterm.trim();
  if (!term) return [];

  const url = `${PDOK}?${new URLSearchParams({
    q: term,
    fq: "type:woonplaats",
    rows: "6",
  })}`;

  const antwoord = await fetch(url, { signal });
  if (!antwoord.ok) throw new Error(`Locatieserver gaf ${antwoord.status}`);

  const data: unknown = await antwoord.json();
  const docs = (data as { response?: { docs?: { weergavenaam?: string }[] } }).response?.docs ?? [];

  return docs.flatMap((doc) => {
    const delen = (doc.weergavenaam ?? "").split(",").map((deel) => deel.trim());
    const naam = delen[0];
    if (!naam) return [];
    return [{ naam, toelichting: delen.at(-1) !== naam ? (delen.at(-1) ?? "") : "" }];
  });
}

/** Voegt beide bronnen samen zonder dubbele plaatsnamen. */
export function voegSamen(...lijsten: Suggestie[][]): Suggestie[] {
  const gezien = new Set<string>();
  const samen: Suggestie[] = [];

  for (const suggestie of lijsten.flat()) {
    const sleutel = suggestie.naam.toLowerCase();
    if (gezien.has(sleutel)) continue;
    gezien.add(sleutel);
    samen.push(suggestie);
  }

  return samen.slice(0, 6);
}
