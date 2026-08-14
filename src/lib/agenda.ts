/**
 * Hulpjes voor de datumvraag in de aanvraag. De bezette dagen komen uit de
 * beschikbaarheid die de vakman zelf in zijn dashboard invult; die geeft de
 * server als lijst mee aan de kalender.
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
