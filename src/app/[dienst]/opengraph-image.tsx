import { ogAfbeelding, OG_MAAT, OG_TYPE } from "@/lib/og";
import { getCategorie, getDienst } from "@/lib/diensten";

export const alt = "Werkoo";
export const size = OG_MAAT;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ dienst: string }> }) {
  const dienst = getDienst((await params).dienst);
  if (!dienst) return ogAfbeelding({ eyebrow: "Werkoo", titel: "Vakmensen die passen bij jouw klus", tekst: "" });

  return ogAfbeelding({
    eyebrow: getCategorie(dienst.categorie).titel,
    titel: `${dienst.naam} zoeken bij jou in de buurt`,
    tekst: `Vertel kort wat je zoekt en ontvang reacties van ${dienst.meervoud} uit je eigen regio.`,
  });
}
