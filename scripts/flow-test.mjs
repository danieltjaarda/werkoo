/** Loopt de leadflow door en maakt onderweg screenshots. */
import { chromium } from "playwright";

const basis = process.env.URL ?? "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

await page.goto(`${basis}/`, { waitUntil: "networkidle" });

await page.getByRole("radio", { name: "Bruiloft" }).click({ force: true });
// Lokaal zijn er geen geo-headers, dus het plaatsveld begint leeg.
await page.getByPlaceholder("In welke plaats?").fill("Amsterdam");
await page.screenshot({ path: "/tmp/flow-1-gekozen.png", clip: { x: 60, y: 260, width: 620, height: 400 } });

await page.getByRole("button", { name: "Bekijk vakmensen" }).click();
await page.waitForURL("**/aanvraag**");
console.log("na zoeken:", page.url());

const plaatsCookie = (await page.context().cookies()).find((c) => c.name === "werkoo-plaats");
console.log("onthouden plaats:", plaatsCookie?.value ?? "geen");

await page.screenshot({ path: "/tmp/flow-2-aanvraag.png" });

await page.getByRole("button", { name: "Volgende" }).click();
await page.getByRole("button", { name: "Volgende" }).click();
await page.getByText("€ 750 – € 1.500").click();
await page.getByRole("button", { name: "Volgende" }).click();
await page.getByLabel("Naam").fill("Daniel Tjaarda");
await page.getByLabel("E-mailadres").fill("daniel@voorbeeld.nl");
await page.getByLabel("Telefoonnummer").fill("0612345678");
await page.screenshot({ path: "/tmp/flow-3-contact.png" });

await page.getByRole("button", { name: "Aanvraag versturen" }).click();
await page.getByText("Je aanvraag staat klaar").waitFor({ timeout: 5000 });
await page.screenshot({ path: "/tmp/flow-4-bedankt.png" });
console.log("aanvraag verstuurd");

await browser.close();
