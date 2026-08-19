import { NextResponse } from "next/server";

/**
 * Zoekt een bedrijf op KvK-nummer bij het handelsregister, zodat de vakman zijn
 * bedrijfsnaam en plaats niet zelf hoeft over te typen.
 *
 * De sleutel staat in KVK_API_KEY. Zonder eigen sleutel praten we met de
 * testomgeving van de KVK: die heeft een openbare sleutel en een handvol
 * verzonnen bedrijven, genoeg om de flow te bouwen en te testen. In productie
 * hoort er een echte sleutel te staan, anders vindt hij echte nummers niet.
 */
export const runtime = "nodejs";
export const maxDuration = 15;

const TEST_SLEUTEL = "l7xx1f2691f2520d487b902f4e0b57a0b197";
const TEST_BASIS = "https://api.kvk.nl/test/api/v2/zoeken";
const ECHT_BASIS = "https://api.kvk.nl/api/v2/zoeken";

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

  const eigen = process.env.KVK_API_KEY;
  const sleutel = eigen ?? TEST_SLEUTEL;
  const basis = eigen ? ECHT_BASIS : TEST_BASIS;

  try {
    const antwoord = await fetch(`${basis}?kvkNummer=${nummer}`, {
      headers: { apikey: sleutel },
      signal: AbortSignal.timeout(8000),
      // Een bedrijf verandert zelden; een dag cache scheelt bevragingen.
      next: { revalidate: 86400 },
    });

    if (antwoord.status === 404) {
      /**
       * Zonder eigen sleutel kennen we alleen de verzonnen bedrijven van de
       * testomgeving. Dan is "niet gevonden" misleidend: het nummer klopt
       * waarschijnlijk prima, wij kunnen het alleen niet opzoeken.
       */
      return NextResponse.json(
        {
          gevonden: false,
          test: !eigen,
          fout: eigen
            ? "We vinden geen bedrijf met dit KvK-nummer."
            : "Automatisch opzoeken werkt nog niet; vul je bedrijfsnaam zelf in.",
        },
        { status: 404 },
      );
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
      /** Zonder eigen sleutel komt dit uit de testomgeving met verzonnen bedrijven. */
      test: !eigen,
    });
  } catch (fout) {
    console.error("KVK-bevraging mislukt:", fout);
    return NextResponse.json({ fout: "Het handelsregister reageert nu niet. Vul je gegevens zelf in." }, { status: 502 });
  }
}
