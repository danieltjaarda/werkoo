import { NextResponse } from "next/server";
import { genoemdeDiensten, systeemPrompt } from "@/lib/chat-kennis";
import { getDienst } from "@/lib/diensten";

/**
 * De chatassistent. De browser stuurt het hele gesprek mee (we bewaren niets),
 * wij plakken er de kennis van Werkoo voor en geven het antwoord als tekst
 * terug in stukjes, zodat het typend op het scherm komt.
 *
 * Model via OpenRouter: goedkoop en snel voor de eerste keuze, met een tweede
 * model als terugval wanneer de eerste even niet reageert.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const MODELLEN = ["google/gemini-3.1-flash-lite", "openai/gpt-5-mini"];
const MAX_BERICHTEN = 30;
const MAX_TEKENS = 2000;

/** Simpele rem per ip: zoveel berichten per venster. Per serverinstantie, en dat is genoeg tegen misbruik. */
const VENSTER_MS = 10 * 60 * 1000;
const MAX_PER_VENSTER = 40;
const teller = new Map<string, { n: number; tot: number }>();

function afgeremd(ip: string): boolean {
  const nu = Date.now();
  const rij = teller.get(ip);
  if (!rij || rij.tot < nu) {
    teller.set(ip, { n: 1, tot: nu + VENSTER_MS });
    return false;
  }
  rij.n += 1;
  return rij.n > MAX_PER_VENSTER;
}

type Bericht = { role: "user" | "assistant"; content: string };

function isBericht(b: unknown): b is Bericht {
  if (typeof b !== "object" || b === null) return false;
  const r = (b as { role?: unknown }).role;
  return (r === "user" || r === "assistant") && typeof (b as { content?: unknown }).content === "string";
}

export async function POST(request: Request) {
  const sleutel = process.env.OPENROUTER_API_KEY;
  if (!sleutel) return NextResponse.json({ fout: "De chat is even niet beschikbaar." }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "onbekend";
  if (afgeremd(ip)) return NextResponse.json({ fout: "Even rustig aan — probeer het over een paar minuten opnieuw." }, { status: 429 });

  let body: { berichten?: unknown; dienst?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  const berichten: Bericht[] = Array.isArray(body.berichten)
    ? body.berichten
        .filter(isBericht)
        .slice(-MAX_BERICHTEN)
        .map((b) => ({ role: b.role, content: b.content.slice(0, MAX_TEKENS) }))
    : [];

  if (berichten.length === 0 || berichten[berichten.length - 1]!.role !== "user") {
    return NextResponse.json({ fout: "Geen bericht ontvangen." }, { status: 400 });
  }

  const huidigeDienst = typeof body.dienst === "string" && getDienst(body.dienst) ? body.dienst : undefined;
  const extraDiensten = genoemdeDiensten(berichten.map((b) => b.content).join(" "));

  const antwoord = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sleutel}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://werkoo.nl",
      "X-Title": "Werkoo chat",
    },
    body: JSON.stringify({
      model: MODELLEN[0],
      models: MODELLEN,
      stream: true,
      max_tokens: 500,
      temperature: 0.4,
      messages: [{ role: "system", content: systeemPrompt({ huidigeDienst, extraDiensten }) }, ...berichten],
    }),
  });

  if (!antwoord.ok || !antwoord.body) {
    console.error("OpenRouter gaf", antwoord.status, (await antwoord.text().catch(() => "")).slice(0, 300));
    return NextResponse.json({ fout: "De assistent kan nu even niet antwoorden. Probeer het zo nog eens." }, { status: 502 });
  }

  /**
   * OpenRouter stuurt server-sent events met json per regel; wij geven alleen
   * de tekst door. Zo hoeft de browser niets van dat formaat te weten.
   */
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let rest = "";

  const stroom = new ReadableStream<Uint8Array>({
    async start(controller) {
      const lezer = antwoord.body!.getReader();
      try {
        for (;;) {
          const { value, done } = await lezer.read();
          if (done) break;
          rest += decoder.decode(value, { stream: true });
          const regels = rest.split("\n");
          rest = regels.pop() ?? "";
          for (const regel of regels) {
            if (!regel.startsWith("data: ")) continue;
            const data = regel.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
              const stuk = json.choices?.[0]?.delta?.content;
              if (stuk) controller.enqueue(encoder.encode(stuk));
            } catch {
              // Half json aan het einde van een chunk; komt in de volgende ronde.
            }
          }
        }
      } catch (fout) {
        console.error("Chatstroom afgebroken:", fout);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stroom, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
