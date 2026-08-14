/**
 * Vaste controle op de fouten die uit de testronde van 14 augustus 2026 kwamen.
 * Elk geval hieronder is een keer echt misgegaan, dus dit script hoort te blijven
 * draaien voordat er iets naar productie gaat.
 */
import { chromium } from "playwright";

const basis = process.env.URL ?? "http://localhost:3000";
const stempel = Date.now().toString(36);
const WW = "eenlangwachtwoord";

let mislukt = 0;
function meld(goed, wat, uitleg = "") {
  if (!goed) mislukt += 1;
  console.log(`${goed ? "ok  " : "FOUT"} ${wat}${uitleg ? ` — ${uitleg}` : ""}`);
}

const browser = await chromium.launch();

async function versePagina() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  return context.newPage();
}

async function registreer(page, { naam, email, bedrijf }) {
  await page.goto(`${basis}/inloggen?modus=registreren`, { waitUntil: "networkidle" });
  await page.locator(`input[name="soort"][value="${bedrijf ? "bedrijf" : "particulier"}"]`).click({ force: true });
  await page.getByLabel("Je naam").fill(naam);
  if (bedrijf) await page.getByLabel("Naam van je bedrijf").fill(bedrijf);
  await page.getByLabel("E-mailadres").fill(email);
  await page.getByLabel("Wachtwoord").fill(WW);
  await page.locator("#account-formulier").getByRole("button", { name: "Account maken" }).click();
  await page.waitForURL(/\/(pro|account)/, { timeout: 20000 });
}

async function aanvraag(velden) {
  const antwoord = await fetch(`${basis}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ vakmensen: [], datum: "", adres: "", wensen: "", whatsapp: false, ...velden }),
  });
  return { status: antwoord.status, body: await antwoord.json().catch(() => ({})) };
}

// --- 1. Registreren op andermans adres mag zijn aanvragen NIET opleveren -----
{
  const slachtoffer = `sec-${stempel}-slachtoffer@test.nl`;
  const gemaakt = await aanvraag({
    dienst: "videograaf",
    type: "bruiloft",
    plaats: "Amsterdam",
    adres: "Keizersgracht 100, Amsterdam",
    wensen: "PRIVE",
    naam: "Slachtoffer",
    email: slachtoffer,
    telefoon: "0612340001",
  });

  const page = await versePagina();
  await registreer(page, { naam: "Aanvaller", email: slachtoffer });
  const tekst = await page.locator("main").innerText();

  meld(
    !tekst.includes(gemaakt.body.referentie) && !tekst.includes("PRIVE"),
    "registreren op andermans adres geeft geen inzage in zijn aanvragen",
    tekst.includes("PRIVE") ? "de aanvraag van het slachtoffer is zichtbaar" : "",
  );
  await page.context().close();
}

// --- 2. Een aanvraag met het adres van een bestaand account komt daar wél ----
{
  const eigen = `sec-${stempel}-eigen@test.nl`;
  const page = await versePagina();
  await registreer(page, { naam: "Eigen Klant", email: eigen });

  const gemaakt = await aanvraag({
    dienst: "videograaf",
    type: "bruiloft",
    plaats: "Amsterdam",
    naam: "Eigen Klant",
    email: eigen,
    telefoon: "0612340002",
  });

  await page.goto(`${basis}/account`, { waitUntil: "networkidle" });
  meld(
    (await page.locator("main").innerText()).includes(gemaakt.body.referentie),
    "een nieuwe aanvraag hangt zichzelf aan een bestaand account",
  );
  await page.context().close();
}

// --- 3. ?verder= mag nergens buiten de site uitkomen -------------------------
{
  const email = `sec-${stempel}-redirect@test.nl`;
  const page = await versePagina();
  await registreer(page, { naam: "Redirect Test", email });
  await page.getByRole("button", { name: "Uitloggen" }).click();
  await page.waitForURL(`${basis}/`, { timeout: 15000 });

  for (const poging of ["//evil.example.com", "/\\evil.example.com", "/..//evil.example.com", "https://evil.example.com"]) {
    await page.goto(`${basis}/inloggen?verder=${encodeURIComponent(poging)}`, { waitUntil: "networkidle" });
    await page.getByLabel("E-mailadres").fill(email);
    await page.getByLabel("Wachtwoord").fill(WW);
    await page.locator("form").getByRole("button", { name: "Inloggen" }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/inloggen"), { timeout: 15000 });
    meld(page.url().startsWith(basis), `?verder=${poging} blijft binnen de site`, page.url());
    await page.getByRole("button", { name: "Uitloggen" }).click();
    await page.waitForURL(`${basis}/`, { timeout: 15000 });
  }
  await page.context().close();
}

// --- 4. Inloggen wordt afgeremd na een reeks missers ------------------------
{
  const email = `sec-${stempel}-rem@test.nl`;
  const page = await versePagina();
  await registreer(page, { naam: "Rem Test", email });
  await page.getByRole("button", { name: "Uitloggen" }).click();
  await page.waitForURL(`${basis}/`, { timeout: 15000 });

  let afgeremd = false;
  for (let poging = 1; poging <= 7; poging++) {
    await page.goto(`${basis}/inloggen`, { waitUntil: "networkidle" });
    await page.getByLabel("E-mailadres").fill(email);
    await page.getByLabel("Wachtwoord").fill(`fout${poging}`);
    await page.locator("form").getByRole("button", { name: "Inloggen" }).click();
    const melding = page.locator("[role=alert]").filter({ hasText: /\S/ }).first();
    await melding.waitFor({ timeout: 15000 });
    if ((await melding.innerText()).includes("Te veel mislukte pogingen")) {
      afgeremd = true;
      break;
    }
  }
  meld(afgeremd, "inloggen wordt afgeremd na een reeks mislukte pogingen");
  await page.context().close();
}

// --- 5. Een aanvraag-id dat geen uuid is geeft 404, geen serverfout ---------
{
  const email = `sec-${stempel}-uuid@test.nl`;
  const page = await versePagina();
  await registreer(page, { naam: "Uuid Test", email, bedrijf: `Sec Uuid ${stempel}` });
  const antwoord = await page.request.get(`${basis}/pro/aanvragen/geen-uuid`);
  meld(antwoord.status() === 404, "een onzinnig aanvraag-id geeft 404", `kreeg ${antwoord.status()}`);
  await page.context().close();
}

// --- 6. Het werkgebied blijft overeind, ook bij zelf gekozen bedrijven ------
{
  const email = `sec-${stempel}-gebied@test.nl`;
  const bedrijfsnaam = `Sec Gebied ${stempel}`;
  const page = await versePagina();
  await registreer(page, { naam: "Gebied Test", email, bedrijf: bedrijfsnaam });

  await page.goto(`${basis}/pro/instellingen`, { waitUntil: "networkidle" });
  await page.getByLabel("Mijn profiel is zichtbaar").check();
  await page.locator("form:has(#naam) button[type=submit]").click();
  await page.getByText("Je profiel is opgeslagen").waitFor({ timeout: 15000 });

  const dienstBlok = page.locator("form").filter({ has: page.getByPlaceholder("Zoek een dienst") });
  await dienstBlok.getByPlaceholder("Zoek een dienst").fill("videograaf");
  await dienstBlok.getByText("Videografen", { exact: true }).click();
  await dienstBlok.getByRole("button", { name: /Opslaan/ }).click();
  await page.getByText(/1 dienst opgeslagen/).waitFor({ timeout: 15000 });

  // Werkgebied: alleen Zwolle.
  const gebiedBlok = page.locator("section").filter({ hasText: "Je werkgebied" }).locator("form");
  await gebiedBlok.locator("label").filter({ hasText: /^Zwolle$/ }).click();
  await gebiedBlok.getByRole("button", { name: /Opslaan/ }).click();
  await page.getByText(/1 plaats opgeslagen/).waitFor({ timeout: 15000 });

  const inZwolle = (await (await fetch(`${basis}/videograaf/zwolle`)).text()).includes(bedrijfsnaam);
  meld(inZwolle, "een bedrijf met werkgebied Zwolle staat op de Zwolse pagina");

  const inAmsterdam = (await (await fetch(`${basis}/videograaf/amsterdam`)).text()).includes(bedrijfsnaam);
  meld(!inAmsterdam, "datzelfde bedrijf staat NIET op de Amsterdamse pagina");

  // En het werkgebied moet ook standhouden als de bezoeker het bedrijf zelf aanvinkt.
  const buitenGebied = await aanvraag({
    dienst: "videograaf",
    type: "bruiloft",
    plaats: "Amsterdam",
    naam: "Buiten Gebied",
    email: `sec-${stempel}-buiten@test.nl`,
    telefoon: "0612340003",
    vakmensen: [bedrijfsnaam.toLowerCase().replace(/\s+/g, "-")],
  });
  meld(
    buitenGebied.body.ontvangers === 0,
    "een zelf aangevinkt bedrijf buiten zijn werkgebied krijgt de aanvraag niet",
    `ontvangers: ${buitenGebied.body.ontvangers}`,
  );
  await page.context().close();
}

// --- 7. Onzinnige invoer wordt geweigerd ------------------------------------
{
  const gevallen = [
    [{ dienst: "bestaat-niet", type: "bruiloft", plaats: "Zwolle", naam: "X", email: "a@b.nl", telefoon: "0612345678" }, 422, "onbekende dienst"],
    [{ dienst: "videograaf", type: "bestaat-niet", plaats: "Zwolle", naam: "X", email: "a@b.nl", telefoon: "0612345678" }, 422, "keuze die niet bij de dienst hoort"],
    [{ dienst: "videograaf", type: "bruiloft", plaats: "<script>x</script>", naam: "X", email: "a@b.nl", telefoon: "0612345678" }, 422, "onzin als plaatsnaam"],
  ];
  for (const [velden, verwacht, wat] of gevallen) {
    const { status } = await aanvraag(velden);
    meld(status === verwacht, `${wat} wordt geweigerd`, `kreeg ${status}`);
  }

  // Een onmogelijke datum hoort stil te sneuvelen, niet als "Invalid Date" door te rollen.
  const metRotDatum = await aanvraag({
    dienst: "videograaf",
    type: "bruiloft",
    plaats: "Zwolle",
    naam: "Datum Test",
    email: `sec-${stempel}-datum@test.nl`,
    telefoon: "0612345678",
    datum: "2026-13-45, 2026-09-10",
  });
  meld(metRotDatum.status === 201, "een aanvraag met één rotte datum komt er wel door");
}

console.log(mislukt === 0 ? "\nalles goed" : `\n${mislukt} controle(s) mislukt`);
await browser.close();
process.exit(mislukt === 0 ? 0 : 1);
