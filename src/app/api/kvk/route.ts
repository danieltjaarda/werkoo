import { NextResponse } from "next/server";

/**
 * Zoekt een bedrijf op KvK-nummer bij het handelsregister, zodat de vakman zijn
 * bedrijfsnaam en plaats niet zelf hoeft over te typen.
 *
 * Dit werkt alleen met een eigen sleutel in KVK_API_KEY: de aansluiting op de
 * Zoeken API kost een paar euro per maand (de bevragingen zelf zijn gratis).
 * Staat er geen sleutel, dan blijft deze route uit en toont de aanmelding een
 * gewoon invoerveld — beter dan een zoekfunctie die alleen verzonnen bedrijven
 * uit de testomgeving kent. Zet de sleutel en alles werkt vanzelf.
 */
export const runtime = "nodejs";
export const maxDuration = 15;

const BASIS = "https://api.kvk.nl/api/v2/zoeken";

type Resultaat = {
  kvkNummer?: string;
  naam?: string;
  type?: string;
  adres?: { binnenlandsAdres?: { straatnaam?: string; huisnummer?: number; postcode?: string; plaats?: string } };
};

export async function GET(request: Request) {
  const nummer = (new URL(request.url).searchParams.get("nummer") ?? "").replace(/\s/g, "");
  if (!/^\d{8}$/.test(nummer)) {
    return NextResponse.json({ fout: "Een KvK-nummer bestaat uit 8 cijfers." }, { status: 400 });
  }

  const sleutel = process.env.KVK_API_KEY;
  if (!sleutel) {
    return NextResponse.json({ fout: "Opzoeken bij de KvK staat uit." }, { status: 503 });
  }

  try {
    const antwoord = await fetch(`${BASIS}?kvkNummer=${nummer}`, {
      headers: { apikey: sleutel },
      signal: AbortSignal.timeout(8000),
      // Een bedrijf verandert zelden; een dag cache scheelt bevragingen.
      next: { revalidate: 86400 },
    });

    if (antwoord.status === 404) {
      return NextResponse.json({ gevonden: false, fout: "We vinden geen bedrijf met dit KvK-nummer." }, { status: 404 });
    }
    if (!antwoord.ok) {
      console.error("KVK gaf", antwoord.status, (await antwoord.text().catch(() => "")).slice(0, 200));
      return NextResponse.json({ fout: "Het handelsregister reageert nu niet. Vul je gegevens zelf in." }, { status: 502 });
    }

    const data = (await antwoord.json()) as { resultaten?: Resultaat[] };
    const lijst = data.resultaten ?? [];

    /**
     * Een nummer geeft vaak meerdere regels terug: de rechtspersoon, de
     * hoofdvestiging en eventuele nevenvestigingen. De hoofdvestiging heeft het
     * adres dat we willen; de rechtspersoon heeft de naam zoals ingeschreven.
     */
    const hoofd = lijst.find((r) => r.type === "hoofdvestiging");
    const rechtspersoon = lijst.find((r) => r.type === "rechtspersoon");
    const beste = hoofd ?? rechtspersoon ?? lijst[0];

    if (!beste) {
      return NextResponse.json({ gevonden: false, fout: "We vinden geen bedrijf met dit KvK-nummer." }, { status: 404 });
    }

    const adres = hoofd?.adres?.binnenlandsAdres ?? beste.adres?.binnenlandsAdres;

    return NextResponse.json({
      gevonden: true,
      naam: rechtspersoon?.naam ?? beste.naam ?? "",
      plaats: adres?.plaats ?? "",
      postcode: adres?.postcode ?? "",
      straat: adres?.straatnaam ? `${adres.straatnaam}${adres.huisnummer ? ` ${adres.huisnummer}` : ""}` : "",
    });
  } catch (fout) {
    console.error("KVK-bevraging mislukt:", fout);
    return NextResponse.json({ fout: "Het handelsregister reageert nu niet. Vul je gegevens zelf in." }, { status: 502 });
  }
}
