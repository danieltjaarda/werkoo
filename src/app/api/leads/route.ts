import { NextResponse } from "next/server";

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

  /**
   * Een lege lijst is geldig: bij diensten waar nog geen profielen bij staan
   * krijgt de bezoeker de keuzestap niet te zien, en leggen wij de aanvraag zelf
   * voor aan de vakmensen in die regio.
   */
  if (!Array.isArray(body.vakmensen)) {
    return NextResponse.json({ fout: "Ongeldige keuze van vakmensen." }, { status: 422 });
  }

  const referentie = `WK-${Date.now().toString(36).toUpperCase()}`;

  // Hier komt later de koppeling met de database en de mail naar de vakmensen.
  console.info("Nieuwe lead", { referentie, ...body });

  return NextResponse.json({ referentie }, { status: 201 });
}
