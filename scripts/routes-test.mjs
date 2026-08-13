/**
 * Controleert de routetabel. Sinds /[dienst] op het hoogste niveau staat, slokt
 * die elke url van één segment op: statische pagina's als /diensten en /aanvraag
 * winnen alleen omdat Next statische segmenten vóór dynamische sorteert, en dat
 * staat nergens in de documentatie. Vandaar deze test.
 */
const basis = process.env.URL ?? "http://localhost:3000";

const gevallen = [
  { pad: "/", status: 200, bevat: "Vakmensen in" },
  { pad: "/diensten", status: 200, bevat: "Alle 87 diensten" },
  { pad: "/diensten/huis-en-tuin", status: 200, bevat: "Huis &amp; tuin" },
  { pad: "/diensten/bestaat-niet", status: 404 },
  { pad: "/aanvraag", status: 200, bevat: "Waar heb je hulp bij nodig?" },
  { pad: "/aanvraag?dienst=dakdekker", status: 200, bevat: "Waar zoek je de dakdekker?" },
  { pad: "/aanmelden", status: 200, bevat: "Werk ontvangen" },
  { pad: "/privacy", status: 200, bevat: "Privacyverklaring" },
  { pad: "/voorwaarden", status: 200, bevat: "Algemene voorwaarden" },
  { pad: "/over-ons", status: 200, bevat: "Over Werkoo" },
  { pad: "/inloggen", status: 200, bevat: "Welkom terug" },
  { pad: "/videograaf", status: 200, bevat: "videograaf" },
  { pad: "/videograaf/joure", status: 200, bevat: "Joure" },
  { pad: "/dakdekker", status: 200, bevat: "dakdekker" },
  { pad: "/loodgieter/amsterdam", status: 200, bevat: "Amsterdam" },
  // Een plaats die wij niet kennen krijgt geen eigen pagina, anders zijn er
  // oneindig veel indexeerbare urls.
  { pad: "/videograaf/wolvega", status: 404 },
  { pad: "/bestaat-echt-niet", status: 404 },
  { pad: "/sitemap.xml", status: 200, bevat: "<loc>" },
  { pad: "/robots.txt", status: 200, bevat: "Sitemap:" },
];

let mislukt = 0;

for (const geval of gevallen) {
  const antwoord = await fetch(`${basis}${geval.pad}`);
  const html = await antwoord.text();

  const statusGoed = antwoord.status === geval.status;
  const inhoudGoed = !geval.bevat || html.includes(geval.bevat);
  const goed = statusGoed && inhoudGoed;

  if (!goed) mislukt += 1;
  const uitleg = statusGoed ? (inhoudGoed ? "" : ` — "${geval.bevat}" niet gevonden`) : ` — kreeg ${antwoord.status}`;
  console.log(`${goed ? "ok  " : "FOUT"} ${geval.pad} (${geval.status})${uitleg}`);
}

console.log(mislukt === 0 ? "\nalles goed" : `\n${mislukt} van de ${gevallen.length} mislukt`);
process.exit(mislukt === 0 ? 0 : 1);
