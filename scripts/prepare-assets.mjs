/**
 * Bereidt de bronbestanden uit assets-src/ voor op gebruik in de site:
 * - kopieert de logo's naar public/
 * - pelt het beeldmerk uit merk.svg en maakt daar de waarderingsicoon en het favicon van
 * - knipt de witte studio-achtergrond uit foto.png en schaalt hem terug naar webformaat
 *
 * Draaien met: node scripts/prepare-assets.mjs
 */
import { copyFile, mkdir, readdir, readFile, stat } from "node:fs/promises";
import sharp from "sharp";
import { knipUit } from "./lib/knip-uit.mjs";

const OUT_WIDTH = 1200;

await mkdir("public/images", { recursive: true });

await copyFile("assets-src/4.svg", "public/logo-werkoo.svg");
await copyFile("assets-src/5.svg", "public/logo-werkoo-wit.svg");

/*
 * merk.svg is geen echte vector: het is een PNG met een aparte grijswaardenmask,
 * allebei als base64 in het bestand geplakt. We halen ze eruit, plakken de mask
 * als doorzichtigheid op de kleuren en snijden de lege rand weg.
 */
const merkSvg = await readFile("assets-src/merk.svg", "utf8");
const ingebed = [...merkSvg.matchAll(/xlink:href="data:image\/png;base64,([^"]+)"/g)].map((treffer) =>
  Buffer.from(treffer[1], "base64"),
);

if (ingebed.length < 2) throw new Error("merk.svg bevat niet de verwachte twee afbeeldingen");

const [maskBron, kleurBron] = ingebed;
const merk = await sharp(kleurBron)
  .ensureAlpha()
  .joinChannel(await sharp(maskBron).extractChannel(0).toColourspace("b-w").toBuffer())
  .png()
  .toBuffer()
  .then((buffer) => sharp(buffer).trim({ threshold: 1 }).png().toBuffer());

// Klein icoon voor de waarderingen; vierkant, zodat het in de opmaak niet uitrekt.
await sharp(merk)
  .resize({ width: 96, height: 96, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile("public/images/werkoo-merk.png");

/*
 * Favicons. Next pakt src/app/icon.png en apple-icon.png vanzelf op. Apple zet
 * een doorzichtig icoon op zwart, dus die krijgt een witte achtergrond mee.
 */
const metRand = (grootte, rand, achtergrond) =>
  sharp(merk)
    .resize({
      width: grootte - rand * 2,
      height: grootte - rand * 2,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({ top: rand, bottom: rand, left: rand, right: rand, background: achtergrond })
    .png({ compressionLevel: 9 });

await metRand(256, 20, { r: 0, g: 0, b: 0, alpha: 0 }).toFile("src/app/icon.png");
await metRand(180, 22, { r: 255, g: 255, b: 255, alpha: 1 }).toFile("src/app/apple-icon.png");

/*
 * Profielfoto's voor de vakmensenlijst. Ze worden getoond in een liggend vlak,
 * dus we snijden ze op die verhouding bij op tweemaal de weergavegrootte.
 */
await mkdir("public/images/profielen", { recursive: true });

const profielen = await readdir("assets-src/profielen");
for (const bestand of profielen.filter((naam) => naam.endsWith(".png"))) {
  const naam = bestand.replace(/\.png$/, "");
  await sharp(`assets-src/profielen/${bestand}`)
    .resize({ width: 720, height: 580, fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toFile(`public/images/profielen/${naam}.webp`);
}
console.log(`${profielen.length} profielfoto's klaargezet`);

/*
 * Sommige vakmensen leveren een liggend woordmerk in plaats van een foto. Dat mag
 * niet worden bijgesneden, dus die gaan passend op wit in een vierkante tegel: die
 * overleeft zowel de kleine vierkante kaart in de aanvraagflow als het liggende
 * vlak in de toplijst.
 */
const LOGO_TEGEL = 580;
const LOGO_RAND = 64;

const logos = (await readdir("assets-src/profielen-logo")).filter((naam) => /\.(png|svg)$/.test(naam));
for (const bestand of logos) {
  const naam = bestand.replace(/\.(png|svg)$/, "");
  // Een hoge density laat sharp een svg eerst groot uitrasteren, zodat de randen
  // na het verkleinen naar de tegel scherp blijven.
  await sharp(`assets-src/profielen-logo/${bestand}`, { density: 600 })
    .resize({
      width: LOGO_TEGEL - LOGO_RAND * 2,
      height: LOGO_TEGEL - LOGO_RAND * 2,
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .extend({
      top: LOGO_RAND,
      bottom: LOGO_RAND,
      left: LOGO_RAND,
      right: LOGO_RAND,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: 90 })
    .toFile(`public/images/profielen/${naam}.webp`);
}
console.log(`${logos.length} vakmanlogo's klaargezet`);

const { cutout, cropWidth, cropHeight, width, height } = await knipUit("assets-src/foto.png", { outWidth: OUT_WIDTH });
console.log(`Onderwerp gevonden op ${cropWidth}x${cropHeight} binnen ${width}x${height}`);

await cutout.clone().png({ compressionLevel: 9, palette: false }).toFile("public/images/videograaf.png");
await cutout.clone().webp({ quality: 88, alphaQuality: 90 }).toFile("public/images/videograaf.webp");

for (const file of ["public/images/videograaf.png", "public/images/videograaf.webp"]) {
  const { size } = await stat(file);
  console.log(`${file}: ${(size / 1024).toFixed(0)} kB`);
}
