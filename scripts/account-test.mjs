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

async function registreer({ naam, email, wachtwoord, telefoon }) {
  await page.goto(`${basis}/inloggen?modus=registreren`, { waitUntil: "networkidle" });
  await page.locator('input[name="soort"][value="particulier"]').click({ force: true });
  await page.getByLabel("Je naam").fill(naam);
  await page.getByLabel("E-mailadres").fill(email);
  if (telefoon) await page.getByLabel(/Telefoonnummer/).fill(telefoon);
  await page.getByLabel("Wachtwoord").fill(wachtwoord);
  await page.locator("#account-formulier").getByRole("button", { name: "Account maken" }).click();
  await page.waitForURL(/\/account/, { timeout: 15000 });
}

/**
 * Een vakman meldt zich aan via de wizard; het korte formulier op /inloggen is
 * alleen nog voor particulieren. De wizard zet meteen een dienst en een plaats,
 * dus het profiel is bruikbaar zodra hij klaar is.
 */
async function registreerVakman({ naam, email, bedrijf, wachtwoord, dienst = "videograaf", plaats = "Zwolle" }) {
  await page.goto(`${basis}/aanmelden/start`, { waitUntil: "networkidle" });
  await page.getByLabel("Bedrijfsnaam").fill(bedrijf);
  await page.getByRole("button", { name: "Verder" }).click();
  await page.locator("#dienst-zoek").fill(dienst);
  await page.locator("#dienst-zoek").press("ArrowDown");
  await page.locator("#dienst-zoek").press("Enter");
  await page.getByRole("list", { name: "Gekozen diensten" }).locator("li").first().waitFor({ timeout: 10000 });
  await page.locator("#plaats").fill(plaats);
  await page.getByRole("button", { name: "Verder" }).click();
  const [voor, ...rest] = naam.split(" ");
  await page.getByLabel("Voornaam").fill(voor);
  await page.getByLabel("Achternaam").fill(rest.join(" ") || "Vakman");
  await page.getByLabel("E-mailadres").fill(email);
  await page.getByLabel("Telefoonnummer").fill("0612345678");
  await page.getByLabel("Kies een wachtwoord").fill(wachtwoord);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Gratis aanmelden" }).click();
  await page.waitForURL(/\/pro/, { timeout: 25000 });
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
await registreerVakman({ ...vakman, plaats: "Amsterdam" });
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

// De wizard zette videograaf al klaar; hier komt er een tweede dienst bij,
// zodat we zien dat het kiezen in de instellingen ook echt werkt.
const dienstBlok = page.locator("form").filter({ has: page.getByPlaceholder("Zoek een dienst") });
await dienstBlok.getByPlaceholder("Zoek een dienst").fill("fotograaf");
await dienstBlok.getByText("Fotografen", { exact: true }).click();
await dienstBlok.getByRole("button", { name: /Opslaan/ }).click();
await page.getByText(/2 diensten opgeslagen/).waitFor({ timeout: 10000 });
console.log("  tweede dienst gekoppeld");
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

await logUit();

// --- 5. Wachtwoord vergeten --------------------------------------------------
stap("Wachtwoord vergeten");
await page.goto(`${basis}/inloggen`, { waitUntil: "networkidle" });
await page.getByRole("link", { name: "Wachtwoord vergeten?" }).click();
await page.waitForURL(/\/wachtwoord-vergeten/, { timeout: 15000 });
await page.getByLabel("E-mailadres").fill(klant.email);
await page.getByRole("button", { name: "Stuur me een link" }).click();
await page.getByText(/staat er binnen een paar minuten een mail/).waitFor({ timeout: 15000 });
console.log("  herstellink aangevraagd (zelfde melding voor bekend en onbekend adres)");

await page.goto(`${basis}/wachtwoord-herstellen?token=onzin`, { waitUntil: "networkidle" });
await page.getByLabel("Nieuw wachtwoord").fill("nogeenlangwachtwoord");
await page.getByRole("button", { name: "Wachtwoord opslaan" }).click();
await page.getByText(/verlopen of al gebruikt/).waitFor({ timeout: 15000 });
console.log("  onzinnig token wordt geweigerd");
await leg("8-wachtwoord");

// --- 6. Aanmeldwizard voor bedrijven ----------------------------------------
stap("Bedrijf meldt zich aan via de wizard");
await page.goto(`${basis}/aanmelden`, { waitUntil: "networkidle" });
await page.getByRole("link", { name: "Meld je bedrijf aan" }).first().click();
await page.waitForURL(/\/aanmelden\/start/, { timeout: 15000 });
await page.getByRole("button", { name: "Verder" }).click();
await page.getByText("Vul de naam van je bedrijf in").waitFor({ timeout: 5000 });
console.log("  stap 1 bewaakt lege bedrijfsnaam");
await page.getByLabel("Bedrijfsnaam").fill(`Wizard Schilders ${stempel}`);
await page.getByLabel(/KvK-nummer/).fill("1234");
await page.getByRole("button", { name: "Verder" }).click();
await page.getByText("8 cijfers").first().waitFor({ timeout: 5000 });
await page.getByLabel(/KvK-nummer/).fill("12345678");
await page.getByLabel(/Website/).fill("wizardschilders.nl");
await page.getByRole("button", { name: "Verder" }).click();
await page.getByText("Wat doe je, en waar?").waitFor({ timeout: 5000 });
console.log("  stap 1 klaar");
await page.locator("#dienst-zoek").fill("schilder");
await page.locator("#dienst-zoek").press("ArrowDown");
await page.locator("#dienst-zoek").press("Enter");
await page.getByRole("list", { name: "Gekozen diensten" }).locator("li").first().waitFor({ timeout: 5000 });
await page.locator("#plaats").fill("Zwolle");
await page.getByLabel(/Postcode/).fill("8011 AA");
await page.getByRole("button", { name: "Verder" }).click();
await page.getByText("Laatste stap").waitFor({ timeout: 5000 });
console.log("  stap 2 klaar (dienst gekozen, plaats ingevuld)");
await page.getByLabel("Voornaam").fill("Wendy");
await page.getByLabel("Achternaam").fill("Wizard");
await page.getByLabel("E-mailadres").fill(`wizard-${stempel}@voorbeeld.nl`);
await page.getByLabel("Telefoonnummer").fill("0612345678");
await page.getByLabel("Kies een wachtwoord").fill("eenlangwachtwoord");
await page.getByRole("button", { name: "Gratis aanmelden" }).click();
await page.getByText("Ga akkoord met de voorwaarden").waitFor({ timeout: 15000 });
await page.getByRole("checkbox").check();
await page.getByRole("button", { name: "Gratis aanmelden" }).click();
await page.waitForURL(/\/pro\?welkom=1/, { timeout: 20000 });
await page.getByText("Welkom bij Werkoo!").waitFor({ timeout: 10000 });
const dash = await page.locator("main").innerText();
console.log("  na aanmelden in dashboard met welkom; diensten afgevinkt:", /Diensten gekozen/.test(dash) ? "ja" : "NEE", "| werkgebied afgevinkt:", /Werkgebied ingesteld/.test(dash) ? "ja" : "NEE");
await leg("9-wizard-dashboard");
await page.goto(`${basis}/pro/instellingen`, { waitUntil: "networkidle" });
const kvk = await page.locator("#kvk").inputValue();
const web = await page.locator("#website").inputValue();
const pc = await page.locator("#postcode").inputValue();
console.log("  bewaard: kvk", kvk, "| website", web, "| postcode", pc);
if (kvk !== "12345678" || !web.includes("wizardschilders.nl") || pc !== "8011AA") throw new Error("wizardgegevens niet goed opgeslagen");

// --- 7. Werkgebied via de provinciekaart ------------------------------------
stap("Vakman zet zijn werkgebied op de kaart");
await page.goto(`${basis}/pro/instellingen`, { waitUntil: "networkidle" });
const kaart = page.locator("svg[role=group]");
await kaart.waitFor({ timeout: 10000 });
await kaart.locator("g").filter({ has: page.locator("title", { hasText: "Friesland" }) }).click();
await page.locator("#werkgebied").getByRole("checkbox", { name: "Overijssel" }).check();
await page.locator("#werkgebied").getByRole("button", { name: "Opslaan" }).click();
await page.locator("#werkgebied").getByText(/opgeslagen/).waitFor({ timeout: 15000 });
console.log("  twee provincies opgeslagen");
await page.reload({ waitUntil: "networkidle" });
const aangevinkt = await page.locator("#werkgebied input[type=checkbox]:checked").count();
console.log("  na herladen nog aangevinkt:", aangevinkt);
if (aangevinkt < 2) throw new Error("provincies niet bewaard");
await leg("10-werkgebied-kaart");

// --- 8. Chat toont echte profielen ------------------------------------------
stap("Chat noemt de vakmensen die er zijn");
const chat = await fetch(`${basis}/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ berichten: [{ role: "user", content: "Ik zoek een videograaf in Sneek, wie hebben jullie?" }] }),
});
const antwoordTekst = await chat.text();
const noemtProfiel = /\/vakman\//.test(antwoordTekst);
console.log("  linkt naar een profiel:", noemtProfiel ? "ja" : "NEE");
if (!noemtProfiel) throw new Error("chat noemt geen profielen");

console.log("\nde hele keten werkt");
await browser.close();
