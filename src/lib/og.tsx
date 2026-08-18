import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * Eén vormgeving voor alle deelafbeeldingen (og:image / twitter:image), zodat
 * een gedeelde link naar een dienst-, plaats- of categoriepagina er op
 * WhatsApp, LinkedIn en X uitziet als één merk. 1200×630 is de maat die elk
 * platform accepteert.
 */
export const OG_MAAT = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

let fontsCache: Promise<{ vet: ArrayBuffer; normaal: ArrayBuffer }> | undefined;

async function fonts() {
  fontsCache ??= (async () => {
    const map = path.join(process.cwd(), "src/app/fonts");
    const [vet, normaal] = await Promise.all([
      readFile(path.join(map, "montserrat-700.woff")),
      readFile(path.join(map, "montserrat-500.woff")),
    ]);
    return { vet: vet.buffer.slice(vet.byteOffset, vet.byteOffset + vet.byteLength) as ArrayBuffer, normaal: normaal.buffer.slice(normaal.byteOffset, normaal.byteOffset + normaal.byteLength) as ArrayBuffer };
  })();
  return fontsCache;
}

export async function ogAfbeelding({
  eyebrow,
  titel,
  tekst,
}: {
  /** Kleine regel boven de titel, bv. de categorie of "Vakmensen in de buurt". */
  eyebrow: string;
  titel: string;
  tekst: string;
}) {
  const { vet, normaal } = await fonts();
  const groot = titel.length > 32;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #eaf7fc 0%, #ffffff 55%, #eaf7fc 100%)",
          color: "#12283a",
          fontFamily: "Montserrat",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#1eb1df",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            W
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>Werkoo</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "#0d6f92",
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ fontSize: groot ? 60 : 72, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1000 }}>
            {titel}
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, color: "#3d5566", lineHeight: 1.35, maxWidth: 960 }}>{tekst}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, fontWeight: 500, color: "#3d5566" }}>
          <div style={{ display: "flex", background: "#ffd23f", borderRadius: 999, padding: "10px 22px", color: "#12283a", fontWeight: 700 }}>
            Gratis en vrijblijvend
          </div>
          <div style={{ display: "flex" }}>werkoo.nl</div>
        </div>
      </div>
    ),
    {
      ...OG_MAAT,
      fonts: [
        { name: "Montserrat", data: vet, weight: 700, style: "normal" },
        { name: "Montserrat", data: normaal, weight: 500, style: "normal" },
      ],
    },
  );
}
