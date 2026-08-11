/**
 * Maakt screenshots van een pagina op een of meer breedtes.
 * Voorbeeld: node scripts/screenshot.mjs / hero 1440x900
 */
import { chromium } from "playwright";

const basis = process.env.URL ?? "http://localhost:3000";
const [pad = "/", naam = "shot", ...formaten] = process.argv.slice(2);
const maten = (formaten.length ? formaten : ["1440x900"]).map((formaat) => {
  const [breedte, hoogte] = formaat.split("x").map(Number);
  return { breedte, hoogte: hoogte || 0 };
});

const browser = await chromium.launch();

for (const { breedte, hoogte } of maten) {
  const page = await browser.newPage({
    viewport: { width: breedte, height: hoogte || 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(`${basis}${pad}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const bestand = `/tmp/${naam}-${breedte}.png`;
  await page.screenshot({ path: bestand, fullPage: hoogte === 0 });
  console.log(bestand);
  await page.close();
}

await browser.close();
