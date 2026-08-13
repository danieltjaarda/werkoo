/**
 * Plaatsnamen die we kennen. De lijst dient drie doelen:
 * - de juiste schrijfwijze teruggeven bij een plaats uit een geo-header of een url
 * - bepalen voor welke plaatsen we een pagina vooraf bouwen
 * - controleren of een gedetecteerde plaats er een van ons is
 */
/** Naam van het cookie waarin we de zelfgekozen plaats bewaren. */
export const PLAATS_COOKIE = "werkoo-plaats";

export const plaatsen = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Tilburg",
  "Almere",
  "Breda",
  "Nijmegen",
  "Arnhem",
  "Haarlem",
  "Enschede",
  "Amersfoort",
  "Apeldoorn",
  "'s-Hertogenbosch",
  "Maastricht",
  "Leiden",
  "Dordrecht",
  "Zoetermeer",
  "Zwolle",
  "Deventer",
  "Delft",
  "Alkmaar",
  "Leeuwarden",
  "Venlo",
  "Hilversum",
  "Amstelveen",
  "Gouda",
  "Ede",
  "Oss",
  "Helmond",
  "Lelystad",
  "Hengelo",
  "Assen",
  "Emmen",
  "Middelburg",
  "Heerenveen",
  "Sneek",
  "Joure",
] as const;

/** "Den Haag" -> "den-haag", "'s-Hertogenbosch" -> "s-hertogenbosch" */
export function slugVanPlaatsnaam(naam: string): string {
  return naam
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const opSlug = new Map(plaatsen.map((plaats) => [slugVanPlaatsnaam(plaats), plaats]));

/** Zoekt de officiële schrijfwijze op; geeft undefined als we de plaats niet kennen. */
export function bekendePlaats(naam: string): string | undefined {
  return opSlug.get(slugVanPlaatsnaam(naam));
}

/** Woorden die binnen een plaatsnaam klein blijven: "Bergen op Zoom", "Berkel en Rodenrijs". */
const kleineWoorden = new Set(["aan", "de", "den", "der", "het", "en", "op", "te", "ten", "ter", "van"]);

function metHoofdletters(naam: string): string {
  return naam
    .split(" ")
    .map((woord, index) => {
      if (index > 0 && kleineWoorden.has(woord.toLowerCase())) return woord.toLowerCase();
      return woord
        .split("-")
        .map((deel) => deel.charAt(0).toUpperCase() + deel.slice(1).toLowerCase())
        .join("-");
    })
    .join(" ");
}

/**
 * Maakt een plaatsnaam uit een externe bron veilig bruikbaar. Geo-headers en
 * cookies kunnen van alles bevatten, dus we accepteren alleen iets dat op een
 * plaatsnaam lijkt en geven daarna onze eigen schrijfwijze terug.
 */
export function normaliseerPlaats(ruw: string | null | undefined): string | undefined {
  if (!ruw) return undefined;

  let waarde = ruw.trim();
  if (waarde.includes("%")) {
    // Vercel codeert niet-ASCII tekens volgens RFC3986.
    try {
      waarde = decodeURIComponent(waarde);
    } catch {
      return undefined;
    }
  }

  // Een enkele plaats begint met een apostrof, zoals 's-Hertogenbosch. De
  // Locatieserver geeft gelijknamige plaatsen terug met de provincie erachter,
  // zoals "Bergen (NH)", dus haakjes horen er ook bij.
  if (!/^['’]?\p{L}[\p{L}\s'’.()-]{1,39}$/u.test(waarde)) return undefined;

  return bekendePlaats(waarde) ?? metHoofdletters(waarde);
}
