import { ogAfbeelding, OG_MAAT, OG_TYPE } from "@/lib/og";
import { diensten } from "@/lib/diensten";

export const alt = "Werkoo — vakmensen die passen bij jouw klus";
export const size = OG_MAAT;
export const contentType = OG_TYPE;

export default function Image() {
  return ogAfbeelding({
    eyebrow: `${diensten.length} diensten, heel Nederland`,
    titel: "Vakmensen die passen bij jouw klus",
    tekst: "Beschrijf je klus en ontvang reacties van vakmensen uit je eigen regio.",
  });
}
