/**
 * Maakt één groepsbeeld met zeven vakmensen uit de zes werkgebieden, in dezelfde
 * stijl als de losse beroepsbeelden (magenta achtergrond, teal lijn, uitgeknipt).
 *
 * Draaien met:  node scripts/beroep-groep.mjs [--model=NAAM] [--variant=2] [--knippen]
 *
 * De ruwe uitvoer komt in assets-src/groep-<variant>.png, het uitgeknipte beeld in
 * public/images/groep/<variant>.png en .webp. Welke variant de site gebruikt kies
 * je in de galerij (scripts/beroep-galerij.mjs); die kopieert hem naar
 * public/images/beroepen-groep.png en .webp.
 */
import "./lib/fonts.mjs";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { knipUitChroma } from "./lib/knip-uit.mjs";

const args = process.argv.slice(2);
const model = args.find((a) => a.startsWith("--model="))?.slice(8) ?? "gemini-3-pro-image";
const variant = args.find((a) => a.startsWith("--variant="))?.slice(10) ?? "1";
const alleenKnippen = args.includes("--knippen");

const apiKey = process.env.GEMINI_API_KEY ?? (await leesEnvLocal("GEMINI_API_KEY"));
if (!apiKey) throw new Error("Zet GEMINI_API_KEY in de omgeving of in .env.local");

async function leesEnvLocal(naam) {
  if (!existsSync(".env.local")) return undefined;
  const regel = (await readFile(".env.local", "utf8")).split("\n").find((r) => r.startsWith(`${naam}=`));
  return regel?.slice(naam.length + 1).trim().replace(/^["']|["']$/g, "");
}

/** Eén vakman per werkgebied, plus een loodgieter: samen dekken ze de hele site. */
const GROEP = [
  { slug: "timmerman", omschrijving: "a bearded MAN, carpenter in work trousers with a tool belt, holding a hand saw" },
  { slug: "schilder", omschrijving: "a MAN, house painter in white painter's overalls, holding a paint roller" },
  { slug: "zonnepanelen-installateur", omschrijving: "a WOMAN, solar panel installer in blue work clothes, holding a solar panel" },
  { slug: "loodgieter", omschrijving: "a WOMAN, plumber in a blue work jacket, holding a red pipe wrench" },
  { slug: "makelaar", omschrijving: "a WOMAN, real estate agent in a dark business suit, holding house keys" },
  { slug: "schoonmaakbedrijf", omschrijving: "a MAN, cleaner in a plain dark polo shirt, holding a spray bottle and a cloth" },
  { slug: "fotograaf", omschrijving: "a WOMAN, photographer in casual clothes, holding a professional camera" },
];

// Referenties: de originele foto voor de stijl, plus de zeven vakmensen zelf,
// zodat het dezelfde mensen worden als op de dienstpagina's.
const stijl = await sharp("assets-src/foto.png").resize({ width: 1024 }).jpeg({ quality: 90 }).toBuffer();

const KOL = 512;
const gezichten = await sharp({
  create: { width: KOL * 4, height: KOL * 2, channels: 3, background: "#ffffff" },
})
  .composite(
    await Promise.all(
      GROEP.map(async ({ slug }, i) => ({
        input: await sharp(`public/images/beroepen/${slug}.png`)
          .resize({ width: KOL, height: KOL, fit: "contain", background: "#ffffff" })
          .flatten({ background: "#ffffff" })
          .toBuffer(),
        left: (i % 4) * KOL,
        top: Math.floor(i / 4) * KOL,
      })),
    ),
  )
  .jpeg({ quality: 90 })
  .toBuffer();

const prompt = [
  "The first image shows the house style: a person cut out on a plain background with a single hand-drawn teal wavy line looping around them, soft studio lighting, photorealistic.",
  "The second image is a grid of seven Dutch tradespeople, numbered left to right, top to bottom.",
  "Create ONE new group photo containing all seven of these people standing together in a single row, as one team. Keep each person recognisable: the same face, hair, clothing and tool as in the grid.",
  `From left to right: ${GROEP.map((g, i) => `${i + 1}) ${g.omschrijving}`).join(", ")}.`,
  "Follow the stated gender of each person exactly: four women and three men.",
  "They stand shoulder to shoulder in a slight arc, all visible from the knees up, all smiling at the camera, evenly lit with the same soft studio light, sharp and photorealistic. Vary their ages naturally between about 25 and 55 so they look like a real team, not like a group of students. Leave generous empty margin above their heads and to the left and right of the group.",
  "The background must be a completely flat, uniform, bright magenta (#FF00FF) — no gradient, no shadows on the background, no floor line.",
  "Draw one single continuous hand-drawn teal (#2ED4D4) wavy line that loops loosely around the whole group, in the same style and thickness as in the first image. The line must stay completely inside the frame and must not be cut off at any edge.",
  "The clothing must be plain: no printed text, letters, logos or embroidered company names on any shirt, polo or jacket. No text, logos or watermark anywhere in the image, no name badges.",
].join("\n\n");

const body = {
  contents: [
    {
      role: "user",
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: stijl.toString("base64") } },
        { inlineData: { mimeType: "image/jpeg", data: gezichten.toString("base64") } },
        { text: prompt },
      ],
    },
  ],
  generationConfig: {
    responseModalities: ["IMAGE"],
    imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
  },
};

const ruw = `assets-src/groep-${variant}.png`;

let poging = 0;
let png = alleenKnippen && existsSync(ruw) ? await readFile(ruw) : undefined;
while (poging < 6 && !png) {
  poging++;
  try {
    const antwoord = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
    });
    if (!antwoord.ok) throw new Error(`${antwoord.status}: ${(await antwoord.text()).slice(0, 300)}`);
    const json = await antwoord.json();
    const deel = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!deel) throw new Error(`Geen afbeelding in antwoord: ${JSON.stringify(json).slice(0, 300)}`);
    png = await sharp(Buffer.from(deel.inlineData.data, "base64")).png().toBuffer();
  } catch (fout) {
    console.log(`poging ${poging} mislukt: ${fout.message.split("\n")[0]}`);
    if (poging < 6) await new Promise((r) => setTimeout(r, (fout.message.startsWith("429") ? 30000 : 4000) * poging));
  }
}
if (!png) throw new Error("groepsbeeld is niet gelukt");

if (!alleenKnippen) {
  await writeFile(`${ruw}.tmp`, png);
  await rename(`${ruw}.tmp`, ruw);
}

await mkdir("public/images/groep", { recursive: true });
const { cutout } = await knipUitChroma(ruw, { outWidth: 2000 });
await cutout.clone().png({ compressionLevel: 9, palette: false }).toFile(`public/images/groep/${variant}.png`);
await cutout.clone().webp({ quality: 88, alphaQuality: 90 }).toFile(`public/images/groep/${variant}.webp`);

console.log(`groepsbeeld klaar: ${ruw} → public/images/groep/${variant}.png (model: ${model})`);
