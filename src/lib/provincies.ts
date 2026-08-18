import { PROVINCIE_NAMEN } from "@/lib/provincie-kaart";

/**
 * Van plaats naar provincie. Onze eigen plaatsenlijst kennen we uit het
 * hoofd; voor alle andere plaatsen vragen we het aan de Locatieserver van
 * PDOK (gratis, geen sleutel). Antwoorden onthouden we per proces.
 */
const BEKEND: Record<string, string> = {
  amsterdam: "Noord-Holland", haarlem: "Noord-Holland", alkmaar: "Noord-Holland", hilversum: "Noord-Holland",
  amstelveen: "Noord-Holland", zaandam: "Noord-Holland", hoorn: "Noord-Holland", purmerend: "Noord-Holland",
  rotterdam: "Zuid-Holland", "den haag": "Zuid-Holland", "'s-gravenhage": "Zuid-Holland", leiden: "Zuid-Holland",
  dordrecht: "Zuid-Holland", zoetermeer: "Zuid-Holland", delft: "Zuid-Holland", gouda: "Zuid-Holland",
  utrecht: "Utrecht", amersfoort: "Utrecht", nieuwegein: "Utrecht", veenendaal: "Utrecht", zeist: "Utrecht",
  eindhoven: "Noord-Brabant", tilburg: "Noord-Brabant", breda: "Noord-Brabant", "'s-hertogenbosch": "Noord-Brabant",
  "den bosch": "Noord-Brabant", oss: "Noord-Brabant", helmond: "Noord-Brabant", roosendaal: "Noord-Brabant",
  groningen: "Groningen", almere: "Flevoland", lelystad: "Flevoland",
  nijmegen: "Gelderland", arnhem: "Gelderland", apeldoorn: "Gelderland", ede: "Gelderland", doetinchem: "Gelderland",
  enschede: "Overijssel", zwolle: "Overijssel", deventer: "Overijssel", hengelo: "Overijssel", almelo: "Overijssel",
  maastricht: "Limburg", venlo: "Limburg", heerlen: "Limburg", sittard: "Limburg", roermond: "Limburg",
  assen: "Drenthe", emmen: "Drenthe", hoogeveen: "Drenthe",
  middelburg: "Zeeland", vlissingen: "Zeeland", goes: "Zeeland", terneuzen: "Zeeland",
  leeuwarden: "Friesland", heerenveen: "Friesland", sneek: "Friesland", joure: "Friesland", drachten: "Friesland",
  bolsward: "Friesland", franeker: "Friesland", harlingen: "Friesland",
};

const cache = new Map<string, string>();

function normaliseer(naam: string): string {
  return naam.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Snelle, synchrone variant: alleen wat we zelf kennen. */
export function bekendeProvincie(plaats: string): string {
  return BEKEND[normaliseer(plaats)] ?? cache.get(normaliseer(plaats)) ?? "";
}

/** Zoekt de provincie op, desnoods via PDOK. Geeft "" als het niet lukt; nooit een fout. */
export async function provincieVanPlaats(plaats: string): Promise<string> {
  const sleutel = normaliseer(plaats);
  if (!sleutel) return "";
  const eigen = bekendeProvincie(plaats);
  if (eigen) return eigen;

  try {
    const url = new URL("https://api.pdok.nl/bzk/locatieserver/search/v3_1/free");
    url.searchParams.set("q", plaats);
    url.searchParams.set("fq", "type:woonplaats");
    url.searchParams.set("fl", "woonplaatsnaam,provincienaam");
    url.searchParams.set("rows", "3");
    const r = await fetch(url, { signal: AbortSignal.timeout(2500), next: { revalidate: 86400 } });
    if (!r.ok) return "";
    const data = (await r.json()) as { response?: { docs?: { woonplaatsnaam?: string; provincienaam?: string }[] } };
    const docs = data.response?.docs ?? [];
    const treffer = docs.find((d) => normaliseer(d.woonplaatsnaam ?? "") === sleutel) ?? docs[0];
    const provincie = treffer?.provincienaam ?? "";
    const genormaliseerd = provincie === "Fryslân" ? "Friesland" : provincie;
    if (PROVINCIE_NAMEN.includes(genormaliseerd)) {
      cache.set(sleutel, genormaliseerd);
      return genormaliseerd;
    }
    return "";
  } catch {
    return "";
  }
}
