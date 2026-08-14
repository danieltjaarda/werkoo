/** Loopt de hele aanvraagflow door en maakt onderweg screenshots. */
import { chromium } from "playwright";

const basis = process.env.URL ?? "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

const leg = (naam) => page.screenshot({ path: `/tmp/flow-${naam}.png` });
const vraag = () => page.locator("main h1").first().innerText();

// --- Homepage: eerst kiezen wát je zoekt, dan waar -------------------------
await page.goto(`${basis}/`, { waitUntil: "networkidle" });
await leg("0-home");

await page.getByPlaceholder("Welke vakman zoek je?").fill("videograaf");
await page.getByRole("option", { name: /Videografen/ }).click();
await page.getByPlaceholder("In welke plaats?").fill("Amsterdam");
await page.getByRole("button", { name: "Bekijk vakmensen" }).click();
await page.waitForURL(/\/videograaf\/amsterdam/);
// De overgang is client-side. Het formulier staat er dan al wel, maar React heeft
// zijn handlers nog niet gekoppeld: te vroeg klikken vinkt de radio wel aan zonder
// dat de state meegaat, en dan blijft het formulier op de validatiefout hangen.
await page.waitForLoadState("networkidle");
await page.getByRole("radio", { name: "Bruiloft" }).waitFor();
await page.waitForTimeout(800);
console.log("vanaf de homepage:", page.url());

const plaatsCookie = (await page.context().cookies()).find((c) => c.name === "werkoo-plaats");
console.log("onthouden plaats:", plaatsCookie?.value ?? "geen");

// --- Dienstpagina: waarvoor, en door naar de aanvraag ----------------------
await page.getByRole("radio", { name: "Bruiloft" }).click({ force: true });
await page.getByRole("button", { name: "Bekijk vakmensen" }).click();
await page.waitForURL(/\/aanvraag\?/);
await page.waitForLoadState("networkidle");
console.log("na zoeken:", page.url());

const verder = async (naam) => {
  await leg(naam);
  console.log("vraag:", (await vraag()).replace(/\n/g, " "));
  await page
    .getByRole("button", { name: /Volgende vraag|Overslaan|Verstuur aanvraag|Verder/ })
    .click();
  await page.waitForTimeout(700);
};

await verder("1-plaats");
await page.getByText("Bruiloft", { exact: true }).click();
await verder("2-waarvoor");

// Kalender: de eerste dag die niet is doorgestreept.
const vrijeDag = page.locator("main button:not([disabled])").filter({ hasText: /^\d{1,2}$/ }).first();
await vrijeDag.click();
await verder("3-datum");

await page.getByPlaceholder("Nog geen locatie ingevuld").fill("Damrak 1, Amsterdam");
await page.waitForTimeout(1200);
await verder("4-adres");

await page.locator("main textarea").fill("Bruiloft met ongeveer 80 gasten, we willen een korte film van de dag.");
await verder("5-wensen");

// De vakmensen staan voorgevinkt; "Toon meer" klapt de rest van de lijst uit.
const voorgevinkt = await page.locator("main input[type=checkbox]:checked").count();
console.log("voorgevinkte vakmensen:", voorgevinkt);
const toonMeer = page.getByRole("button", { name: /Toon \d+ meer/ });
if (await toonMeer.count()) {
  await toonMeer.click();
  console.log("na Toon meer:", await page.locator("main input[type=checkbox]").count(), "kaarten");
}
await verder("6-vakmensen");

await page.getByLabel("E-mailadres").fill("daniel@voorbeeld.nl");
await verder("7-email");

await page.getByLabel("Naam").fill("Daniel Tjaarda");
await verder("8-naam");

await page.getByLabel("Telefoonnummer").fill("0612345678");
await page.getByText("updates sturen via WhatsApp").click();
await verder("9-telefoon");

await page.getByText("Je aanvraag is verstuurd").waitFor({ timeout: 8000 });
await leg("10-klaar");
console.log("aanvraag verstuurd");

// Zonder account biedt het slotscherm aan er een te maken.
await page.getByRole("link", { name: "Account maken" }).waitFor({ timeout: 5000 });
await leg("11-account");
console.log("slotscherm biedt een account aan");

// --- Dienst zonder profielen: de vakmensenstap hoort weg te vallen ---------
await page.goto(`${basis}/aanvraag?dienst=dakdekker&plaats=Zwolle`, { waitUntil: "networkidle" });
const stappenZonderKeuze = [];
for (let i = 0; i < 8; i++) {
  stappenZonderKeuze.push((await vraag()).replace(/\n/g, " "));
  if (i === 0) await page.getByPlaceholder("Plaats").fill("Zwolle");
  if (i === 1) await page.locator("main label").first().click();
  if (i === 5) await page.getByLabel("E-mailadres").fill("daniel@voorbeeld.nl");
  if (i === 6) await page.getByLabel("Naam").fill("Daniel Tjaarda");
  if (i === 7) await page.getByLabel("Telefoonnummer").fill("0612345678");
  await page.getByRole("button", { name: /Volgende vraag|Overslaan|Verder|Verstuur aanvraag/ }).click();
  await page.waitForTimeout(650);
}
const heeftVakmanvraag = stappenZonderKeuze.some((k) => k.includes("Beschikbare"));
console.log(`dakdekker: ${stappenZonderKeuze.length} vragen, vakmensenstap ${heeftVakmanvraag ? "AANWEZIG (fout)" : "overgeslagen"}`);

// Zonder gekozen vakmensen moet de aanvraag alsnog door de api komen.
await page.getByText("Je aanvraag is verstuurd").waitFor({ timeout: 8000 });
await leg("12-dakdekker-verstuurd");
console.log("aanvraag zonder vakmanselectie verstuurd");

// --- Inloggen --------------------------------------------------------------
await page.goto(`${basis}/inloggen`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Account maken" }).first().click();
await page.getByText("Ik ben vakman").waitFor({ timeout: 5000 });
await leg("13-inloggen");
console.log("inlogpagina werkt");

await browser.close();
