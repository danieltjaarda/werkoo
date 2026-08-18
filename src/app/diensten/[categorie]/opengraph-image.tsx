import { ogAfbeelding, OG_MAAT, OG_TYPE } from "@/lib/og";
import { dienstenVanCategorie, getCategorieVanSlug } from "@/lib/diensten";

export const alt = "Werkoo";
export const size = OG_MAAT;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ categorie: string }> }) {
  const categorie = getCategorieVanSlug((await params).categorie);
  if (!categorie) return ogAfbeelding({ eyebrow: "Werkoo", titel: "Vakmensen die passen bij jouw klus", tekst: "" });

  const aantal = dienstenVanCategorie(categorie.id).length;
  return ogAfbeelding({
    eyebrow: "Categorie",
    titel: categorie.titel,
    tekst: `${aantal} diensten waarvoor Werkoo vakmensen bij jou in de buurt zoekt.`,
  });
}
