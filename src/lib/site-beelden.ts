/**
 * De illustraties in public/images/site, bijgehouden door
 * scripts/beelden-index.mjs. Niet met de hand aanpassen: draai
 * `npm run beelden:index` nadat je een bestand hebt toegevoegd.
 */
const AANWEZIG = new Set([
  "categorie-duurzaam",
  "categorie-evenementen",
  "categorie-huis-tuin",
  "categorie-persoonlijk",
  "categorie-verbouwen",
  "categorie-zakelijk",
  "datum",
  "klaar",
  "klant-1",
  "klant-2",
  "klant-3",
  "klant-4",
  "klant-5",
  "klant-6",
  "naam",
  "niet-gevonden",
  "plaats",
  "stap-1-beschrijf",
  "stap-2-reacties",
  "stap-3-kies",
  "telefoon",
  "type",
  "vakman-aanmelden",
  "vakmensen",
  "wensen",
  "werkgebied",
]);

/**
 * Het pad naar een illustratie, of undefined als hij er (nog) niet is. Zo
 * hoeft de pagina niet te weten welke beelden al gemaakt zijn.
 */
export function beeld(naam: string | undefined): string | undefined {
  if (!naam || !AANWEZIG.has(naam)) return undefined;
  return `/images/site/${naam}.webp`;
}
