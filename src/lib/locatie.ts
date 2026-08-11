import { cookies, headers } from "next/headers";
import { normaliseerPlaats, PLAATS_COOKIE } from "@/lib/plaatsen";

/** Landen waarvoor we de plaatsnaam tonen; daarbuiten blijft het algemeen. */
const bediendeLanden = new Set(["NL", "BE"]);

export type Plaatsbepaling = {
  /** Naam zoals hij in de teksten komt: "Amsterdam" of het algemene "de buurt". */
  weergave: string;
  /** Waarde voor het plaatsveld in het formulier; leeg als we niets weten. */
  invoer: string;
  bron: "keuze" | "ip" | "onbekend";
};

const onbekend: Plaatsbepaling = { weergave: "de buurt", invoer: "", bron: "onbekend" };

function gevonden(plaats: string, bron: "keuze" | "ip"): Plaatsbepaling {
  return { weergave: plaats, invoer: plaats, bron };
}

/**
 * Bepaalt op de server welke plaats we tonen. De volgorde is bewust:
 * een eigen keuze weegt zwaarder dan wat het ip-adres suggereert.
 *
 * De geo-headers worden gezet door de hosting: `x-vercel-ip-city` op Vercel en
 * `cf-ipcity` op Cloudflare (daar moet je de managed transform "Add visitor
 * location headers" aanzetten). Lokaal bestaan ze niet, dus dan valt hij terug
 * op het algemene "de buurt" of op de testwaarde uit `?plaats=`.
 */
export async function bepaalPlaats(zoekterm?: string): Promise<Plaatsbepaling> {
  const uitUrl = normaliseerPlaats(zoekterm);
  if (uitUrl) return gevonden(uitUrl, "keuze");

  const cookieOpslag = await cookies();
  const uitCookie = normaliseerPlaats(cookieOpslag.get(PLAATS_COOKIE)?.value);
  if (uitCookie) return gevonden(uitCookie, "keuze");

  const kopteksten = await headers();
  const land = kopteksten.get("x-vercel-ip-country") ?? kopteksten.get("cf-ipcountry");
  if (land && !bediendeLanden.has(land.toUpperCase())) return onbekend;

  const uitHeader = normaliseerPlaats(
    kopteksten.get("x-vercel-ip-city") ?? kopteksten.get("cf-ipcity"),
  );
  if (uitHeader) return gevonden(uitHeader, "ip");

  return onbekend;
}
