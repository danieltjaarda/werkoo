/**
 * Controleert dat elke afbeelding waar de code naar wijst ook echt in public/
 * staat. Een ontbrekend bestand geeft geen buildfout maar een gebroken plaatje
 * op de pagina, en dat zie je pas als je er toevallig langsloopt — vandaar deze
 * controle. Andersom melden we ook wat er ongebruikt in public/images/site ligt,
 * zodat een nieuwe illustratie niet stilletjes blijft liggen.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const BRON = "src";
const PUBLIEK = "public";

async function alleBestanden(map) {
  const namen = await readdir(map, { withFileTypes: true });
  const uit = [];
  for (const naam of namen) {
    const pad = path.join(map, naam.name);
    if (naam.isDirectory()) uit.push(...(await alleBestanden(pad)));
    else if (/\.(ts|tsx)$/.test(naam.name)) uit.push(pad);
  }
  return uit;
}

const bestanden = await alleBestanden(BRON);
const verwijzingen = new Map();

for (const bestand of bestanden) {
  const inhoud = await readFile(bestand, "utf8");
  for (const treffer of inhoud.matchAll(/["'`](\/images\/[A-Za-z0-9._/-]+\.(?:webp|png|jpg|svg))["'`]/g)) {
    const pad = treffer[1];
    if (!verwijzingen.has(pad)) verwijzingen.set(pad, bestand);
  }
}

let mislukt = 0;

for (const [pad, bestand] of verwijzingen) {
  try {
    await stat(path.join(PUBLIEK, pad));
  } catch {
    mislukt += 1;
    console.log(`FOUT ontbreekt: ${pad}  (gebruikt in ${bestand})`);
  }
}

console.log(`${verwijzingen.size} vaste verwijzingen gecontroleerd, ${mislukt} ontbreken.`);

// De illustratiemap wordt met een sjabloon aangesproken (`/images/site/${id}.webp`),
// dus die vergelijken we los: wat ligt er, en wat noemt de code ergens bij naam?
const site = (await readdir(path.join(PUBLIEK, "images/site"))).filter((n) => n.endsWith(".webp"));
const codeTekst = (await Promise.all(bestanden.map((b) => readFile(b, "utf8")))).join("\n");
/**
 * Namen die via een sjabloon worden opgebouwd, zoals
 * `/images/site/categorie-${categorie.id}.webp`, staan nergens voluit in de
 * code. We laten daarom ook het voorvoegsel tot het eerste koppelteken gelden.
 */
const ongebruikt = site.filter((naam) => {
  const id = naam.replace(".webp", "");
  const voorvoegsel = id.includes("-") ? `${id.slice(0, id.indexOf("-"))}-` : id;
  return !codeTekst.includes(id) && !codeTekst.includes(`site/${voorvoegsel}`);
});

if (ongebruikt.length) {
  console.log(`\nLiggen ongebruikt in public/images/site: ${ongebruikt.join(", ")}`);
}

// De index moet gelijklopen met de map, anders blijft een nieuwe illustratie onzichtbaar.
const index = await readFile("src/lib/site-beelden.ts", "utf8");
const inIndex = [...index.matchAll(/^ {2}"([^"]+)",$/gm)].map((t) => t[1]);
const opSchijf = site.map((n) => n.replace(".webp", ""));
const nieuw = opSchijf.filter((n) => !inIndex.includes(n));
const weg = inIndex.filter((n) => !opSchijf.includes(n));

if (nieuw.length || weg.length) {
  mislukt += 1;
  if (nieuw.length) console.log(`FOUT nog niet in de index: ${nieuw.join(", ")} — draai npm run beelden:index`);
  if (weg.length) console.log(`FOUT staat in de index maar niet op schijf: ${weg.join(", ")}`);
}

console.log(mislukt === 0 ? "\nalles goed" : `\n${mislukt} probleem(en) met afbeeldingen`);
process.exit(mislukt === 0 ? 0 : 1);
