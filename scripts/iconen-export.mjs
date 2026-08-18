/**
 * Zet de iconen uit src/components/icons-extra.tsx om naar losse bestanden:
 * assets-src/iconen/<naam>.svg en <naam>.png (256 px, doorzichtig).
 *
 * Draaien met: node scripts/iconen-export.mjs
 *
 * De jsx-schrijfwijze (strokeWidth) wordt daarbij terugvertaald naar gewone svg,
 * en de kleuren worden vast ingevuld, want buiten de site is er geen currentColor.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const INKT = "#12141a";
const TURQUOISE = "#2ed4d4";

export async function leesIconen() {
  const bron = await readFile("src/components/icons-extra.tsx", "utf8");
  const kringen = [...bron.matchAll(/"(M[^"]+)"/g)].map((m) => m[1]).slice(0, 3);
  const blokken = [
    ...bron.matchAll(
      /export function (\w+)\(\{ className \}: IconProps\) \{\s*return \(\s*<Icoon className=\{className\} kring=\{(\d)\}>\s*([\s\S]*?)\s*<\/Icoon>/g,
    ),
  ];

  return blokken.map(([, naam, kring, inner]) => {
    const tekening = inner
      .replace(/strokeWidth/g, "stroke-width")
      .replace(/strokeLinecap/g, "stroke-linecap")
      .replace(/strokeLinejoin/g, "stroke-linejoin")
      .replace(/fillRule/g, "fill-rule")
      .replace(/clipRule/g, "clip-rule")
      .replace(/\{[^}]*\}/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return {
      naam,
      bestand: naam.replace(/Icon$/, "").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="none">
  <path d="${kringen[Number(kring)]}" stroke="${TURQUOISE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(4 4)" stroke="${INKT}">${tekening.replace(/stroke="currentColor"/g, "").replace(/fill="currentColor"/g, `fill="${INKT}"`)}</g>
</svg>
`,
    };
  });
}

// Alleen wegschrijven als dit bestand zelf gedraaid wordt, niet bij importeren.
if (process.argv[1]?.endsWith("iconen-export.mjs")) {
  await mkdir("assets-src/iconen", { recursive: true });
  const iconen = await leesIconen();
  for (const icoon of iconen) {
    await writeFile(`assets-src/iconen/${icoon.bestand}.svg`, icoon.svg);
    await sharp(Buffer.from(icoon.svg), { density: 1200 })
      .resize({ width: 256, height: 256, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(`assets-src/iconen/${icoon.bestand}.png`);
  }
  console.log(`${iconen.length} iconen weggeschreven naar assets-src/iconen/`);
}
