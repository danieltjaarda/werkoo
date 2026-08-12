/** Loopt de hele aanvraagflow door en maakt onderweg screenshots. */
import { chromium } from "playwright";

const basis = process.env.URL ?? "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

const leg = (naam) => page.screenshot({ path: `/tmp/flow-${naam}.png` });
const vraag = () => page.locator("main h1").first().innerText();

await page.goto(`${basis}/`, { waitUntil: "networkidle" });

await page.getByRole("radio", { name: "Bruiloft" }).click({ force: true });
// Lokaal zijn er geen geo-headers, dus het plaatsveld begint leeg.
await page.getByPlaceholder("In welke plaats?").fill("Amsterdam");
await page.getByRole("button", { name: "Bekijk vakmensen" }).click();
await page.waitForURL("**/aanvraag**");
console.log("na zoeken:", page.url());

const plaatsCookie = (await page.context().cookies()).find((c) => c.name === "werkoo-plaats");
console.log("onthouden plaats:", plaatsCookie?.value ?? "geen");

const verder = async (naam) => {
  await leg(naam);
  console.log("vraag:", (await vraag()).replace(/\n/g, " "));
  await page.getByRole("button", { name: /Volgende vraag|Overslaan|Verstuur aanvraag/ }).click();
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

await page.getByLabel("E-mailadres").fill("daniel@voorbeeld.nl");
await verder("6-email");

await page.getByLabel("Naam").fill("Daniel Tjaarda");
await verder("7-naam");

await page.getByLabel("Telefoonnummer").fill("0612345678");
await page.getByText("updates sturen via WhatsApp").click();
await verder("8-telefoon");

await page.getByText("Je aanvraag is verstuurd").waitFor({ timeout: 8000 });
await leg("9-klaar");
console.log("aanvraag verstuurd");

await page.getByRole("button", { name: /Doorgaan met/ }).last().click();
await page.getByText("Kijk in je mail").waitFor({ timeout: 5000 });
await leg("10-account");
console.log("accountkeuze werkt");

await page.goto(`${basis}/inloggen`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Bedrijf" }).click();
await page.getByText("Inloggen als bedrijf").waitFor({ timeout: 5000 });
await leg("11-inloggen");
console.log("inlogpagina werkt");

await browser.close();
