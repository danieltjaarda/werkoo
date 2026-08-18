/**
 * Schrijft src/lib/site-beelden.ts: de lijst met illustraties die echt in
 * public/images/site staan. De componenten vragen via `beeld("adres")` om een
 * illustratie en krijgen `undefined` als hij er nog niet is — dan blijft de
 * plek gewoon leeg in plaats van een gebroken plaatje te tonen.
 *
 * Draaien nadat je illustraties hebt toegevoegd: npm run beelden:index
 */
import { readdir, writeFile } from "node:fs/promises";

const MAP = "public/images/site";
const DOEL = "src/lib/site-beelden.ts";

const namen = (await readdir(MAP))
  .filter((naam) => naam.endsWith(".webp"))
  .map((naam) => naam.replace(".webp", ""))
  .sort();

const inhoud = `/**
 * De illustraties in public/images/site, bijgehouden door
 * scripts/beelden-index.mjs. Niet met de hand aanpassen: draai
 * \`npm run beelden:index\` nadat je een bestand hebt toegevoegd.
 */
const AANWEZIG = new Set([
${namen.map((naam) => `  "${naam}",`).join("\n")}
]);

/**
 * Het pad naar een illustratie, of undefined als hij er (nog) niet is. Zo
 * hoeft de pagina niet te weten welke beelden al gemaakt zijn.
 */
export function beeld(naam: string | undefined): string | undefined {
  if (!naam || !AANWEZIG.has(naam)) return undefined;
  return \`/images/site/\${naam}.webp\`;
}
`;

await writeFile(DOEL, inhoud);
console.log(`${namen.length} illustraties in ${DOEL}`);
