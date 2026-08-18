import { ogAfbeelding, OG_MAAT, OG_TYPE } from "@/lib/og";
import { profielVanSlug } from "@/lib/aanvragen";
import { getDienst } from "@/lib/diensten";

export const alt = "Werkoo";
export const size = OG_MAAT;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const profiel = await profielVanSlug((await params).slug);
  if (!profiel) return ogAfbeelding({ eyebrow: "Werkoo", titel: "Vakmensen die passen bij jouw klus", tekst: "" });

  const { bedrijf } = profiel;
  const vak = getDienst(profiel.diensten[0])?.naam ?? "Vakman";
  return ogAfbeelding({
    eyebrow: `${vak}${bedrijf.plaats ? ` in ${bedrijf.plaats}` : ""}`,
    titel: bedrijf.naam,
    tekst: bedrijf.belofte || bedrijf.tekst.slice(0, 120) || "Vraag gratis en vrijblijvend een reactie aan via Werkoo.",
  });
}
