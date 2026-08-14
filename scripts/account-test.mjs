/**
 * Loopt de hele keten door in een echte browser: een vakman meldt zich aan en
 * zet zijn profiel open, een klant doet een aanvraag, de vakman ziet hem en
 * reageert, en de klant ziet die reactie terug in zijn eigen overzicht.
 *
 * Draait tegen de database die in .env.local staat en laat twee accounts achter.
 */
import { chromium } from "playwright";

const basis = process.env.URL ?? "http://localhost:3000";
const stempel = Date.now().toString(36);

const vakman = {
  naam: "Sander Bakker",
  bedrijf: `Bakker Film ${stempel}`,
  email: `vakman-${stempel}@voorbeeld.nl`,
  wachtwoord: "eenlangwachtwoord",
};
const klant = {
  naam: "Nora Jansen",
  email: `klant-${stempel}@voorbeeld.nl`,
  wachtwoord: "eenlangwachtwoord",
  telefoon: "0612345678",
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const leg = (naam) => page.screenshot({ path: `/tmp/account-${naam}.png` });

function stap(tekst) {
  console.log(`\n— ${tekst}`);
}

async function registreer({ naam, email, wachtwoord, bedrijf, telefoon }) {
  await page.goto(`${basis}/inloggen?modus=registreren`, { waitUntil: "networkidle" });
  await page.locator(`input[name="soort"][value="${bedrijf ? "bedrijf" : "particulier"}"]`).click({ force: true });
  await page.getByLabel("Je naam").fill(naam);
  if (bedrijf) await page.getByLabel("Naam van je bedrijf").fill(bedrijf);
  await page.getByLabel("E-mailadres").fill(email);
  if (telefoon) await page.getByLabel(/Telefoonnummer/).fill(telefoon);
  await page.getByLabel("Wachtwoord").fill(wachtwoord);
  await page.locator("#account-formulier").getByRole("button", { name: "Account maken" }).click();
  await page.waitForURL(/\/(pro|account)/, { timeout: 15000 });
}

async function logUit() {
  await page.getByRole("button", { name: "Uitloggen" }).click();
  await page.waitForURL(`${basis}/`, { timeout: 15000 });
}

async function logIn(email, wachtwoord) {
  await page.goto(`${basis}/inloggen`, { waitUntil: "networkidle" });
  await page.getByLabel("E-mailadres").fill(email);
  await page.getByLabel("Wachtwoord").fill(wachtwoord);
  await page.locator("form").getByRole("button", { name: "Inloggen" }).click();
  await page.waitForURL(/\/(pro|account)/, { timeout: 15000 });
}

// --- 1. Vakman meldt zich aan ------------------------------------------------
stap("Vakman registreert");
await registreer(vakman);
console.log("  na registratie:", page.url());
await leg("1-pro-leeg");

stap("Vakman zet diensten, werkgebied en zichtbaarheid");
await page.goto(`${basis}/pro/instellingen`, { waitUntil: "networkidle" });
await page.getByLabel("Vestigingsplaats").fill("Amsterdam");
await page.getByLabel("Telefoonnummer").fill("020 1234567");
await page.getByLabel("Korte belofte").fill("snel en scherp");
await page.getByLabel("Mijn profiel is zichtbaar").check();
await page.locator('form:has(#naam) button[type=submit]').click();
await page.getByText("Je profiel is opgeslagen").waitFor({ timeout: 10000 });
console.log("  profiel opgeslagen");

const dienstBlok = page.locator("form").filter({ has: page.getByPlaceholder("Zoek een dienst") });
await dienstBlok.getByPlaceholder("Zoek een dienst").fill("videograaf");
await dienstBlok.getByText("Videografen", { exact: true }).click();
await dienstBlok.getByRole("button", { name: /Opslaan/ }).click();
await page.getByText(/1 dienst opgeslagen/).waitFor({ timeout: 10000 });
console.log("  dienst gekoppeld");
await leg("2-instellingen");

await logUit();

// --- 2. Klant doet een aanvraag ---------------------------------------------
stap("Klant registreert");
await registreer(klant);
console.log("  na registratie:", page.url());

stap("Klant doet een aanvraag");
await page.goto(`${basis}/aanvraag?dienst=videograaf&plaats=Amsterdam`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const verder = async () => {
  await page.getByRole("button", { name: /Volgende vraag|Overslaan|Verstuur aanvraag|Verder/ }).click();
  await page.waitForTimeout(700);
};

await verder(); // plaats staat al voorgevuld
await page.getByText("Bruiloft", { exact: true }).click();
await verder();
await verder(); // datum overslaan
await verder(); // adres overslaan
await page.locator("main textarea").fill("Bruiloft in juni, ongeveer 90 gasten, we willen een korte film.");
await verder();

// De standaardkeuze pakt de bovenste twee; wij willen zeker weten dat de vakman
// uit deze testronde hem krijgt, dus die vinken we er expliciet bij aan.
const gekozen = await page.locator("main input[type=checkbox]:checked").count();
console.log("  voorgevinkte vakmensen:", gekozen);
const toonMeer = page.getByRole("button", { name: /Toon \d+ meer/ });
if (await toonMeer.count()) await toonMeer.click();
const eigenKaart = page.locator("main label").filter({ hasText: vakman.bedrijf });
if (await eigenKaart.count()) {
  const vinkje = eigenKaart.first().locator("input[type=checkbox]");
  if (!(await vinkje.isChecked())) await eigenKaart.first().click();
  console.log("  eigen vakman aangevinkt");
} else {
  throw new Error(`${vakman.bedrijf} staat niet in de keuzelijst`);
}
await verder(); // vakmensen
await verder(); // e-mail staat voorgevuld
await verder(); // naam staat voorgevuld
await verder(); // telefoon staat voorgevuld

await page.getByText("Je aanvraag is verstuurd").waitFor({ timeout: 15000 });
const referentie = (await page.locator("main").innerText()).match(/WK-[A-Z0-9]+/)?.[0];
console.log("  referentie:", referentie);
await leg("3-verstuurd");

stap("Klant ziet de aanvraag in zijn overzicht");
await page.goto(`${basis}/account`, { waitUntil: "networkidle" });
await page.getByText(referentie).waitFor({ timeout: 10000 });
console.log("  staat in /account");
await leg("4-account");

await logUit();

// --- 3. Vakman ziet de aanvraag en reageert ---------------------------------
stap("Vakman logt in en ziet de aanvraag");
await logIn(vakman.email, vakman.wachtwoord);
await page.goto(`${basis}/pro/aanvragen`, { waitUntil: "networkidle" });
await page.getByText(klant.naam).first().waitFor({ timeout: 10000 });
console.log("  aanvraag zichtbaar bij de vakman");
await leg("5-pro-aanvragen");

await page.getByText(klant.naam).first().click();
await page.waitForURL(/\/pro\/aanvragen\//, { timeout: 10000 });
await page.getByLabel("Je bericht").fill(
  "Dag Nora, een bruiloft in juni kan ik goed doen. Ik film met twee camera's en lever binnen drie weken.",
);
await page.getByLabel(/Prijsindicatie/).fill("€ 1.400 tot € 1.800");
await page.getByRole("button", { name: /Verstuur reactie/ }).click();
await page.getByText("Je reactie is verstuurd").waitFor({ timeout: 15000 });
console.log("  reactie verstuurd");
await leg("6-pro-reactie");

await logUit();

// --- 4. Klant ziet de reactie terug -----------------------------------------
stap("Klant ziet de reactie");
await logIn(klant.email, klant.wachtwoord);
await page.goto(`${basis}/account/${referentie}`, { waitUntil: "networkidle" });
await page.getByText("€ 1.400 tot € 1.800").waitFor({ timeout: 10000 });
console.log("  reactie zichtbaar, inclusief prijsindicatie");
await leg("7-klant-reactie");

const tekst = await page.locator("main").innerText();
console.log("  bedrijf in beeld:", tekst.includes(vakman.bedrijf) ? "ja" : "NEE");

console.log("\nde hele keten werkt");
await browser.close();
