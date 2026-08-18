import { ogAfbeelding, OG_MAAT, OG_TYPE } from "@/lib/og";
import { getCategorie, getDienst } from "@/lib/diensten";
import { bekendePlaats } from "@/lib/plaatsen";

export const alt = "Werkoo";
export const size = OG_MAAT;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ dienst: string; plaats: string }> }) {
  const { dienst: dienstSlug, plaats: plaatsSlug } = await params;
  const dienst = getDienst(dienstSlug);
  const plaats = bekendePlaats(decodeURIComponent(plaatsSlug));
  if (!dienst || !plaats) return ogAfbeelding({ eyebrow: "Werkoo", titel: "Vakmensen die passen bij jouw klus", tekst: "" });

  return ogAfbeelding({
    eyebrow: getCategorie(dienst.categorie).titel,
    titel: `${dienst.naam} zoeken in ${plaats}`,
    tekst: `Ontvang reacties van ${dienst.meervoud} uit de omgeving van ${plaats}.`,
  });
}
