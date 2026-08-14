import { NextResponse } from "next/server";
import { bewaarAanvraag } from "@/lib/aanvragen";
import { huidigeGebruiker } from "@/lib/auth";
import { getDienst } from "@/lib/diensten";
import { normaliseerPlaats } from "@/lib/plaatsen";

export type Lead = {
  dienst: string;
  /** Slug van de vakman waarop de bezoeker klikte, leeg bij een vrije zoekopdracht. */
  vakman: string | null;
  type: string;
  plaats: string;
  /** Eén of meer gekozen dagen, als "2026-08-21, 2026-08-22". */
  datum: string;
  adres: string;
  wensen: string;
  /** Slugs van de vakmensen die de bezoeker aanvinkte; zij krijgen de aanvraag. */
  vakmensen: string[];
  naam: string;
  email: string;
  telefoon: string;
  whatsapp: boolean;
};

const verplichteVelden: (keyof Lead)[] = ["dienst", "type", "plaats", "naam", "email", "telefoon"];

/**
 * "2026-02-30" is een geldig patroon maar geen bestaande dag; JavaScript rolt hem
 * stil door naar maart. Daarom vergelijken we de onderdelen na het omzetten terug.
 */
function echteDag(dag: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dag)) return false;

  const [jaar, maand, dagnummer] = dag.split("-").map(Number);
  const datum = new Date(jaar, maand - 1, dagnummer);

  return (
    datum.getFullYear() === jaar && datum.getMonth() === maand - 1 && datum.getDate() === dagnummer
  );
}

export async function POST(request: Request) {
  let body: Partial<Lead>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  // `JSON.parse("null")` en `JSON.parse("[]")` komen door de try heen maar zijn
  // geen aanvraag; zonder deze controle valt de route erna om met een 500.
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  const ontbreekt = verplichteVelden.filter((veld) => !body[veld]?.toString().trim());
  if (ontbreekt.length > 0) {
    return NextResponse.json(
      { fout: `Deze velden zijn verplicht: ${ontbreekt.join(", ")}.` },
      { status: 422 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email!)) {
    return NextResponse.json({ fout: "Vul een geldig e-mailadres in." }, { status: 422 });
  }

  // Een onbekende dienst hoort niet in de database te belanden.
  const dienst = getDienst(body.dienst);
  if (!dienst) {
    return NextResponse.json({ fout: "Deze dienst kennen we niet." }, { status: 422 });
  }

  if (!dienst.opties.some((optie) => optie.id === body.type)) {
    return NextResponse.json({ fout: "Deze keuze hoort niet bij deze dienst." }, { status: 422 });
  }

  // Wat als plaats binnenkomt hoeft niet in onze lijst te staan, maar moet er wel
  // als een plaatsnaam uitzien; anders komt er van alles in de teksten terecht.
  const plaats = normaliseerPlaats(body.plaats);
  if (!plaats) {
    return NextResponse.json({ fout: "Vul een geldige plaatsnaam in." }, { status: 422 });
  }

  const dagen = (body.datum ?? "")
    .split(",")
    .map((dag) => dag.trim())
    .filter(echteDag);

  /**
   * Een lege lijst is geldig: bij diensten waar nog geen profielen bij staan
   * krijgt de bezoeker de keuzestap niet te zien, en kiezen wij de ontvangers.
   */
  if (!Array.isArray(body.vakmensen)) {
    return NextResponse.json({ fout: "Ongeldige keuze van vakmensen." }, { status: 422 });
  }

  // Is de bezoeker ingelogd, dan hangt de aanvraag meteen aan zijn account.
  const gebruiker = await huidigeGebruiker();

  try {
    const { referentie, ontvangers } = await bewaarAanvraag({
      dienst: dienst.slug,
      type: body.type!,
      plaats,
      adres: (body.adres ?? "").slice(0, 200),
      wensen: (body.wensen ?? "").slice(0, 2000),
      dagen,
      naam: body.naam!.slice(0, 100),
      email: body.email!.slice(0, 200),
      telefoon: body.telefoon!.slice(0, 40),
      whatsapp: Boolean(body.whatsapp),
      bedrijfSlugs: body.vakmensen.filter((slug): slug is string => typeof slug === "string"),
      gebruikerId: gebruiker?.id ?? null,
    });

    return NextResponse.json({ referentie, ontvangers }, { status: 201 });
  } catch (fout) {
    console.error("Aanvraag opslaan mislukt", fout);
    return NextResponse.json(
      { fout: "We konden je aanvraag niet opslaan. Probeer het zo nog eens." },
      { status: 500 },
    );
  }
}
