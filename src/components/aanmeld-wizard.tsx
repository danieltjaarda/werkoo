"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { DienstZoeker } from "@/components/dienst-zoeker";
import { ArrowLeftIcon, CheckIcon, SlotIcon } from "@/components/icons";
import { PlaatsInvoer } from "@/components/plaats-invoer";
import { ProvincieKaart } from "@/components/provincie-kaart";
import { WachtwoordVeld } from "@/components/wachtwoord-sterkte";
import { bedrijfAanmelden, type Uitkomst } from "@/lib/auth-acties";
import { getDienst, type Dienst } from "@/lib/diensten";
import { beeld } from "@/lib/site-beelden";

/**
 * Aanmelden als bedrijf in drie schermen, naar het model van de aanvraagflow:
 * één onderwerp per scherm, en pas op het laatste scherm gaat alles in één
 * keer naar de server. Alle waarden staan in verborgen velden van hetzelfde
 * formulier, zodat een teruggestuurde fout niets van de invoer kwijtraakt.
 */
const STAPPEN = [
  { id: "bedrijf", kop: "Welk bedrijf wil je aanmelden?", sub: "Deze gegevens gebruiken we om je inschrijving te controleren." },
  { id: "werk", kop: "Wat doe je, en waar?", sub: "Je kiest nu je diensten en je vestigingsplaats; je werkgebied verfijn je straks in je dashboard." },
  { id: "contact", kop: "Laatste stap: je contactgegevens", sub: "Deze gegevens komen niet op je openbare profiel." },
] as const;

type Formulier = {
  bedrijfsnaam: string;
  kvk: string;
  website: string;
  diensten: string[];
  plaats: string;
  postcode: string;
  provincies: string[];
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string;
  wachtwoord: string;
  akkoord: boolean;
};

const leeg: Formulier = {
  bedrijfsnaam: "", kvk: "", website: "", diensten: [], plaats: "", postcode: "", provincies: [],
  voornaam: "", achternaam: "", email: "", telefoon: "", wachtwoord: "", akkoord: false,
};

const invoer =
  "mt-2 h-veld w-full rounded-2xl border border-lijn bg-white px-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15";

const MAX_DIENSTEN = 10;

/** Draaiend rondje tijdens het opzoeken bij de KvK. */
function Draaier({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={`animate-spin ${className}`}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="2.5" className="opacity-25" />
      <path d="M17.5 10A7.5 7.5 0 0 0 10 2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Eén illustratie per stap, in dezelfde stijl als de aanvraagflow. */
const STAP_BEELDEN = ["bedrijf", "werkgebied", "contact"];

function Veld({
  id, label, type = "text", value, onChange, placeholder, autoComplete, optioneel = false, hint, inputMode,
}: {
  id: keyof Formulier; label: string; type?: string; value: string; onChange: (w: string) => void;
  placeholder?: string; autoComplete?: string; optioneel?: boolean; hint?: string; inputMode?: "numeric" | "url" | "email" | "tel";
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-basis font-semibold text-ink">
        {label}
        {optioneel ? <span className="ml-1.5 font-normal text-ink-soft">(optioneel)</span> : null}
      </label>
      <input
        id={id} name={`weergave-${id}`} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} className={invoer}
      />
      {hint ? <p className="mt-1.5 text-klein text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function AanmeldWizard({ startDienst = "", kvkOpzoeken = false }: { startDienst?: string; kvkOpzoeken?: boolean }) {
  const [stap, setStap] = useState(0);
  const [w, setW] = useState<Formulier>({ ...leeg, diensten: getDienst(startDienst) ? [startDienst] : [] });
  const [lokaleFout, setLokaleFout] = useState("");
  const [kvkBezig, setKvkBezig] = useState(false);
  const [kvkMelding, setKvkMelding] = useState("");
  const [zoek, setZoek] = useState("");
  const [staat, actie, bezig] = useActionState(bedrijfAanmelden, {} as Uitkomst);
  const kop = useRef<HTMLHeadingElement>(null);

  const zet = <K extends keyof Formulier>(veld: K, waarde: Formulier[K]) => {
    setLokaleFout("");
    setW((huidig) => ({ ...huidig, [veld]: waarde }));
  };

  useEffect(() => {
    kop.current?.focus();
  }, [stap]);

  /** Serverfouten horen bij het laatste scherm; komen we van daar terug, dan blijft de fout staan. */
  const fout = lokaleFout || (stap === 2 ? staat.fout ?? "" : "");

  function controleer(): string {
    if (stap === 0) {
      if (!w.bedrijfsnaam.trim()) return "Vul de naam van je bedrijf in.";
      if (w.kvk && !/^\d{8}$/.test(w.kvk.replace(/\s/g, ""))) return "Een KvK-nummer bestaat uit 8 cijfers.";
    }
    if (stap === 1) {
      if (w.diensten.length === 0) return "Kies minstens één dienst.";
      if (!w.plaats.trim()) return "Vul de plaats in waar je bedrijf zit.";
      if (w.postcode && !/^\d{4}\s?[A-Za-z]{2}$/.test(w.postcode.trim())) return "Vul een Nederlandse postcode in, bijvoorbeeld 1012 AB.";
    }
    return "";
  }

  /**
   * Zoekt het bedrijf op zodra er acht cijfers staan. Lukt het niet, dan zeggen
   * we dat rustig: de vakman kan altijd zelf verder typen. Het KvK-nummer is
   * niet verplicht, dus een storing bij het handelsregister mag de aanmelding
   * nooit blokkeren.
   */
  async function zoekKvk(nummer: string) {
    const schoon = nummer.replace(/\s/g, "");
    if (!kvkOpzoeken || !/^\d{8}$/.test(schoon) || kvkBezig) return;

    setKvkBezig(true);
    setKvkMelding("");
    try {
      const antwoord = await fetch(`/api/kvk?nummer=${schoon}`);
      const data = (await antwoord.json()) as {
        gevonden?: boolean;
        naam?: string;
        plaats?: string;
        postcode?: string;
        test?: boolean;
        fout?: string;
      };

      if (!antwoord.ok || !data.gevonden) {
        setKvkMelding(data.fout ?? "We vinden geen bedrijf met dit nummer.");
        return;
      }

      setW((huidig) => ({
        ...huidig,
        // Wat de vakman zelf al invulde laten we staan.
        bedrijfsnaam: huidig.bedrijfsnaam.trim() || data.naam || "",
        plaats: huidig.plaats.trim() || data.plaats || "",
        postcode: huidig.postcode.trim() || data.postcode || "",
      }));
      setKvkMelding(`Gevonden: ${data.naam}${data.plaats ? ` uit ${data.plaats}` : ""}.`);
    } catch {
      setKvkMelding("Het handelsregister reageert nu niet. Vul je gegevens zelf in.");
    } finally {
      setKvkBezig(false);
    }
  }

  function verder() {
    const melding = controleer();
    if (melding) return setLokaleFout(melding);
    setStap((s) => Math.min(s + 1, STAPPEN.length - 1));
  }

  function voegDienstToe(dienst: Dienst) {
    setZoek("");
    if (w.diensten.includes(dienst.slug) || w.diensten.length >= MAX_DIENSTEN) return;
    zet("diensten", [...w.diensten, dienst.slug]);
  }

  const huidige = STAPPEN[stap];

  return (
    <div className="kaart p-6 sm:p-8">
      <ol className="flex items-center gap-2" aria-label="Voortgang">
        {STAPPEN.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-klein font-bold ${
                i < stap ? "bg-brand text-white" : i === stap ? "bg-ink text-white" : "bg-brand-soft text-brand-deep"
              }`}
              aria-current={i === stap ? "step" : undefined}
            >
              {i < stap ? <CheckIcon className="h-4 w-4" /> : i + 1}
            </span>
            {i < STAPPEN.length - 1 ? <span className={`h-px flex-1 ${i < stap ? "bg-brand" : "bg-lijn"}`} /> : null}
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-klein font-medium uppercase tracking-[0.14em] text-brand-deep">
            Stap {stap + 1} van {STAPPEN.length}
          </p>
          <h1 ref={kop} tabIndex={-1} className="mt-2 font-display text-h3 text-ink outline-none">
            {huidige.kop}
          </h1>
          <p className="mt-2 text-basis text-ink-soft">{huidige.sub}</p>
        </div>
        {beeld(STAP_BEELDEN[stap]) ? (
          <Image
            src={beeld(STAP_BEELDEN[stap])!}
            alt=""
            width={700}
            height={700}
            sizes="150px"
            className="hidden h-[130px] w-auto shrink-0 object-contain sm:block"
          />
        ) : null}
      </div>

      <form
        action={actie}
        className="mt-6 space-y-5"
        onKeyDown={(e) => {
          // Enter op een tussenscherm gaat naar de volgende stap, niet naar de server.
          if (e.key === "Enter" && stap < STAPPEN.length - 1 && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault();
            verder();
          }
        }}
      >
        {/* Alles wat de server nodig heeft, onafhankelijk van welk scherm open staat. */}
        <input type="hidden" name="bedrijfsnaam" value={w.bedrijfsnaam} />
        <input type="hidden" name="kvk" value={w.kvk} />
        <input type="hidden" name="website" value={w.website} />
        {w.diensten.map((slug) => <input key={slug} type="hidden" name="dienst" value={slug} />)}
        <input type="hidden" name="plaats" value={w.plaats} />
        <input type="hidden" name="postcode" value={w.postcode} />
        {w.provincies.map((p) => <input key={p} type="hidden" name="provincie" value={p} />)}
        <input type="hidden" name="voornaam" value={w.voornaam} />
        <input type="hidden" name="achternaam" value={w.achternaam} />
        <input type="hidden" name="email" value={w.email} />
        <input type="hidden" name="telefoon" value={w.telefoon} />
        <input type="hidden" name="wachtwoord" value={w.wachtwoord} />
        <input type="hidden" name="akkoord" value={w.akkoord ? "ja" : ""} />

        {stap === 0 ? (
          <>
            <Veld id="bedrijfsnaam" label="Bedrijfsnaam" value={w.bedrijfsnaam} onChange={(v) => zet("bedrijfsnaam", v)} autoComplete="organization" placeholder="Zoals hij bij de KvK staat" />
            <div>
              <label htmlFor="kvk" className="block text-basis font-semibold text-ink">
                KvK-nummer
                <span className="ml-1.5 font-normal text-ink-soft">(optioneel)</span>
              </label>
              <div className="relative">
                <input
                  id="kvk"
                  name="weergave-kvk"
                  type="text"
                  inputMode="numeric"
                  value={w.kvk}
                  onChange={(e) => {
                    const nieuw = e.target.value;
                    zet("kvk", nieuw);
                    setKvkMelding("");
                    // Acht cijfers is een compleet nummer; dan zoeken we meteen.
                    if (/^\d{8}$/.test(nieuw.replace(/\s/g, ""))) void zoekKvk(nieuw);
                  }}
                  onBlur={(e) => void zoekKvk(e.target.value)}
                  placeholder="12345678"
                  className={invoer}
                />
                {kvkBezig ? (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Draaier className="h-5 w-5 text-brand-deep" />
                  </span>
                ) : null}
              </div>
              <p className={`mt-1.5 text-klein ${kvkMelding.startsWith("Gevonden") ? "text-emerald-700" : kvkMelding ? "text-ink-soft" : "text-ink-soft"}`}>
                {kvkMelding ||
                  (kvkOpzoeken
                    ? "Vul je nummer in, dan halen we je bedrijfsnaam en plaats erbij."
                    : "8 cijfers. We controleren je inschrijving voordat je profiel live gaat.")}
              </p>
            </div>
            <Veld id="website" label="Website" value={w.website} onChange={(v) => zet("website", v)} optioneel inputMode="url" placeholder="www.jouwbedrijf.nl" autoComplete="url" />
          </>
        ) : null}

        {stap === 1 ? (
          <>
            <div>
              <label htmlFor="dienst-zoek" className="block text-basis font-semibold text-ink">
                Welke diensten bied je aan?
              </label>
              <p className="mt-1 text-klein text-ink-soft">Zoek en kies er één of meer, maximaal {MAX_DIENSTEN}.</p>
              <div className="mt-2">
                <DienstZoeker
                  id="dienst-zoek"
                  waarde={zoek}
                  onWaarde={setZoek}
                  onKies={voegDienstToe}
                  placeholder="Bijvoorbeeld loodgieter, schilder, fotograaf"
                  klassen={`${invoer.replace("mt-2 ", "")} pl-11`}
                />
              </div>
              {w.diensten.length ? (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Gekozen diensten">
                  {w.diensten.map((slug) => {
                    const d = getDienst(slug);
                    if (!d) return null;
                    return (
                      <li key={slug} className="flex items-center gap-1 rounded-full border border-ink bg-brand-soft py-1.5 pl-3.5 pr-1.5 text-basis text-ink">
                        {d.menuLabel}
                        <button
                          type="button"
                          onClick={() => zet("diensten", w.diensten.filter((s) => s !== slug))}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-ink-soft transition hover:bg-white hover:text-ink"
                          aria-label={`${d.menuLabel} verwijderen`}
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
              <div>
                <label htmlFor="plaats" className="block text-basis font-semibold text-ink">
                  Vestigingsplaats
                </label>
                <div className="mt-2">
                  <PlaatsInvoer id="plaats" waarde={w.plaats} onWaarde={(v) => zet("plaats", v)} placeholder="Plaats" klassen={`${invoer.replace("mt-2 ", "")} pl-11`} metPin />
                </div>
              </div>
              <Veld id="postcode" label="Postcode" value={w.postcode} onChange={(v) => zet("postcode", v)} optioneel placeholder="1012 AB" autoComplete="postal-code" />
            </div>

            <div>
              <p className="block text-basis font-semibold text-ink">In welke provincies neem je opdrachten aan?</p>
              <p className="mt-1 text-klein text-ink-soft">
                Klik op de kaart. Kies je niets, dan krijg je voorlopig alleen aanvragen uit je eigen plaats; je past het later aan in je dashboard.
              </p>
              <div className="mt-3">
                <ProvincieKaart
                  compact
                  gekozen={w.provincies}
                  naam="weergave-provincie"
                  onWissel={(p) =>
                    zet("provincies", w.provincies.includes(p) ? w.provincies.filter((x) => x !== p) : [...w.provincies, p])
                  }
                />
              </div>
            </div>
          </>
        ) : null}

        {stap === 2 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Veld id="voornaam" label="Voornaam" value={w.voornaam} onChange={(v) => zet("voornaam", v)} autoComplete="given-name" />
              <Veld id="achternaam" label="Achternaam" value={w.achternaam} onChange={(v) => zet("achternaam", v)} autoComplete="family-name" />
            </div>
            <Veld id="email" label="E-mailadres" type="email" value={w.email} onChange={(v) => zet("email", v)} autoComplete="email" inputMode="email" hint="Hierop ontvang je nieuwe aanvragen en log je in." />
            <Veld id="telefoon" label="Telefoonnummer" type="tel" value={w.telefoon} onChange={(v) => zet("telefoon", v)} autoComplete="tel" inputMode="tel" />
            <WachtwoordVeld id="wachtwoord" naam="weergave-wachtwoord" label="Kies een wachtwoord" klassen={invoer} waarde={w.wachtwoord} onWaarde={(v) => zet("wachtwoord", v)} />
            <label className="flex cursor-pointer items-start gap-3 text-basis text-ink-soft">
              <input type="checkbox" checked={w.akkoord} onChange={(e) => zet("akkoord", e.target.checked)} className="mt-1" />
              <span>
                Ik ga akkoord met de{" "}
                <Link href="/voorwaarden" className="font-semibold text-brand-deep underline underline-offset-4" target="_blank">voorwaarden</Link>{" "}
                en de{" "}
                <Link href="/privacy" className="font-semibold text-brand-deep underline underline-offset-4" target="_blank">privacyverklaring</Link>.
              </span>
            </label>
          </>
        ) : null}

        {fout ? (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-basis font-medium text-red-700">
            {fout}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          {stap > 0 ? (
            <button type="button" onClick={() => { setLokaleFout(""); setStap((s) => s - 1); }} className="flex items-center gap-1.5 text-basis font-semibold text-ink-soft transition hover:text-ink">
              <ArrowLeftIcon className="h-4 w-4" />
              Vorige
            </button>
          ) : (
            <span />
          )}
          {stap < STAPPEN.length - 1 ? (
            <button type="button" onClick={verder} className="flex h-12 items-center justify-center rounded-2xl bg-ink px-8 font-display text-basis font-medium text-white transition hover:bg-brand-deep">
              Verder
            </button>
          ) : (
            <button type="submit" aria-disabled={bezig} className="flex h-12 items-center justify-center rounded-2xl bg-zon px-8 font-display text-basis font-semibold text-ink transition hover:bg-zon-dark">
              {bezig ? "Bezig…" : "Gratis aanmelden"}
            </button>
          )}
        </div>
      </form>

      <p className="mt-5 flex items-start gap-2 text-klein text-ink-soft">
        <SlotIcon className="mt-0.5 h-4 w-4 shrink-0" />
        Aanmelden is gratis en verplicht je tot niets. Je profiel gaat pas live als jij het aanzet.
      </p>
    </div>
  );
}
