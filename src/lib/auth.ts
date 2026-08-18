import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { vraagEen, vraagZacht } from "@/lib/db";

const scrypt = promisify(scryptCallback) as (
  wachtwoord: string,
  zout: Buffer,
  lengte: number,
  opties: { N: number; r: number; p: number },
) => Promise<Buffer>;

/** Naam van het cookie waarin het sessietoken staat. */
export const SESSIE_COOKIE = "werkoo-sessie";

/** Zo lang blijft iemand ingelogd zonder opnieuw in te loggen. */
const SESSIE_DAGEN = 30;

/**
 * scrypt uit de standaardbibliotheek van Node: geen extra afhankelijkheid en
 * geschikt voor wachtwoorden. De parameters staan in de hash zelf, zodat we ze
 * later kunnen verzwaren zonder bestaande wachtwoorden ongeldig te maken.
 */
const PARAMETERS = { N: 16384, r: 8, p: 1 };
const LENGTE = 64;

export async function hashWachtwoord(wachtwoord: string): Promise<string> {
  const zout = randomBytes(16);
  const hash = await scrypt(wachtwoord.normalize("NFKC"), zout, LENGTE, PARAMETERS);
  return `scrypt$${PARAMETERS.N}$${PARAMETERS.r}$${PARAMETERS.p}$${zout.toString("hex")}$${hash.toString("hex")}`;
}

export async function klopWachtwoord(wachtwoord: string, opgeslagen: string): Promise<boolean> {
  const delen = opgeslagen.split("$");
  if (delen.length !== 6 || delen[0] !== "scrypt") return false;

  const [, n, r, p, zoutHex, hashHex] = delen;
  const zout = Buffer.from(zoutHex, "hex");
  const verwacht = Buffer.from(hashHex, "hex");

  const berekend = await scrypt(wachtwoord.normalize("NFKC"), zout, verwacht.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });

  // timingSafeEqual eist gelijke lengtes en verraadt niet hoeveel er klopte.
  return berekend.length === verwacht.length && timingSafeEqual(berekend, verwacht);
}

export type Gebruiker = {
  id: string;
  email: string;
  naam: string;
  telefoon: string;
  soort: "particulier" | "bedrijf";
};

/**
 * Maakt een sessie aan en zet het cookie. Mag alleen vanuit een Server Action of
 * een Route Handler: tijdens het renderen van een pagina staat Next het zetten
 * van cookies niet toe.
 */
export async function maakSessie(gebruikerId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const verlooptOp = new Date(Date.now() + SESSIE_DAGEN * 24 * 60 * 60 * 1000);

  await vraagEen(
    "insert into sessies (id, gebruiker_id, verloopt_op) values ($1, $2, $3)",
    [token, gebruikerId, verlooptOp],
  );

  const opslag = await cookies();
  opslag.set(SESSIE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: verlooptOp,
  });
}

export async function beeindigSessie(): Promise<void> {
  const opslag = await cookies();
  const token = opslag.get(SESSIE_COOKIE)?.value;

  if (token) await vraagEen("delete from sessies where id = $1", [token]);
  opslag.delete(SESSIE_COOKIE);
}

/**
 * De ingelogde gebruiker, of niets. `cache` zorgt dat één render van een pagina
 * de sessie maar één keer opzoekt, hoeveel componenten er ook om vragen.
 */
export const huidigeGebruiker = cache(async (): Promise<Gebruiker | null> => {
  const opslag = await cookies();
  const token = opslag.get(SESSIE_COOKIE)?.value;
  if (!token) return null;

  // Zonder database is er niemand ingelogd; dat is beter dan een pagina die valt.
  return vraagZacht(() => zoekBijSessie(token), null, "de ingelogde gebruiker");
});

async function zoekBijSessie(token: string): Promise<Gebruiker | null> {

  const rij = await vraagEen<Gebruiker & { verloopt_op: Date }>(
    `select g.id, g.email, g.naam, g.telefoon, g.soort, s.verloopt_op
       from sessies s
       join gebruikers g on g.id = s.gebruiker_id
      where s.id = $1`,
    [token],
  );

  if (!rij) return null;

  // Verlopen sessies ruimen we op zodra we ze tegenkomen.
  if (new Date(rij.verloopt_op).getTime() < Date.now()) {
    await vraagEen("delete from sessies where id = $1", [token]);
    return null;
  }

  return { id: rij.id, email: rij.email, naam: rij.naam, telefoon: rij.telefoon, soort: rij.soort };
}

/** Stuurt door naar het inlogscherm als er niemand is ingelogd. */
export async function vereisGebruiker(terugNaar: string): Promise<Gebruiker> {
  const gebruiker = await huidigeGebruiker();
  if (!gebruiker) redirect(`/inloggen?verder=${encodeURIComponent(terugNaar)}`);
  return gebruiker;
}

export type Bedrijf = {
  id: string;
  naam: string;
  slug: string;
  plaats: string;
  adres: string;
  telefoon: string;
  belofte: string;
  tekst: string;
  jaren: number;
  foto: string;
  actief: boolean;
  score: number;
  reviews: number;
  kvk: string;
  website: string;
  postcode: string;
};

/** Het bedrijfsprofiel van de ingelogde vakman; maakt er een aan als het ontbreekt. */
export async function bedrijfVanGebruiker(gebruikerId: string): Promise<Bedrijf | undefined> {
  const rij = await vraagEen<Omit<Bedrijf, "score"> & { score: string }>(
    `select id, naam, slug, plaats, adres, telefoon, belofte, tekst, jaren, foto, actief, score, reviews,
            kvk, website, postcode
       from bedrijven where gebruiker_id = $1`,
    [gebruikerId],
  );

  // Postgres geeft numeric als string terug.
  return rij && { ...rij, score: Number(rij.score) };
}

/** Voor de /pro-schermen: ingelogd én een bedrijfsaccount, anders wegsturen. */
export async function vereisBedrijf(terugNaar: string): Promise<{ gebruiker: Gebruiker; bedrijf: Bedrijf }> {
  const gebruiker = await vereisGebruiker(terugNaar);
  if (gebruiker.soort !== "bedrijf") redirect("/account");

  const bedrijf = await bedrijfVanGebruiker(gebruiker.id);
  if (!bedrijf) redirect("/account");

  return { gebruiker, bedrijf };
}
