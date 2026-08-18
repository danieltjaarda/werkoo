/**
 * Maakt voor elk beroep uit dienst-data.ts een hero-afbeelding in de stijl van
 * de videograaf-foto (assets-src/foto.png), met Google's Nano Banana
 * (Gemini image model). Per beroep: ander uiterlijk, kleding en voorwerp,
 * andere naam en beroep op het naambordje.
 *
 * Draaien met:  GEMINI_API_KEY=... node scripts/beroep-images.mjs [slug ...]
 * Opties:       --force        bestaande beelden opnieuw genereren
 *               --model=NAAM   ander model (standaard gemini-3.1-flash-image)
 *               --chroma       genereer op een magenta achtergrond en key die weg;
 *                              nodig bij witte kleding (schilder, stukadoor, kok…)
 *
 * Het naambordje rechtsonder tekenen we zelf met sharp: het model spelt de
 * tekst anders geregeld verkeerd.
 *
 * De ruwe uitvoer komt in assets-src/beroepen/<slug>.png, de uitgeknipte
 * webversie in public/images/beroepen/<slug>.png en .webp.
 */
import "./lib/fonts.mjs";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { knipUit, knipUitChroma } from "./lib/knip-uit.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const model = args.find((a) => a.startsWith("--model="))?.slice(8) ?? "gemini-3.1-flash-image";
const chroma = args.includes("--chroma");
const alleenSlugs = args.filter((a) => !a.startsWith("--"));

const apiKey = process.env.GEMINI_API_KEY ?? (await leesEnvLocal("GEMINI_API_KEY"));
if (!apiKey) throw new Error("Zet GEMINI_API_KEY in de omgeving of in .env.local");

async function leesEnvLocal(naam) {
  if (!existsSync(".env.local")) return undefined;
  const regel = (await readFile(".env.local", "utf8")).split("\n").find((r) => r.startsWith(`${naam}=`));
  return regel?.slice(naam.length + 1).trim().replace(/^["']|["']$/g, "");
}

// Beroepen uit de bron halen zonder de TypeScript te hoeven laden.
const bron = await readFile("src/lib/dienst-data.ts", "utf8");
const beroepen = [...bron.matchAll(/^\s+slug: "([^"]+)",\s*\n\s+naam: "([^"]+)",\s*\n\s+meervoud:/gm)].map(
  ([, slug, naam]) => ({ slug, naam }),
);
if (beroepen.length < 80) throw new Error(`Maar ${beroepen.length} beroepen gevonden in dienst-data.ts`);

/**
 * Korte Engelse omschrijving per beroep: wat de persoon draagt en vasthoudt.
 * Het model werkt beter in het Engels en met een concreet voorwerp.
 */
const OMSCHRIJVING = {
  asbestverwijderaar: "asbestos removal specialist in a white protective coverall (hood down) holding a respirator mask",
  "bouwkundig-keurder": "building inspector in a smart-casual outfit with a safety vest, holding a clipboard and a moisture meter",
  dakdekker: "roofer in work trousers and a t-shirt, holding a roll of bitumen roofing and a gas torch",
  dakgootspecialist: "gutter specialist in work clothes holding a section of zinc gutter and a ladder beside him",
  dakkapelspecialist: "dormer window installer in work clothes holding a folding rule and a small dormer window frame",
  keukenspecialist: "kitchen designer in a neat shirt holding a kitchen worktop sample and a tablet",
  metselaar: "bricklayer in work clothes holding a brick trowel and a brick",
  opslagruimte: "storage facility employee in a polo shirt with a moving box and a padlock key",
  rioolservice: "sewer service technician in work clothes holding a drain inspection camera cable",
  sloopbedrijf: "demolition worker in a hi-vis jacket and helmet holding a sledgehammer",
  tegelzetter: "tiler in work clothes holding a notched trowel and a ceramic tile",
  timmerman: "carpenter in work trousers with a tool belt, holding a hand saw and a plank",
  verhuisbedrijf: "mover in a company polo shirt carrying a cardboard moving box",
  aannemer: "building contractor in a checked shirt and hard hat holding rolled-up blueprints",
  architect: "architect in a stylish black outfit holding a scale model of a house",
  badkamerinstallateur: "bathroom installer in work clothes holding a chrome shower head and a wrench",
  boomverzorger: "tree surgeon in climbing harness and helmet holding a chainsaw",
  elektricien: "electrician in work clothes holding a multimeter and a coil of electrical cable",
  gevelreiniger: "facade cleaner in waterproof work clothes holding a pressure washer lance",
  gevelspecialist: "facade specialist in work clothes holding a piece of cladding and a caulking gun",
  hekwerkspecialist: "fencing installer in work clothes holding a fence post and a cordless drill",
  hovenier: "gardener/landscaper in green work clothes holding a spade and a potted plant",
  interieurstylist: "interior stylist in an elegant outfit holding fabric swatches and a colour fan",
  isolatiebedrijf: "insulation installer in work clothes holding a roll of insulation wool",
  klusjesman: "handyman in a work shirt with a tool belt holding a cordless drill",
  meubelmaker: "furniture maker in a leather apron holding a wooden chair and a chisel",
  ongediertebestrijder: "pest controller in a work uniform holding a sprayer",
  schilder: "house painter in white painter's overalls holding a paint roller and a paint tin",
  schoorsteenveger: "chimney sweep in black work clothes holding a chimney brush",
  stoffeerder: "upholsterer in an apron holding a staple gun and a piece of upholstery fabric",
  stratenmaker: "paver in work clothes with knee pads holding a rubber mallet and a paving stone",
  stukadoor: "plasterer in white work clothes holding a plastering trowel and hawk",
  traprenovatie: "stair renovation specialist in work clothes holding a wooden stair tread sample",
  vloerlegger: "floor layer in work clothes with knee pads holding laminate planks",
  vochtbestrijder: "damp-proofing specialist in work clothes holding a moisture meter",
  zonweringspecialist: "awning and sun blind installer in work clothes holding a roll of awning fabric",
  "airco-installateur": "air conditioning installer in work clothes holding a split-unit indoor air conditioner",
  alarmsysteem: "security system installer in a company polo holding an alarm control panel and a sensor",
  "cv-installateur": "heating engineer in work clothes holding a pipe wrench next to a central heating boiler",
  "energielabel-adviseur": "energy label advisor in smart-casual clothes holding a tablet showing an energy label",
  glaszetter: "glazier in work clothes holding a pane of glass with suction cups",
  kozijnspecialist: "window frame installer in work clothes holding a section of white window frame",
  "laadpaal-installateur": "EV charger installer in work clothes holding an electric car charging plug",
  loodgieter: "plumber in work clothes holding a pipe wrench and a copper pipe",
  "thuisbatterij-installateur": "home battery installer in work clothes next to a wall-mounted home battery unit",
  "warmtepomp-installateur": "heat pump installer in work clothes next to a heat pump outdoor unit",
  "zonnepanelen-installateur": "solar panel installer in work clothes holding a solar panel",
  aankoopmakelaar: "buyer's real estate agent in a business suit holding house keys and a folder",
  advocaat: "lawyer in a dark suit holding a law book and a folder",
  belastingadviseur: "tax advisor in a business shirt holding a calculator and tax papers",
  coach: "life coach in a casual blazer holding a notebook",
  dietist: "dietitian in a white coat holding a bowl of fresh fruit and vegetables",
  "financieel-adviseur": "financial advisor in a business suit holding a tablet with charts",
  hypotheekadviseur: "mortgage advisor in a business shirt holding a small model house and a pen",
  loopbaancoach: "career coach in smart-casual clothes holding a notebook and a CV",
  makelaar: "real estate agent in a business suit holding a 'Te Koop' sign and keys",
  mediator: "mediator in a smart-casual outfit holding a notepad",
  notaris: "notary in a formal suit holding a document folder and a fountain pen",
  "personal-trainer": "personal trainer in sportswear holding a dumbbell and a stopwatch",
  psycholoog: "psychologist in a warm cardigan holding a notebook",
  relatietherapeut: "relationship therapist in a friendly smart-casual outfit holding a notebook",
  rijschool: "driving instructor in a polo shirt holding car keys and an L-plate",
  scheidingsmediator: "divorce mediator in a business outfit holding a folder of documents",
  taxateur: "property valuer in a blazer holding a laser distance meter and a clipboard",
  tolk: "interpreter in business clothes wearing a headset and holding a notepad",
  verkoopmakelaar: "seller's real estate agent in a business suit holding a house key and a brochure",
  verzekeringsadviseur: "insurance advisor in a business shirt holding a folder and a pen",
  accountant: "accountant in a business shirt holding a laptop and a financial report",
  beveiligingsbedrijf: "security guard in a black security uniform holding a two-way radio",
  boekhouder: "bookkeeper in a shirt holding a stack of invoices and a calculator",
  "grafisch-ontwerper": "graphic designer in a creative casual outfit holding a tablet with a stylus",
  incassobureau: "debt collection agent in a business shirt holding a folder and a phone",
  koffieautomaat: "coffee machine supplier in a company polo next to a professional coffee machine, holding a cup",
  "online-marketingbureau": "online marketer in a casual shirt holding a laptop showing a dashboard",
  reclamebureau: "advertising creative in a trendy outfit holding a poster mock-up",
  schoonmaakbedrijf: "cleaner in a company polo holding a spray bottle and a microfibre cloth",
  "seo-specialist": "SEO specialist in a casual hoodie holding a laptop with a graph",
  tekstschrijver: "copywriter in a casual outfit holding a laptop and a notebook",
  vertaalbureau: "translator in smart-casual clothes holding a dictionary and a laptop",
  webdesigner: "web designer in a casual outfit holding a laptop showing a website",
  cateraar: "caterer in a chef's jacket holding a tray of appetizers",
  dj: "DJ in a stylish outfit wearing headphones around the neck, next to a DJ controller",
  fotograaf: "photographer in a casual outfit holding a professional DSLR camera",
  trouwfotograaf: "wedding photographer in a smart outfit holding a camera with a large lens",
  uitvaartverzorger: "funeral director in a dignified dark suit holding a folder",
  videograaf: "videographer in a dark knitted sweater with a professional Sony cinema camera on a tripod",
  weddingplanner: "wedding planner in an elegant outfit holding a planner binder and a bouquet",
};

/** Voornamen en achternamen; per beroep vast gekozen, zodat een herhaling dezelfde naam geeft. */
const VOORNAMEN_M = ["Daan", "Bram", "Sem", "Lars", "Thijs", "Jesse", "Ruben", "Niels", "Sven", "Koen", "Joris", "Tim", "Mark", "Bas", "Rick", "Stijn", "Pim", "Teun", "Wouter", "Jeroen", "Maarten", "Sander", "Erik", "Dennis", "Michel", "Roy", "Kevin", "Robin", "Jelle", "Floris"];
const VOORNAMEN_V = ["Sanne", "Fleur", "Lotte", "Anouk", "Femke", "Iris", "Marit", "Eva", "Nienke", "Lisa", "Roos", "Noor", "Merel", "Sophie", "Julia", "Esmee", "Maud", "Tessa", "Kim", "Linda", "Marloes", "Ilse", "Nadia", "Yara", "Isa", "Britt", "Amber", "Vera", "Manon", "Jasmijn"];
const ACHTERNAMEN = ["de Vries", "Jansen", "Bakker", "Visser", "Smit", "Meijer", "de Boer", "Mulder", "de Groot", "Bos", "Vos", "Peters", "Hendriks", "van Leeuwen", "Dekker", "Brouwer", "de Wit", "Dijkstra", "Smits", "de Graaf", "van der Meer", "van der Linden", "Kok", "Jacobs", "de Haan", "Vermeulen", "van den Berg", "van Dijk", "Kuipers", "Schouten", "Willems", "Hoekstra", "Koster", "van Wijk", "Prins", "Huisman", "Blom", "Kramer", "Post", "van Beek", "Sanders", "Timmermans", "Groen", "Vink", "Peeters", "van Vliet", "Verhoeven", "de Lange", "Scholten", "Molenaar"];

function persoonVoor(index) {
  // Ongeveer twee derde man, een derde vrouw; wisselend door de lijst heen.
  const vrouw = index % 3 === 1;
  const voornaam = vrouw ? VOORNAMEN_V[index % VOORNAMEN_V.length] : VOORNAMEN_M[(index * 7) % VOORNAMEN_M.length];
  const achternaam = ACHTERNAMEN[(index * 11) % ACHTERNAMEN.length];
  const waardering = (4.6 + ((index * 3) % 4) * 0.1).toFixed(1).replace(".", ",");
  return { naam: `${voornaam} ${achternaam}`, vrouw, waardering };
}

function prompt({ naam: beroep, slug }, persoon) {
  const omschrijving = OMSCHRIJVING[slug] ?? `${beroep} (a Dutch tradesperson) in typical work clothes holding a typical tool of the trade`;
  return [
    `Edit this photo. Keep the exact composition and style: ${chroma ? "a completely flat, uniform, bright magenta (#FF00FF) background instead of the white one (no gradient, no shadows on it)" : "a plain pure-white studio background"}, the single hand-drawn teal wavy outline that loops around the subject, the same framing (person from the waist up, slightly right of center, smiling at the camera) and the same soft studio lighting.`,
    `Replace the person and everything they hold. The new person is a friendly, natural-looking Dutch ${persoon.vrouw ? "woman" : "man"} in their late twenties to forties, clearly a different person than in the original: a ${omschrijving}. Clothing and objects must be realistic and typical for this profession in the Netherlands. Remove the video camera and tripod entirely unless the profession uses one.`,
    "Remove the dark name badge in the bottom-right corner completely; leave that area as it would naturally look without it. No text, letters, logos or brand names anywhere in the image (also not on clothing or objects), no watermark. Photorealistic and sharp.",
  ].join("\n\n");
}

/** Het naambordje, in de stijl van het origineel, als svg-overlay op een vierkant beeld. */
function bordje(persoon, beroep, breedte) {
  const e = breedte / 1024; // schaal t.o.v. het testbeeld van 1024px
  const naamGrootte = 26 * e;
  const regelGrootte = 22 * e;
  const pad = 22 * e;
  const tekstBreedte = Math.max(persoon.naam.length * 0.64 * naamGrootte, (beroep.length + 6) * 0.6 * regelGrootte);
  const w = Math.round(tekstBreedte + pad * 2);
  const h = Math.round(naamGrootte + regelGrootte + pad * 2.1);
  const x = Math.round(breedte * 0.83 - w);
  const y = Math.round(breedte * 0.94 - h);
  const beroepBreedte = beroep.length * 0.6 * regelGrootte;
  const sterX = pad + beroepBreedte + 4.6 * regelGrootte;
  const sterY = pad + naamGrootte + regelGrootte * 0.62;
  const r = regelGrootte * 0.5;
  const ster = Array.from({ length: 10 }, (_, i) => {
    const hoek = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    return `${(sterX + Math.cos(hoek) * rad).toFixed(1)},${(sterY + Math.sin(hoek) * rad).toFixed(1)}`;
  }).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${10 * e}" fill="#1c2733" fill-opacity="0.9" stroke="#2ed4d4" stroke-width="${2 * e}"/>
    <text x="${pad}" y="${pad + naamGrootte * 0.82}" font-family="Montserrat" font-weight="700" font-size="${naamGrootte}" fill="#ffffff">${persoon.naam}</text>
    <text x="${pad}" y="${pad + naamGrootte + regelGrootte * 0.98}" font-family="Montserrat" font-weight="500" font-size="${regelGrootte}" fill="#ffffff">${beroep}</text>
    <text x="${pad + beroepBreedte + 2.4 * regelGrootte}" y="${pad + naamGrootte + regelGrootte * 0.98}" font-family="Montserrat" font-weight="500" font-size="${regelGrootte}" fill="#ffffff">${persoon.waardering}</text>
    <polygon points="${ster}" fill="#ffffff"/>
  </svg>`;
  return { input: Buffer.from(svg), left: x, top: y };
}

// Referentiebeeld: verkleind, zodat de aanvraag klein blijft.
const referentie = await sharp("assets-src/foto.png").resize({ width: 1024 }).jpeg({ quality: 90 }).toBuffer();

async function genereer(beroep, persoon) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: referentie.toString("base64") } },
          { text: prompt(beroep, persoon) },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: model.startsWith("gemini-2.5") ? { aspectRatio: "1:1" } : { aspectRatio: "1:1", imageSize: "2K" },
    },
  };
  const antwoord = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
  });
  if (!antwoord.ok) throw new Error(`${antwoord.status}: ${(await antwoord.text()).slice(0, 400)}`);
  const json = await antwoord.json();
  const deel = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!deel) throw new Error(`Geen afbeelding in antwoord: ${JSON.stringify(json).slice(0, 400)}`);
  // Het model levert soms jpeg; altijd als png wegschrijven.
  return sharp(Buffer.from(deel.inlineData.data, "base64")).png().toBuffer();
}

await mkdir("assets-src/beroepen", { recursive: true });
await mkdir("public/images/beroepen", { recursive: true });

const teDoen = beroepen.filter((b) => alleenSlugs.length === 0 || alleenSlugs.includes(b.slug));
let klaar = 0;
let mislukt = 0;

async function verwerk(beroep) {
  const index = beroepen.indexOf(beroep);
  const persoon = persoonVoor(index);
  const ruw = `assets-src/beroepen/${beroep.slug}.png`;
  const uit = `public/images/beroepen/${beroep.slug}`;

  if (!force && existsSync(ruw)) {
    console.log(`– ${beroep.slug}: bestaat al, overgeslagen`);
  } else {
    let poging = 0;
    let gelukt = false;
    while (poging < 3 && !gelukt) {
      poging++;
      try {
        const png = await genereer(beroep, persoon);
        // Eerst naast het doel schrijven, dan verplaatsen: zo leest niemand een half bestand.
        await writeFile(`${ruw}.tmp`, png);
        await rename(`${ruw}.tmp`, ruw);
        gelukt = true;
      } catch (fout) {
        console.log(`  ${beroep.slug}: poging ${poging} mislukt: ${fout.message.split("\n")[0]}`);
        if (poging < 3) await new Promise((r) => setTimeout(r, 4000 * poging));
      }
    }
    if (!gelukt) {
      mislukt++;
      return;
    }
    console.log(`✓ ${beroep.slug} (${persoon.naam}, ${persoon.waardering})`);
  }

  // Bordje erop en uitknippen voor de site, net als de videograaf.
  const { width } = await sharp(ruw).metadata();
  const metBordje = await sharp(ruw).composite([bordje(persoon, beroep.naam, width)]).png().toBuffer();
  const { cutout } = chroma ? await knipUitChroma(metBordje) : await knipUit(metBordje);
  await cutout.clone().png({ compressionLevel: 9, palette: false }).toFile(`${uit}.png`);
  await cutout.clone().webp({ quality: 88, alphaQuality: 90 }).toFile(`${uit}.webp`);
  klaar++;
}

// Drie tegelijk: snel genoeg, zonder tegen de limieten van de API aan te lopen.
const wachtrij = [...teDoen];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (wachtrij.length) {
      const beroep = wachtrij.shift();
      try {
        await verwerk(beroep);
      } catch (fout) {
        mislukt++;
        console.log(`✗ ${beroep.slug}: ${fout.message.split("\n")[0]}`);
      }
    }
  }),
);

console.log(`\n${klaar} beelden klaar, ${mislukt} mislukt (model: ${model})`);
