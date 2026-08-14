"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import {
  beeindigSessie,
  hashWachtwoord,
  klopWachtwoord,
  maakSessie,
  type Gebruiker,
} from "@/lib/auth";
import { metTransactie, vraag, vraagEen } from "@/lib/db";
import { slugVanPlaatsnaam } from "@/lib/plaatsen";

export type Uitkomst = { fout?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Zo kort mag een wachtwoord niet zijn; langer is beter dan ingewikkelder. */
const MIN_LENGTE = 8;

/** Vanaf zoveel missers op één adres gaan we afremmen. */
const VRIJE_POGINGEN = 5;

/** Hoe lang het slot duurt nadat de teller vol is. */
const SLOT_MINUTEN = 15;

/**
 * Een echte scrypt-hash van een wachtwoord dat niemand heeft. Bij een onbekend
 * e-mailadres rekenen we hiertegen, zodat inloggen even lang duurt als bij een
 * bestaand adres. Zonder dat verraadt de reactietijd wie er een account heeft:
 * gemeten was dat 3 ms tegen 22 ms.
 */
const SCHIJNHASH =
  "scrypt$16384$8$1$00000000000000000000000000000000$" + "0".repeat(128);

function tekst(data: FormData, veld: string): string {
  const waarde = data.get(veld);
  return typeof waarde === "string" ? waarde.trim() : "";
}

/**
 * Alleen paden binnen de site, zodat `?verder=` niemand naar buiten stuurt.
 * Een controle op "begint met / maar niet met //" is niet genoeg: een browser
 * leest `/\evil.nl` als `//evil.nl` en `/..//evil.nl` lost daar ook naartoe op.
 * Daarom lossen we het pad eerst op tegen een verzonnen oorsprong en kijken we
 * of we daar ook echt uitkomen.
 */
function veiligPad(ruw: string, standaard: string): string {
  if (!ruw.startsWith("/")) return standaard;

  try {
    const doel = new URL(ruw, "http://werkoo.invalid");
    if (doel.origin !== "http://werkoo.invalid" || doel.pathname.startsWith("//")) return standaard;
    return `${doel.pathname}${doel.search}`;
  } catch {
    return standaard;
  }
}

/**
 * "Studio Noordlicht" -> "studio-noordlicht". De aanroeper plakt er een korte
 * willekeurige staart achter; een select-dan-insert zou tussen die twee stappen
 * kunnen botsen met een gelijktijdige aanmelding.
 */
function basisSlug(naam: string): string {
  return slugVanPlaatsnaam(naam) || "bedrijf";
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

  /**
   * Gebruiker en bedrijfsprofiel in één transactie. Losse inserts leverden bij
   * gelijktijdige aanmeldingen met dezelfde bedrijfsnaam accounts op zonder
   * profiel, en daar kwam je daarna niet meer uit. De unieke index op de slug
   * kan nog steeds botsen, dus daar proberen we het een paar keer opnieuw.
   */
  let gebruiker: Gebruiker | undefined;

  for (let poging = 0; poging < 5; poging++) {
    try {
      gebruiker = await metTransactie(async (client) => {
        const { rows } = await client.query<Gebruiker>(
          `insert into gebruikers (email, wachtwoord_hash, naam, telefoon, soort)
           values ($1, $2, $3, $4, $5)
           returning id, email, naam, telefoon, soort`,
          [email, hash, naam, telefoon, soort],
        );
        const nieuw = rows[0];

        if (nieuw && soort === "bedrijf") {
          await client.query(
            "insert into bedrijven (gebruiker_id, naam, slug, telefoon) values ($1, $2, $3, $4)",
            [nieuw.id, bedrijfsnaam, `${basisSlug(bedrijfsnaam)}-${randomBytes(2).toString("hex")}`, telefoon],
          );
        }

        return nieuw;
      });
      break;
    } catch (fout) {
      // 23505 is de unieke-sleutelschending van Postgres.
      const code = typeof fout === "object" && fout !== null && "code" in fout ? fout.code : undefined;
      if (code !== "23505") throw fout;

      // Botste het op het e-mailadres, dan heeft opnieuw proberen geen zin.
      const bezet = await vraagEen("select 1 from gebruikers where email = $1", [email]);
      if (bezet) {
        return { fout: "Er is al een account met dit e-mailadres. Log in of gebruik een ander adres." };
      }
    }
  }

  if (!gebruiker) return { fout: "Het account kon niet worden aangemaakt. Probeer het opnieuw." };

  /**
   * We koppelen hier bewust GEEN eerdere aanvragen op e-mailadres. Dat lijkt
   * behulpzaam, maar zonder bevestigingsmail kan iedereen die jouw adres kent een
   * account op dat adres maken, en die krijgt dan jouw naam, telefoonnummer,
   * huisadres en klusomschrijving te zien. Andersom mag het wel, en dat gebeurt
   * in `bewaarAanvraag`: een nieuwe aanvraag met het adres van een bestaand
   * account hangt zichzelf aan dat account. Aanvragen van vóór de registratie
   * blijven los tot er e-mailverificatie is.
   */
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

  // Te vaak misgeslagen op dit adres? Dan eerst even wachten.
  const poging = await vraagEen<{ aantal: number; wachten: number }>(
    `select aantal,
            greatest(0, ceil(extract(epoch from (laatste_op + ($2 || ' minutes')::interval - now())) / 60))::int as wachten
       from inlogpogingen where email = $1`,
    [email, SLOT_MINUTEN],
  );

  if (poging && poging.aantal >= VRIJE_POGINGEN && poging.wachten > 0) {
    return {
      fout: `Te veel mislukte pogingen. Probeer het over ${poging.wachten} ${poging.wachten === 1 ? "minuut" : "minuten"} opnieuw.`,
    };
  }

  const rij = await vraagEen<Gebruiker & { wachtwoord_hash: string }>(
    "select id, email, naam, telefoon, soort, wachtwoord_hash from gebruikers where email = $1",
    [email],
  );

  /**
   * Ook bij een onbekend adres rekenen we een hash uit. Anders is een onbekend
   * adres meetbaar sneller klaar dan een bestaand adres en kun je met het
   * formulier uitvragen wie er een account heeft. Om dezelfde reden krijgen
   * beide gevallen dezelfde melding.
   */
  const klopt = await klopWachtwoord(wachtwoord, rij?.wachtwoord_hash ?? SCHIJNHASH);

  if (!rij || !klopt) {
    await vraag(
      `insert into inlogpogingen (email, aantal, laatste_op) values ($1, 1, now())
       on conflict (email) do update set
         aantal = case
           when inlogpogingen.laatste_op < now() - ($2 || ' minutes')::interval then 1
           else inlogpogingen.aantal + 1
         end,
         laatste_op = now()`,
      [email, SLOT_MINUTEN],
    );
    return { fout: "Dat e-mailadres en wachtwoord horen niet bij elkaar." };
  }

  await vraag("delete from inlogpogingen where email = $1", [email]);
  await maakSessie(rij.id);
  redirect(veiligPad(verder, rij.soort === "bedrijf" ? "/pro" : "/account"));
}

export async function uitloggen(): Promise<void> {
  await beeindigSessie();
  redirect("/");
}
