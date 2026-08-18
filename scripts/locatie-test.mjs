/**
 * Controleert de plaatsbepaling door de geo-headers na te bootsen die Vercel en
 * Cloudflare in productie meesturen. Draai de dev- of productieserver ernaast.
 *
 * We lezen de zichtbare kop (h1), niet de <title>. Dat onderscheid is bewust:
 * de pagina begroet de bezoeker met zijn eigen plaats, maar de titel en de
 * beschrijving blijven landelijk — anders indexeert Google de homepage onder
 * de plaats van de crawler en krijgt een gedeelde link de plaats van degene
 * die hem deelde. De laatste controle bewaakt precies dat.
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
  const kop = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
  const gevonden = kop.replace(/^Vakmensen in /, "").replace(/ die bij jouw klus passen$/, "");

  const goed = gevonden === geval.verwacht;
  if (!goed) mislukt += 1;
  console.log(`${goed ? "ok  " : "FOUT"} ${geval.naam}: "${gevonden}"`);
}

// De titel mag juist NIET meebewegen met het ip-adres; zie de opmerking bovenaan.
{
  const html = await (await fetch(basis, { headers: { "x-vercel-ip-country": "NL", "x-vercel-ip-city": "Amsterdam" } })).text();
  const titel = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const landelijk = !titel.includes("Amsterdam");
  if (!landelijk) mislukt += 1;
  console.log(`${landelijk ? "ok  " : "FOUT"} de titel blijft landelijk, ook met een geo-header: "${titel}"`);
}

console.log(mislukt === 0 ? "\nalles goed" : `\n${mislukt} mislukt`);
process.exit(mislukt === 0 ? 0 : 1);
