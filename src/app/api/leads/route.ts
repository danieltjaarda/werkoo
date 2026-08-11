import { NextResponse } from "next/server";

export type Lead = {
  dienst: string;
  type: string;
  plaats: string;
  datum: string;
  budget: string;
  toelichting: string;
  naam: string;
  email: string;
  telefoon: string;
};

const verplichteVelden: (keyof Lead)[] = ["dienst", "type", "plaats", "naam", "email", "telefoon"];

export async function POST(request: Request) {
  let body: Partial<Lead>;

  try {
    body = await request.json();
  } catch {
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

  const referentie = `WK-${Date.now().toString(36).toUpperCase()}`;

  // Hier komt later de koppeling met de database en de mail naar de vakmensen.
  console.info("Nieuwe lead", { referentie, ...body });

  return NextResponse.json({ referentie }, { status: 201 });
}
