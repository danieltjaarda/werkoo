"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowRightIcon, ChatIcon, CloseIcon } from "@/components/icons";

/**
 * De chatassistent rechtsonder op elke pagina. Praat via /api/chat met een
 * taalmodel dat de site kent; het gesprek staat alleen in deze tab
 * (sessionStorage) en wordt nergens bewaard.
 */
type Bericht = { role: "user" | "assistant"; content: string };

const NAAM = "Wout";
const OPSLAG = "werkoo-chat";
const WELKOM = "Hoi! Ik ben Wout van Werkoo. Zoek je een vakman, wil je weten wat iets kost, of hoe een aanvraag werkt? Vraag maar raak.";

const SUGGESTIES = ["Wat kost een videograaf?", "Hoe werkt een aanvraag?", "Ik ben vakman en wil me aanmelden"];

/**
 * Minimale, veilige weergave van wat het model terugstuurt: alinea's,
 * lijstjes, **vet** en [links](/pad). Geen html van buiten — alles wordt als
 * tekst gerenderd en alleen deze vier vormen krijgen opmaak.
 */
function Opmaak({ tekst }: { tekst: string }) {
  const blokken = tekst.trim().split(/\n{2,}/);
  return (
    <>
      {blokken.map((blok, i) => {
        const regels = blok.split("\n");
        const isLijst = regels.every((r) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(r));
        if (isLijst) {
          return (
            <ul key={i} className="my-1.5 list-disc space-y-1 pl-4">
              {regels.map((r, j) => (
                <li key={j}>
                  <Inline tekst={r.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-1.5 first:mt-0 last:mb-0">
            {regels.map((r, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                <Inline tekst={r} />
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function Inline({ tekst }: { tekst: string }) {
  // Splits op links en vetgedrukte stukken; de rest blijft platte tekst.
  const delen = tekst.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {delen.map((deel, i) => {
        const link = deel.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const [, label, url] = link;
          const intern = url!.startsWith("/");
          const veilig = intern || /^https?:\/\//.test(url!);
          if (!veilig) return <span key={i}>{label}</span>;
          return intern ? (
            <Link key={i} href={url!} className="font-semibold text-brand-deep underline underline-offset-4">
              {label}
            </Link>
          ) : (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-deep underline underline-offset-4">
              {label}
            </a>
          );
        }
        const vet = deel.match(/^\*\*([^*]+)\*\*$/);
        if (vet) return <strong key={i} className="font-semibold text-ink">{vet[1]}</strong>;
        return <span key={i}>{deel}</span>;
      })}
    </>
  );
}

export function ChatWidget({ dienst }: { dienst?: string }) {
  const [open, setOpen] = useState(false);
  // Gesprek van deze tab terughalen; bij de eerste render op de server is er niets.
  const [berichten, setBerichten] = useState<Bericht[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const bewaard = sessionStorage.getItem(OPSLAG);
      return bewaard ? (JSON.parse(bewaard) as Bericht[]) : [];
    } catch {
      return [];
    }
  });
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const lijst = useRef<HTMLDivElement>(null);
  const veld = useRef<HTMLTextAreaElement>(null);
  const afbreker = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(OPSLAG, JSON.stringify(berichten.slice(-40)));
    } catch {
      /* negeren */
    }
    lijst.current?.scrollTo({ top: lijst.current.scrollHeight, behavior: "smooth" });
  }, [berichten, open]);

  useEffect(() => {
    if (open) veld.current?.focus();
  }, [open]);

  async function verstuur(tekst: string) {
    const schoon = tekst.trim();
    if (!schoon || bezig) return;
    setFout("");
    setInvoer("");
    const geschiedenis: Bericht[] = [...berichten, { role: "user", content: schoon }];
    setBerichten([...geschiedenis, { role: "assistant", content: "" }]);
    setBezig(true);

    afbreker.current?.abort();
    const ctrl = new AbortController();
    afbreker.current = ctrl;

    try {
      const antwoord = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ berichten: geschiedenis, dienst }),
        signal: ctrl.signal,
      });

      if (!antwoord.ok || !antwoord.body) {
        const data = (await antwoord.json().catch(() => ({}))) as { fout?: string };
        throw new Error(data.fout ?? "De assistent kan nu even niet antwoorden.");
      }

      const lezer = antwoord.body.getReader();
      const decoder = new TextDecoder();
      let tekstTotNu = "";
      for (;;) {
        const { value, done } = await lezer.read();
        if (done) break;
        tekstTotNu += decoder.decode(value, { stream: true });
        const zoVer = tekstTotNu;
        setBerichten([...geschiedenis, { role: "assistant", content: zoVer }]);
      }
      if (!tekstTotNu.trim()) throw new Error("Er kwam geen antwoord terug. Probeer het nog eens.");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setBerichten(geschiedenis);
      setFout((e as Error).message || "Er ging iets mis. Probeer het zo nog eens.");
    } finally {
      setBezig(false);
    }
  }

  function opVerzenden(event: FormEvent) {
    event.preventDefault();
    void verstuur(invoer);
  }

  function opToets(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void verstuur(invoer);
    }
  }

  function wis() {
    afbreker.current?.abort();
    setBerichten([]);
    setFout("");
    setBezig(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {open ? (
        <section
          aria-label={`Chat met ${NAAM}`}
          className="kaart flex h-[min(600px,calc(100dvh-7.5rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden shadow-paneel"
        >
          <header className="flex items-center gap-3 border-b border-lijn bg-brand-soft px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-deep font-display text-basis font-bold text-white">
              W
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-basis font-semibold text-ink">{NAAM} van Werkoo</p>
              <p className="flex items-center gap-1.5 text-mini text-ink-soft">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                Chatassistent, altijd bereikbaar
              </p>
            </div>
            {berichten.length ? (
              <button type="button" onClick={wis} className="text-mini font-medium text-ink-soft underline-offset-4 hover:underline">
                Nieuw gesprek
              </button>
            ) : null}
          </header>

          <div ref={lijst} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-basis" role="log" aria-live="polite">
            <Ballon rol="assistant">{WELKOM}</Ballon>

            {berichten.length === 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void verstuur(s)}
                    className="rounded-full border border-lijn bg-white px-3 py-1.5 text-klein text-ink transition hover:border-brand hover:text-brand-deep"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            {berichten.map((b, i) => (
              <Ballon key={i} rol={b.role}>
                {b.role === "assistant" ? (
                  b.content ? (
                    <Opmaak tekst={b.content} />
                  ) : (
                    <span className="inline-flex gap-1 py-1" aria-label="Aan het typen">
                      <Stip vertraging="0ms" />
                      <Stip vertraging="150ms" />
                      <Stip vertraging="300ms" />
                    </span>
                  )
                ) : (
                  b.content
                )}
              </Ballon>
            ))}

            {fout ? (
              <p role="alert" className="rounded-2xl bg-red-50 px-3 py-2 text-klein font-medium text-red-700">
                {fout}
              </p>
            ) : null}
          </div>

          <form onSubmit={opVerzenden} className="border-t border-lijn bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={veld}
                value={invoer}
                onChange={(e) => setInvoer(e.target.value)}
                onKeyDown={opToets}
                rows={1}
                placeholder="Typ je vraag…"
                aria-label="Je bericht"
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-lijn bg-white px-3.5 py-2.5 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
              <button
                type="submit"
                aria-label="Verstuur"
                aria-disabled={bezig || !invoer.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-white transition hover:bg-brand-deep aria-disabled:opacity-40"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-mini text-ink-soft">
              {NAAM} is een AI-assistent en kan zich vergissen. Liever een mens?{" "}
              <a href="mailto:hallo@werkoo.nl" className="underline underline-offset-4">
                hallo@werkoo.nl
              </a>
            </p>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Chat sluiten" : "Chat openen"}
        // Merkblauw en niet ink: de knop zweeft ook over de donkere secties heen.
        className="flex h-14 items-center gap-2 rounded-full bg-brand-deep px-4 text-white shadow-zwevend transition hover:bg-brand-dark"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-6 w-6" />}
        {!open ? <span className="hidden font-display text-basis font-medium sm:inline">Vragen? Chat met {NAAM}</span> : null}
      </button>
    </div>
  );
}

function Ballon({ rol, children }: { rol: "user" | "assistant"; children: React.ReactNode }) {
  const eigen = rol === "user";
  return (
    <div className={`flex ${eigen ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
          eigen ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-brand-soft text-ink"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Stip({ vertraging }: { vertraging: string }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-brand-deep/60" style={{ animationDelay: vertraging }} />;
}
