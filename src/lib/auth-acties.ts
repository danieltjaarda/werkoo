"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import {
  beeindigSessie,
  hashWachtwoord,
  klopWachtwoord,
  maakSessie,
  type Gebruiker,
} from "@/lib/auth";
import { metTransactie, vraag, vraagEen } from "@/lib/db";
import { getDienst } from "@/lib/diensten";
import { verstuurMail } from "@/lib/mail";
import { meldWelkomBedrijf } from "@/lib/meldingen";
import { normaliseerPlaats, slugVanPlaatsnaam } from "@/lib/plaatsen";
import { isProvincie } from "@/lib/provincie-kaart";
import { absoluut } from "@/lib/site";

export type Uitkomst = { fout?: string; gelukt?: string };

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

/* ---------- Wachtwoord vergeten ---------- */

const HERSTEL_MINUTEN = 60;

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Stuurt een herstellink. De melding is altijd dezelfde, of het adres nu
 * bestaat of niet — anders is dit formulier een manier om uit te vragen wie er
 * een account heeft.
 */
export async function wachtwoordVergeten(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const email = tekst(data, "email").toLowerCase();
  if (!EMAIL.test(email)) return { fout: "Vul een geldig e-mailadres in." };

  const gebruiker = await vraagEen<{ id: string; naam: string }>(
    "select id, naam from gebruikers where email = $1",
    [email],
  );

  if (gebruiker) {
    const token = randomBytes(32).toString("base64url");
    await vraag(
      `insert into wachtwoord_herstel (token_hash, gebruiker_id, verloopt_op)
       values ($1, $2, now() + ($3 || ' minutes')::interval)`,
      [tokenHash(token), gebruiker.id, HERSTEL_MINUTEN],
    );

    const link = absoluut(`/wachtwoord-herstellen?token=${token}`);
    try {
      await verstuurMail({
        aan: email,
        onderwerp: "Nieuw wachtwoord voor Werkoo",
        tekst: `Hoi ${gebruiker.naam},

Iemand — hopelijk jij — vroeg een nieuw wachtwoord aan voor je Werkoo-account. Kies via deze link een nieuw wachtwoord; hij is een uur geldig:

${link}

Was jij dit niet? Dan kun je deze mail negeren; je wachtwoord blijft zoals het was.`,
      });
    } catch (fout) {
      console.error("Herstelmail mislukt:", fout);
      return { fout: "De mail kon niet worden verstuurd. Probeer het zo nog eens." };
    }
  }

  return { gelukt: "Als dit adres bij ons bekend is, staat er binnen een paar minuten een mail in je inbox." };
}

/** Zet met een geldig token een nieuw wachtwoord en logt meteen in. */
export async function wachtwoordHerstellen(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const token = tekst(data, "token");
  const wachtwoord = tekst(data, "wachtwoord");

  if (wachtwoord.length < MIN_LENGTE) return { fout: `Kies een wachtwoord van minstens ${MIN_LENGTE} tekens.` };
  if (!token) return { fout: "Deze link is niet compleet. Vraag een nieuwe aan." };

  const rij = await vraagEen<{ gebruiker_id: string; soort: string }>(
    `select h.gebruiker_id, g.soort
       from wachtwoord_herstel h
       join gebruikers g on g.id = h.gebruiker_id
      where h.token_hash = $1 and h.gebruikt_op is null and h.verloopt_op > now()`,
    [tokenHash(token)],
  );
  if (!rij) return { fout: "Deze link is verlopen of al gebruikt. Vraag een nieuwe aan." };

  const hash = await hashWachtwoord(wachtwoord);
  await metTransactie(async (client) => {
    await client.query("update gebruikers set wachtwoord_hash = $1 where id = $2", [hash, rij.gebruiker_id]);
    await client.query("update wachtwoord_herstel set gebruikt_op = now() where token_hash = $1", [tokenHash(token)]);
    // Oude sessies zijn na een reset niet meer te vertrouwen.
    await client.query("delete from sessies where gebruiker_id = $1", [rij.gebruiker_id]);
    await client.query("delete from inlogpogingen where email = (select email from gebruikers where id = $1)", [rij.gebruiker_id]);
  });

  await maakSessie(rij.gebruiker_id);
  redirect(rij.soort === "bedrijf" ? "/pro" : "/account");
}

/* ---------- Aanmelden als bedrijf (wizard) ---------- */

const KVK = /^\d{8}$/;
const POSTCODE = /^\d{4}\s?[A-Za-z]{2}$/;

function lijst(data: FormData, veld: string): string[] {
  return data.getAll(veld).filter((w): w is string => typeof w === "string" && w.trim() !== "");
}

/** Maakt website-invoer eenduidig: "bakker.nl" wordt "https://bakker.nl". */
function normaliseerWebsite(ruw: string): string | null {
  if (!ruw) return "";
  const metSchema = /^https?:\/\//i.test(ruw) ? ruw : `https://${ruw}`;
  try {
    const url = new URL(metSchema);
    if (!url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/**
 * De aanmeldwizard op /aanmelden/start: bedrijf, werk en contactgegevens in
 * één keer. Maakt het account, het profiel, de diensten en het werkgebied
 * aan en logt meteen in; het profiel staat op onzichtbaar tot de vakman hem
 * in het dashboard aanzet.
 */
export async function bedrijfAanmelden(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const bedrijfsnaam = tekst(data, "bedrijfsnaam");
  const kvk = tekst(data, "kvk").replace(/\s/g, "");
  const website = normaliseerWebsite(tekst(data, "website"));
  const diensten = [...new Set(lijst(data, "dienst"))].filter((slug) => getDienst(slug)).slice(0, 10);
  const plaats = normaliseerPlaats(tekst(data, "plaats")) ?? "";
  const postcode = tekst(data, "postcode").toUpperCase().replace(/\s/g, "");
  const provincies = [...new Set(lijst(data, "provincie"))].filter(isProvincie);
  const voornaam = tekst(data, "voornaam");
  const achternaam = tekst(data, "achternaam");
  const email = tekst(data, "email").toLowerCase();
  const telefoon = tekst(data, "telefoon");
  const wachtwoord = tekst(data, "wachtwoord");

  if (!bedrijfsnaam) return { fout: "Vul de naam van je bedrijf in." };
  if (kvk && !KVK.test(kvk)) return { fout: "Een KvK-nummer bestaat uit 8 cijfers." };
  if (website === null) return { fout: "Dat lijkt geen geldig webadres." };
  if (diensten.length === 0) return { fout: "Kies minstens één dienst die je aanbiedt." };
  if (!plaats) return { fout: "Vul de plaats in waar je bedrijf zit." };
  if (postcode && !POSTCODE.test(postcode)) return { fout: "Vul een Nederlandse postcode in, bijvoorbeeld 1012 AB." };
  if (!voornaam || !achternaam) return { fout: "Vul je voor- en achternaam in." };
  if (!EMAIL.test(email)) return { fout: "Vul een geldig e-mailadres in." };
  if (!telefoon) return { fout: "Vul een telefoonnummer in waarop we je kunnen bereiken." };
  if (wachtwoord.length < MIN_LENGTE) return { fout: `Kies een wachtwoord van minstens ${MIN_LENGTE} tekens.` };
  if (data.get("akkoord") !== "ja") return { fout: "Ga akkoord met de voorwaarden om verder te gaan." };

  const bestaat = await vraagEen("select 1 from gebruikers where email = $1", [email]);
  if (bestaat) return { fout: "Er is al een account met dit e-mailadres. Log in of gebruik een ander adres." };

  const hash = await hashWachtwoord(wachtwoord);
  const naam = `${voornaam} ${achternaam}`;
  let gebruikerId: string | undefined;

  for (let poging = 0; poging < 5 && !gebruikerId; poging++) {
    try {
      gebruikerId = await metTransactie(async (client) => {
        const { rows } = await client.query<{ id: string }>(
          `insert into gebruikers (email, wachtwoord_hash, naam, telefoon, soort)
           values ($1, $2, $3, $4, 'bedrijf') returning id`,
          [email, hash, naam, telefoon],
        );
        const id = rows[0]!.id;
        const { rows: b } = await client.query<{ id: string }>(
          `insert into bedrijven (gebruiker_id, naam, slug, telefoon, plaats, postcode, kvk, website)
           values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
          [id, bedrijfsnaam, `${basisSlug(bedrijfsnaam)}-${randomBytes(2).toString("hex")}`, telefoon, plaats, postcode, kvk, website],
        );
        const bedrijfId = b[0]!.id;
        for (const slug of diensten) {
          await client.query("insert into bedrijf_diensten (bedrijf_id, dienst) values ($1, $2) on conflict do nothing", [bedrijfId, slug]);
        }
        // Provincies van de kaart; zonder keuze is de eigen plaats het begin van het werkgebied.
        for (const provincie of provincies) {
          await client.query("insert into bedrijf_provincies (bedrijf_id, provincie) values ($1, $2) on conflict do nothing", [bedrijfId, provincie]);
        }
        if (provincies.length === 0) {
          await client.query("insert into bedrijf_plaatsen (bedrijf_id, plaats) values ($1, $2) on conflict do nothing", [bedrijfId, plaats]);
        }
        return id;
      });
    } catch (fout) {
      const code = typeof fout === "object" && fout !== null && "code" in fout ? fout.code : undefined;
      if (code !== "23505") throw fout;
      if (await vraagEen("select 1 from gebruikers where email = $1", [email])) {
        return { fout: "Er is al een account met dit e-mailadres. Log in of gebruik een ander adres." };
      }
    }
  }

  if (!gebruikerId) return { fout: "Het account kon niet worden aangemaakt. Probeer het opnieuw." };

  meldWelkomBedrijf(gebruikerId);
  await maakSessie(gebruikerId);
  redirect("/pro?welkom=1");
}
