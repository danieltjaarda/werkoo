import { NextResponse } from "next/server";
import { genoemdePlaats } from "@/lib/chat-kennis";
import { diensten, getDienst, zoekDiensten } from "@/lib/diensten";
import { bekendePlaats, slugVanPlaatsnaam } from "@/lib/plaatsen";

/**
 * "We verbouwen onze badkamer en zoeken een aannemer voor het voorjaar" →
 * welke dienst is dat, en in welke plaats? Eerst proberen we het zelf met de
 * catalogus; komen we er niet uit, dan mag het taalmodel kiezen. Het model
 * krijgt alleen de lijst met slugs, dus het kan niets anders teruggeven dan
 * een dienst die wij ook echt hebben.
 */
export const runtime = "nodejs";
export const maxDuration = 20;

const MODELLEN = ["google/gemini-3.1-flash-lite", "openai/gpt-5-mini"];

export async function POST(request: Request) {
  let body: { tekst?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  const tekst = typeof body.tekst === "string" ? body.tekst.trim().slice(0, 500) : "";
  if (tekst.length < 3) return NextResponse.json({ fout: "Vertel iets meer over je klus." }, { status: 400 });

  const plaats = await genoemdePlaats(tekst);

  // Staat de dienst er letterlijk in? Dan hoeven we het model niet te vragen.
  let slug = zoekDiensten(tekst, 1)[0]?.slug ?? "";

  if (!slug) {
    const sleutel = process.env.OPENROUTER_API_KEY;
    if (sleutel) {
      try {
        const antwoord = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${sleutel}`, "Content-Type": "application/json", "HTTP-Referer": "https://werkoo.nl", "X-Title": "Werkoo match" },
          body: JSON.stringify({
            model: MODELLEN[0],
            models: MODELLEN,
            max_tokens: 20,
            temperature: 0,
            messages: [
              {
                role: "system",
                content: `Je krijgt de omschrijving van een klus. Antwoord met precies één slug uit deze lijst en verder niets. Weet je het niet zeker, antwoord dan "geen".\n\n${diensten.map((d) => `${d.slug}: ${d.naam}`).join("\n")}`,
              },
              { role: "user", content: tekst },
            ],
          }),
          signal: AbortSignal.timeout(12000),
        });
        if (antwoord.ok) {
          const data = (await antwoord.json()) as { choices?: { message?: { content?: string } }[] };
          const gok = (data.choices?.[0]?.message?.content ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
          if (getDienst(gok)) slug = gok;
        }
      } catch {
        // Model niet bereikbaar: we vallen terug op de zoekpagina.
      }
    }
  }

  if (!slug) return NextResponse.json({ dienst: "", pad: "/diensten" });

  const bekend = plaats ? bekendePlaats(plaats) : undefined;
  const pad = bekend
    ? `/${slug}/${slugVanPlaatsnaam(bekend)}`
    : plaats
      ? `/${slug}?plaats=${encodeURIComponent(plaats)}`
      : `/${slug}`;

  return NextResponse.json({ dienst: slug, naam: getDienst(slug)?.menuLabel ?? "", plaats: bekend ?? plaats, pad });
}
