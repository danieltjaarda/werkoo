/**
 * Beelden voor de rest van de site, in dezelfde huisstijl als de beroepsfoto's:
 * gemaakt op magenta en daarna uitgeknipt, zodat ze op elke achtergrond passen.
 *
 * Draaien met:  node scripts/site-beelden.mjs [id ...]
 * Opties:       --force     bestaande beelden opnieuw maken
 *               --knippen   niets genereren, alleen opnieuw uitknippen
 *               --model=NAAM
 *
 * Ruwe uitvoer in assets-src/site/<id>.png, uitgeknipt in public/images/site/<id>.png en .webp.
 */
import "./lib/fonts.mjs";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { knipUitChroma } from "./lib/knip-uit.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const alleenKnippen = args.includes("--knippen");
const model = args.find((a) => a.startsWith("--model="))?.slice(8) ?? "gemini-3-pro-image";
const alleenIds = args.filter((a) => !a.startsWith("--"));

const apiKey = process.env.GEMINI_API_KEY ?? (await leesEnvLocal("GEMINI_API_KEY"));
if (!apiKey) throw new Error("Zet GEMINI_API_KEY in de omgeving of in .env.local");

async function leesEnvLocal(naam) {
  if (!existsSync(".env.local")) return undefined;
  const regel = (await readFile(".env.local", "utf8")).split("\n").find((r) => r.startsWith(`${naam}=`));
  return regel?.slice(naam.length + 1).trim().replace(/^["']|["']$/g, "");
}

// De originele studiofoto: het model houdt zich veel beter aan de vlakke
// achtergrond en de fotorealistische stijl als het er een voorbeeld bij krijgt.
const stijlFoto = await sharp("assets-src/foto.png").resize({ width: 1024 }).jpeg({ quality: 90 }).toBuffer();

const MAGENTA =
  "The background must be a completely flat, uniform, bright magenta (#FF00FF): no gradient, no shadow on the background, no floor line, no horizon.";
const MAGENTA_KORT =
  "a completely flat, uniform, bright magenta (#FF00FF) background: no gradient, no shadow on the background, no window, no room, no floor line.";
const GEEN_TEKST =
  "No text, no letters, no numbers, no logos, no brand names and no watermark anywhere in the image.";
const TEAL = "teal (#2ED4D4)";

/**
 * Een stilleven per categorie: gereedschap en materiaal netjes gestapeld, zonder
 * mensen — die staan al op de 87 beroepsfoto's.
 */
function stilleven(spullen) {
  return { tekst: [
    `A clean product photo of a neat arrangement of ${spullen}, floating together as one compact group, seen straight on, soft studio lighting, sharp and photorealistic.`,
    `One single continuous hand-drawn ${TEAL} wavy line loops loosely around the whole arrangement, like a marker drawing, staying completely inside the frame.`,
    MAGENTA,
    GEEN_TEKST,
  ].join(" ") };
}

/** Een stap uit "Zo werkt het": bouwt voort op de studiofoto, dus vlakke achtergrond. */
function stap(scene) {
  return {
    ref: true,
    tekst: [
      "Edit this photo. Keep the exact composition and style: the same soft studio lighting, the same framing (person from the waist up, slightly right of center, smiling at the camera), and the single hand-drawn teal wavy outline that loops around the subject.",
      `Replace the person and everything they hold: ${scene}`,
      "Remove the video camera and tripod entirely: nothing of the camera, its handle, microphone or monitor may remain. Remove the dark name badge in the bottom-right corner completely.",
      `Change the white background to ${MAGENTA_KORT}`,
      GEEN_TEKST + " Phone and laptop screens must be plain: no readable text, only vague coloured blocks. Photorealistic and sharp.",
    ].join("\n\n"),
  };
}

/** Een klantportret voor bij de ervaringen: gewone mensen, geen modellen, geen lijn. */
function klant(omschrijving) {
  return {
    ref: true,
    tekst: [
      "Edit this photo. Keep the same soft studio lighting and photorealistic style.",
      `Replace the person with ${omschrijving}. Frame them closer: head and shoulders only, centered, looking straight at the camera with a relaxed friendly smile. An ordinary Dutch person, not a model.`,
      "Remove the video camera, the tripod, the teal wavy line and the dark name badge completely: none of them may remain anywhere in the image.",
      `Change the white background to ${MAGENTA_KORT}`,
      GEEN_TEKST,
    ].join("\n\n"),
  };
}

/** Losse scene met een persoon erin, ook op basis van de studiofoto. */
function scene(beschrijving, extra = "") {
  return {
    ref: true,
    tekst: [
      "Edit this photo. Keep the exact composition and style: the same soft studio lighting, the same framing (person from the waist up), and the single hand-drawn teal wavy outline that loops around the subject, fully inside the frame.",
      `Replace the person and everything they hold: ${beschrijving}`,
      "Remove the video camera and tripod entirely, and remove the dark name badge in the bottom-right corner completely.",
      `Change the white background to ${MAGENTA_KORT}`,
      `${GEEN_TEKST} ${extra} Photorealistic and sharp, full colour (not black and white).`,
    ].join("\n\n"),
  };
}

const BEELDEN = [
  // Zes categorieën
  { id: "categorie-verbouwen", ratio: "4:3", ...stilleven("stacked cardboard moving boxes, a folded aluminium ladder, a roof tile and a bricklayer's trowel") },
  { id: "categorie-huis-tuin", ratio: "4:3", ...stilleven("a paint roller with a tin of paint, a potted green plant, a spade and a stack of wooden floor planks") },
  { id: "categorie-duurzaam", ratio: "4:3", ...stilleven("a solar panel, a white heat pump unit, an electric car charging plug and a coil of copper pipe") },
  { id: "categorie-persoonlijk", ratio: "4:3", ...stilleven("a set of house keys on a keyring, a leather folder with documents, a fountain pen and a pair of reading glasses") },
  { id: "categorie-zakelijk", ratio: "4:3", ...stilleven("a laptop showing plain coloured blocks, a stack of paper folders, a calculator and a cup of coffee") },
  { id: "categorie-evenementen", ratio: "4:3", ...stilleven("a professional camera, a tray of appetizers, a pair of DJ headphones and a small bouquet of flowers") },

  // Zo werkt het, drie stappen
  { id: "stap-1-beschrijf", ratio: "1:1", ...stap("holding a smartphone in both hands and typing on it, as if describing a job.") },
  { id: "stap-2-reacties", ratio: "1:1", ...stap("holding a smartphone up and looking pleasantly surprised at it, with three small floating rounded rectangles beside them like incoming messages, drawn in flat teal and dark blue.") },
  { id: "stap-3-kies", ratio: "1:1", ...stap("shaking hands with a tradesperson in work clothes who stands half in frame beside them, both smiling.") },

  // Klantportretten bij de ervaringen
  { id: "klant-1", ratio: "1:1", ...klant("a woman in her thirties with dark blonde hair in a light blouse, at home") },
  { id: "klant-2", ratio: "1:1", ...klant("a man in his forties with short greying hair and a beard, in a simple sweater") },
  { id: "klant-3", ratio: "1:1", ...klant("a woman in her fifties with glasses and shoulder-length brown hair, in a cardigan") },
  { id: "klant-4", ratio: "1:1", ...klant("a man in his late twenties with curly hair, in a t-shirt") },
  { id: "klant-5", ratio: "1:1", ...klant("a woman in her sixties with short grey hair, in a blouse") },
  { id: "klant-6", ratio: "1:1", ...klant("a man in his thirties with dark hair and a friendly round face, in a checked shirt") },

  // Losse pagina's
  {
    id: "niet-gevonden",
    ratio: "1:1",
    ...scene(
      "a friendly Dutch handyman in work clothes with a tool belt, holding a pair of binoculars up and looking through them, searching for something with a cheerful expression.",
    ),
  },
  {
    id: "vakman-aanmelden",
    ratio: "1:1",
    ...scene(
      "a Dutch tradeswoman in work clothes with a tool belt, smiling at a smartphone in her hand as a new job request comes in, holding a coffee cup in her other hand.",
      "The phone screen is plain: no readable text, only vague coloured blocks.",
    ),
  },
  {
    id: "aanvraag-verstuurd",
    ratio: "1:1",
    ...scene(
      "a cheerful Dutch woman giving a relaxed thumbs up with one hand and holding a coffee mug in the other, as if a task is off her list.",
    ),
  },

  // Aanvraagflow: bij elke vraag een beeld
  { id: "plaats", ratio: "1:1", ...scene("a friendly Dutch person holding a folded street map in one hand and pointing at a spot on it with the other, as if showing where the job is.", "The map shows only vague streets, no readable text.") },
  { id: "type", ratio: "1:1", ...scene("a friendly Dutch person reaching out to pick one of three floating rounded rectangles that hover in front of them, drawn as flat teal (#2ED4D4) and dark navy cards, the middle one slightly bigger as if chosen.", "The cards are plain coloured shapes.") },
  { id: "datum", ratio: "1:1", ...scene("a friendly Dutch person holding up a simple paper wall calendar with one day circled in teal marker.", "The calendar shows only an empty grid of squares, no numbers and no month name.") },
  { id: "wensen", ratio: "1:1", ...scene("a friendly Dutch person writing in a small notebook with a pen, looking up at the camera.", "The notebook page shows only vague pen strokes, no readable writing.") },
  { id: "vakmensen", ratio: "1:1", ...scene("three Dutch tradespeople standing side by side in work clothes (a plumber, a painter and an electrician), all smiling at the camera, with a large teal (#2ED4D4) hand-drawn check mark floating above the middle one.", "Show all three from the waist up.") },
  { id: "naam", ratio: "1:1", ...scene("a friendly Dutch person waving hello at the camera with one raised hand, warm and open.") },
  { id: "telefoon", ratio: "1:1", ...scene("a friendly Dutch person holding a smartphone to their ear, mid-conversation, smiling.") },

  // Aanmelden als vakman
  { id: "werkgebied", ratio: "1:1", ...scene("a Dutch tradesperson wearing a tool belt, holding up a simple paper map of the Netherlands with both hands.", "The map shows only the outline of the country, no place names, no text.") },

  // Lege schermen en losse pagina's
  { id: "geen-aanvragen", ratio: "1:1", ...scene("a friendly Dutch person holding an empty wooden tray in both hands and shrugging cheerfully, as if there is nothing in it yet.") },
  { id: "geen-werk", ratio: "1:1", ...scene("a Dutch tradesperson in work clothes leaning relaxed on a broom, looking at a smartphone in the other hand while waiting for work, patient and good-humoured.", "The phone screen is plain: no readable text.") },
  { id: "welkom", ratio: "1:1", ...scene("a friendly Dutch person holding a front door half open with one hand and gesturing 'come in' with the other, warm and welcoming.", "Show only the door and the person, nothing of a room behind it.") },
  { id: "wout", ratio: "1:1", ...klant("a friendly Dutch man in his early thirties with short dark blond hair and light stubble, in a plain dark blue polo shirt, looking approachable and helpful, like a service colleague you would like to chat with") },

  // Stillevens zonder mensen
  { id: "adres", ratio: "1:1", ...stilleven("a small model of a Dutch terraced house with a green front door, a doormat and a potted plant beside it") },
  { id: "email", ratio: "1:1", ...stilleven("a white paper envelope seen at a slight angle, with a large hand-drawn teal (#2ED4D4) check mark floating over its corner") },
  { id: "bedrijf", ratio: "1:1", ...stilleven("a small blank hanging wooden shop sign on a bracket, a clipboard with plain papers and a rubber stamp") },
  { id: "contact", ratio: "1:1", ...stilleven("two hands shaking, cropped at the wrists, one in a work sleeve and one in a shirt sleeve") },
  { id: "wachtwoord", ratio: "1:1", ...stilleven("a brass key and an open padlock lying next to each other") },
];

async function genereer(beeld) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          ...(beeld.ref ? [{ inlineData: { mimeType: "image/jpeg", data: stijlFoto.toString("base64") } }] : []),
          { text: beeld.tekst },
        ],
      },
    ],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: beeld.ratio, imageSize: "2K" } },
  };
  const antwoord = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
  });
  if (!antwoord.ok) throw new Error(`${antwoord.status}: ${(await antwoord.text()).slice(0, 300)}`);
  const json = await antwoord.json();
  const deel = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!deel) throw new Error(`Geen afbeelding in antwoord: ${JSON.stringify(json).slice(0, 300)}`);
  return sharp(Buffer.from(deel.inlineData.data, "base64")).png().toBuffer();
}

await mkdir("assets-src/site", { recursive: true });
await mkdir("public/images/site", { recursive: true });

const teDoen = BEELDEN.filter((b) => alleenIds.length === 0 || alleenIds.includes(b.id));
let klaar = 0;
let mislukt = 0;

async function verwerk(beeld, rondes = 0, opnieuw = false) {
  const ruw = `assets-src/site/${beeld.id}.png`;
  const uit = `public/images/site/${beeld.id}`;

  if (!alleenKnippen && (force || opnieuw || !existsSync(ruw))) {
    let poging = 0;
    let png;
    while (poging < 6 && !png) {
      poging++;
      try {
        png = await genereer(beeld);
      } catch (fout) {
        console.log(`  ${beeld.id}: poging ${poging} mislukt: ${fout.message.split("\n")[0]}`);
        if (poging < 6) await new Promise((r) => setTimeout(r, (fout.message.startsWith("429") ? 30000 : 4000) * poging));
      }
    }
    if (!png) {
      mislukt++;
      return;
    }
    await writeFile(`${ruw}.tmp`, png);
    await rename(`${ruw}.tmp`, ruw);
    console.log(`✓ ${beeld.id}`);
  } else if (!existsSync(ruw)) {
    return;
  }

  const { cutout } = await knipUitChroma(ruw, { outWidth: 1400 });
  const png = await cutout.clone().png({ compressionLevel: 9, palette: false }).toBuffer();

  // Soms blijft er een paars restant van de camera uit de referentiefoto staan.
  if (beeld.ref && !alleenKnippen && (await paarsePixels(png)) > PAARS_MAX && rondes < 2) {
    console.log(`  ${beeld.id}: paars restant, opnieuw (${rondes + 1})`);
    return verwerk(beeld, rondes + 1, true);
  }

  await writeFile(`${uit}.png`, png);
  await sharp(png).webp({ quality: 88, alphaQuality: 90 }).toFile(`${uit}.webp`);
  klaar++;
}

const PAARS_MAX = 9000;
async function paarsePixels(png) {
  const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 200 && Math.min(data[i], data[i + 2]) - data[i + 1] > 50) n++;
  }
  return n;
}

const wachtrij = [...teDoen];
await Promise.all(
  Array.from({ length: 2 }, async () => {
    while (wachtrij.length) {
      const beeld = wachtrij.shift();
      try {
        await verwerk(beeld);
      } catch (fout) {
        mislukt++;
        console.log(`✗ ${beeld.id}: ${fout.message.split("\n")[0]}`);
      }
    }
  }),
);

console.log(`\n${klaar} sitebeelden klaar, ${mislukt} mislukt (model: ${model})`);
