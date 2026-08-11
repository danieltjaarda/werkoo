/**
 * Controleert de plaatsbepaling door de geo-headers na te bootsen die Vercel en
 * Cloudflare in productie meesturen. Draai de dev- of productieserver ernaast.
 */
const basis = process.env.URL ?? "http://localhost:3000";

const gevallen = [
  { naam: "geen enkel signaal", headers: {}, verwacht: "de buurt" },
  {
    naam: "Vercel-header",
    headers: { "x-vercel-ip-country": "NL", "x-vercel-ip-city": "Amsterdam" },
    verwacht: "Amsterdam",
  },
  {
    naam: "Cloudflare-header",
    headers: { "cf-ipcountry": "NL", "cf-ipcity": "Rotterdam" },
    verwacht: "Rotterdam",
  },
  {
    naam: "percent-encoding uit de header",
    headers: { "x-vercel-ip-country": "NL", "x-vercel-ip-city": "%27s-Hertogenbosch" },
    verwacht: "'s-Hertogenbosch",
  },
  {
    naam: "schrijfwijze uit onze eigen lijst",
    headers: { "x-vercel-ip-country": "NL", "x-vercel-ip-city": "DEN HAAG" },
    verwacht: "Den Haag",
  },
  {
    naam: "plaats zonder eigen pagina mag ook",
    headers: { "x-vercel-ip-country": "NL", "x-vercel-ip-city": "Wolvega" },
    verwacht: "Wolvega",
  },
  {
    naam: "bezoeker buiten ons werkgebied",
    headers: { "x-vercel-ip-country": "DE", "x-vercel-ip-city": "Berlin" },
    verwacht: "de buurt",
  },
  {
    naam: "onzin in de header wordt genegeerd",
    headers: { "x-vercel-ip-country": "NL", "x-vercel-ip-city": "<script>hoi</script>" },
    verwacht: "de buurt",
  },
  {
    naam: "eigen keuze gaat voor het ip-adres",
    headers: {
      "x-vercel-ip-country": "NL",
      "x-vercel-ip-city": "Rotterdam",
      cookie: "werkoo-plaats=Joure",
    },
    verwacht: "Joure",
  },
];

let mislukt = 0;

for (const geval of gevallen) {
  const antwoord = await fetch(basis, { headers: geval.headers });
  const html = await antwoord.text();
  const titel = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const gevonden = titel
    .replace(/&#x27;/g, "'")
    .replace(/^.* in /, "")
    .replace(/^.*bij jou in de buurt$/, "de buurt");

  const goed = gevonden === geval.verwacht;
  if (!goed) mislukt += 1;
  console.log(`${goed ? "ok  " : "FOUT"} ${geval.naam}: "${gevonden}"`);
}

console.log(mislukt === 0 ? "\nalles goed" : `\n${mislukt} van de ${gevallen.length} mislukt`);
process.exit(mislukt === 0 ? 0 : 1);
