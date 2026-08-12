/**
 * Hulpjes voor de datumvraag in de aanvraag. Zolang er geen echte agenda's
 * achter zitten, verzinnen we per vakman een vast patroon van bezette dagen:
 * dezelfde vakman geeft altijd dezelfde dagen terug, zodat de kalender niet
 * verspringt tussen server en browser of tussen twee bezoeken.
 */

export const maandnamen = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

export const weekdagen = ["ma", "di", "wo", "do", "vr", "za", "zo"];

/** "2026-08-21" — de sleutel waarmee we een dag vasthouden. */
export function sleutel(datum: Date): string {
  const maand = String(datum.getMonth() + 1).padStart(2, "0");
  const dag = String(datum.getDate()).padStart(2, "0");
  return `${datum.getFullYear()}-${maand}-${dag}`;
}

/** "zaterdag 21 augustus 2026", voor in de samenvatting en de mail. */
export function leesbaar(sleutelwaarde: string): string {
  const [jaar, maand, dag] = sleutelwaarde.split("-").map(Number);
  return new Date(jaar, maand - 1, dag).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Maandag als eerste kolom: zondag is in JavaScript 0, bij ons 6. */
export function startKolom(jaar: number, maand: number): number {
  return (new Date(jaar, maand, 1).getDay() + 6) % 7;
}

export function aantalDagen(jaar: number, maand: number): number {
  return new Date(jaar, maand + 1, 0).getDate();
}

/** Kleine, stabiele hash: dezelfde invoer geeft altijd hetzelfde getal. */
function hash(tekst: string): number {
  let waarde = 0;
  for (let i = 0; i < tekst.length; i++) {
    waarde = (waarde * 31 + tekst.charCodeAt(i)) % 100000;
  }
  return waarde;
}

/**
 * Ongeveer een derde van de dagen staat vol, met een voorkeur voor zaterdagen:
 * dat is nu eenmaal de dag waarop trouwfilmers als eerste volgeboekt zitten.
 */
export function isBezet(sleutelwaarde: string, vakmanSlug: string | undefined): boolean {
  if (!vakmanSlug) return false;

  const [jaar, maand, dag] = sleutelwaarde.split("-").map(Number);
  const zaterdag = new Date(jaar, maand - 1, dag).getDay() === 6;
  const getal = hash(`${vakmanSlug}:${sleutelwaarde}`) % 100;

  return zaterdag ? getal < 55 : getal < 25;
}
