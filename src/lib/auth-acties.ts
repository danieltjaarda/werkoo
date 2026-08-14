"use server";

import { redirect } from "next/navigation";
import {
  beeindigSessie,
  hashWachtwoord,
  klopWachtwoord,
  maakSessie,
  type Gebruiker,
} from "@/lib/auth";
import { vraag, vraagEen } from "@/lib/db";
import { slugVanPlaatsnaam } from "@/lib/plaatsen";

export type Uitkomst = { fout?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Zo kort mag een wachtwoord niet zijn; langer is beter dan ingewikkelder. */
const MIN_LENGTE = 8;

function tekst(data: FormData, veld: string): string {
  const waarde = data.get(veld);
  return typeof waarde === "string" ? waarde.trim() : "";
}

/** Alleen paden binnen de site, zodat `?verder=` niemand naar buiten stuurt. */
function veiligPad(ruw: string, standaard: string): string {
  return ruw.startsWith("/") && !ruw.startsWith("//") ? ruw : standaard;
}

/** "Studio Noordlicht" -> "studio-noordlicht", met een cijfer erachter als het al bestaat. */
async function vrijeSlug(naam: string): Promise<string> {
  const basis = slugVanPlaatsnaam(naam) || "bedrijf";
  let kandidaat = basis;

  for (let poging = 2; poging < 100; poging++) {
    const bezet = await vraagEen("select 1 from bedrijven where slug = $1", [kandidaat]);
    if (!bezet) return kandidaat;
    kandidaat = `${basis}-${poging}`;
  }

  return `${basis}-${Date.now().toString(36)}`;
}

/**
 * Aanvragen die eerder zonder account zijn gedaan horen alsnog in het dashboard
 * te verschijnen zodra iemand zich met datzelfde adres registreert.
 */
async function koppelEerdereAanvragen(gebruiker: Gebruiker): Promise<void> {
  await vraag(
    "update aanvragen set gebruiker_id = $1 where gebruiker_id is null and lower(email) = $2",
    [gebruiker.id, gebruiker.email],
  );
}

export async function registreren(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const email = tekst(data, "email").toLowerCase();
  const wachtwoord = tekst(data, "wachtwoord");
  const naam = tekst(data, "naam");
  const telefoon = tekst(data, "telefoon");
  const soort = tekst(data, "soort") === "bedrijf" ? "bedrijf" : "particulier";
  const bedrijfsnaam = tekst(data, "bedrijfsnaam");
  const verder = veiligPad(tekst(data, "verder"), soort === "bedrijf" ? "/pro" : "/account");

  if (!naam) return { fout: "Vul je naam in." };
  if (!EMAIL.test(email)) return { fout: "Vul een geldig e-mailadres in." };
  if (wachtwoord.length < MIN_LENGTE) {
    return { fout: `Kies een wachtwoord van minstens ${MIN_LENGTE} tekens.` };
  }
  if (soort === "bedrijf" && !bedrijfsnaam) return { fout: "Vul de naam van je bedrijf in." };

  const bestaat = await vraagEen("select 1 from gebruikers where email = $1", [email]);
  if (bestaat) return { fout: "Er is al een account met dit e-mailadres. Log in of gebruik een ander adres." };

  const hash = await hashWachtwoord(wachtwoord);
  const gebruiker = await vraagEen<Gebruiker>(
    `insert into gebruikers (email, wachtwoord_hash, naam, telefoon, soort)
     values ($1, $2, $3, $4, $5)
     returning id, email, naam, telefoon, soort`,
    [email, hash, naam, telefoon, soort],
  );

  if (!gebruiker) return { fout: "Het account kon niet worden aangemaakt. Probeer het opnieuw." };

  if (soort === "bedrijf") {
    await vraagEen(
      "insert into bedrijven (gebruiker_id, naam, slug, telefoon) values ($1, $2, $3, $4)",
      [gebruiker.id, bedrijfsnaam, await vrijeSlug(bedrijfsnaam), telefoon],
    );
  }

  await koppelEerdereAanvragen(gebruiker);
  await maakSessie(gebruiker.id);
  redirect(verder);
}

export async function inloggen(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const email = tekst(data, "email").toLowerCase();
  const wachtwoord = tekst(data, "wachtwoord");
  const verder = tekst(data, "verder");

  if (!EMAIL.test(email) || !wachtwoord) {
    return { fout: "Vul je e-mailadres en wachtwoord in." };
  }

  const rij = await vraagEen<Gebruiker & { wachtwoord_hash: string }>(
    "select id, email, naam, telefoon, soort, wachtwoord_hash from gebruikers where email = $1",
    [email],
  );

  // Bewust dezelfde melding voor een onbekend adres en een verkeerd wachtwoord:
  // anders kun je met het formulier uitvragen wie er een account heeft.
  const misgelopen = { fout: "Dat e-mailadres en wachtwoord horen niet bij elkaar." };
  if (!rij) return misgelopen;
  if (!(await klopWachtwoord(wachtwoord, rij.wachtwoord_hash))) return misgelopen;

  await maakSessie(rij.id);
  redirect(veiligPad(verder, rij.soort === "bedrijf" ? "/pro" : "/account"));
}

export async function uitloggen(): Promise<void> {
  await beeindigSessie();
  redirect("/");
}
