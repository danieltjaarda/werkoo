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

/**
 * Elke url in de sitemap moet ook echt gecrawld mogen worden. Deze controle
 * bestaat omdat "Disallow: /account" ooit stilletjes ook /accountant blokkeerde:
 * de dienstpagina stond netjes in de sitemap en was tegelijk verboden terrein.
 */
{
  const sitemap = await (await fetch(`${basis}/sitemap.xml`)).text();
  const paden = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((t) => new URL(t[1]).pathname);
  const robots = await (await fetch(`${basis}/robots.txt`)).text();
  const regels = [...robots.matchAll(/^Disallow:\s*(\S+)$/gm)].map((t) => t[1]);

  const geblokkeerd = paden.filter((pad) =>
    regels.some((regel) => {
      if (regel.endsWith("$")) return pad === regel.slice(0, -1);
      if (regel.includes("?")) return false;
      return pad.startsWith(regel);
    }),
  );

  const goed = geblokkeerd.length === 0;
  if (!goed) mislukt += 1;
  console.log(
    `${goed ? "ok  " : "FOUT"} elke url in de sitemap mag gecrawld worden${goed ? ` (${paden.length} urls)` : `: ${geblokkeerd.slice(0, 5).join(", ")}`}`,
  );
}

console.log(mislukt === 0 ? "\nalles goed" : `\n${mislukt} mislukt`);
process.exit(mislukt === 0 ? 0 : 1);

