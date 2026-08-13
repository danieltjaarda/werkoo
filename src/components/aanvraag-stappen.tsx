"use client";

import Image from "next/image";
import Link from "next/link";
import { addTransitionType, startTransition, useState, ViewTransition } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  SlotIcon,
  VinkjeTekentIcon,
} from "@/components/icons";
import { Kalender } from "@/components/kalender";
import { PlaatsInvoer } from "@/components/plaats-invoer";
import { Rating } from "@/components/rating";
import { UitgelichtLabel } from "@/components/uitgelicht-label";
import { vakmensenVoorPlaats, type Vakman } from "@/lib/content";
import type { Dienst } from "@/lib/diensten";

type Formulier = {
  plaats: string;
  type: string;
  dagen: string[];
  adres: string;
  wensen: string;
  /** null zolang de bezoeker de selectie niet aanraakt; dan geldt de standaardkeuze. */
  vakmensen: string[] | null;
  email: string;
  naam: string;
  telefoon: string;
  whatsapp: boolean;
};

type StapId = "plaats" | "type" | "datum" | "adres" | "wensen" | "vakmensen" | "email" | "naam" | "telefoon";

const stappen: StapId[] = [
  "plaats",
  "type",
  "datum",
  "adres",
  "wensen",
  "vakmensen",
  "email",
  "naam",
  "telefoon",
];

/** Zoveel vakmensen mag iemand tegelijk aanvragen. */
const MAX_KEUZE = 4;

/** Aantal kaarten dat direct zichtbaar is; de rest komt achter "Toon meer". */
const EERST_ZICHTBAAR = 2;

/**
 * Bij binnenkomst staan de direct zichtbare vakmensen aangevinkt. Meer voorvinken
 * dan er op het scherm staan zou de teller laten liegen over wat je hebt gekozen.
 */
function standaardKeuze(vakmensen: Vakman[]): string[] {
  return vakmensen.slice(0, EERST_ZICHTBAAR).map((vakman) => vakman.slug);
}

const invoerklassen =
  "h-13 w-full rounded-2xl border border-lijn bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-brand focus:ring-4 focus:ring-brand/15";

/** Even lang als de tekenanimatie van het vinkje in globals.css. */
const VINKJE_DUUR = 320;

const stapRichtingen = {
  "stap-vooruit": "stap-vooruit",
  "stap-terug": "stap-terug",
  default: "none",
} as const;

const slotRichting = { klaar: "stap-vooruit", default: "none" } as const;

export function AanvraagStappen({
  dienst,
  vakman,
  beginType,
  beginPlaats,
}: {
  dienst: Dienst;
  vakman?: Vakman;
  beginType: string;
  beginPlaats: string;
}) {
  const [stap, setStap] = useState(0);
  const [bezig, setBezig] = useState(false);
  const [bevestigd, setBevestigd] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [referentie, setReferentie] = useState<string | null>(null);
  const [waarden, setWaarden] = useState<Formulier>({
    plaats: beginPlaats,
    type: dienst.opties.some((optie) => optie.id === beginType) ? beginType : "",
    dagen: [],
    adres: "",
    wensen: "",
    vakmensen: null,
    email: "",
    naam: "",
    telefoon: "",
    whatsapp: false,
  });

  const huidig = stappen[stap];
  const laatste = stap === stappen.length - 1;

  // De lijst hangt aan de ingevulde plaats, dus die leiden we bij elke render af
  // in plaats van hem in state te dupliceren.
  const vakmensen = vakmensenVoorPlaats(waarden.plaats);
  const gekozenVakmensen = waarden.vakmensen ?? standaardKeuze(vakmensen);

  const zet = <K extends keyof Formulier>(veld: K, waarde: Formulier[K]) => {
    setWaarden((vorige) => ({ ...vorige, [veld]: waarde }));
    setFout(null);
  };

  function valideer(): string | null {
    if (huidig === "plaats" && !waarden.plaats.trim()) return "Vul in waar je zoekt.";
    if (huidig === "type" && !waarden.type) return `Kies waar je ${dienst.lidwoordNaam} voor nodig hebt.`;
    if (huidig === "vakmensen" && gekozenVakmensen.length === 0)
      return `Kies minstens één ${dienst.naam.toLowerCase()} om je aanvraag naartoe te sturen.`;
    if (huidig === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waarden.email))
      return "Vul een geldig e-mailadres in.";
    if (huidig === "naam" && !waarden.naam.trim()) return "Vul je naam in.";
    if (huidig === "telefoon" && !/^[+0][\d\s-]{8,}$/.test(waarden.telefoon.trim()))
      return "Vul een geldig telefoonnummer in.";
    return null;
  }

  /** Zet de stap in een transitie, want alleen dan animeert de ViewTransition mee. */
  function gaNaarStap(nieuw: number, richting: "stap-vooruit" | "stap-terug") {
    startTransition(() => {
      addTransitionType(richting);
      setStap(nieuw);
    });
  }

  /** Laat eerst het vinkje in de knop volgetekend worden en doe daarna pas de stap. */
  function naVinkje(vervolg: () => void) {
    setBevestigd(true);
    setTimeout(() => {
      setBevestigd(false);
      vervolg();
    }, VINKJE_DUUR);
  }

  async function verder() {
    const melding = valideer();
    if (melding) {
      setFout(melding);
      return;
    }

    if (!laatste) {
      naVinkje(() => gaNaarStap(stap + 1, "stap-vooruit"));
      return;
    }

    setBezig(true);
    try {
      const antwoord = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dienst: dienst.slug,
          vakman: vakman?.slug ?? null,
          ...waarden,
          datum: waarden.dagen.join(", "),
          vakmensen: gekozenVakmensen,
        }),
      });
      const data = await antwoord.json();

      if (!antwoord.ok) {
        setFout(data.fout ?? "Er ging iets mis. Probeer het opnieuw.");
        return;
      }

      naVinkje(() =>
        startTransition(() => {
          addTransitionType("klaar");
          setReferentie(data.referentie);
        }),
      );
    } catch {
      setFout("We konden je aanvraag niet versturen. Controleer je verbinding.");
    } finally {
      setBezig(false);
    }
  }

  if (referentie) {
    return (
      <ViewTransition key="klaar" enter={slotRichting} exit={slotRichting} default="none">
        <Klaar email={waarden.email} plaats={waarden.plaats} referentie={referentie} vakman={vakman} />
      </ViewTransition>
    );
  }

  const knopLabel = laatste
    ? bezig
      ? "Versturen…"
      : "Verstuur aanvraag"
    : huidig === "vakmensen"
      ? "Verder"
      : huidig === "datum" && waarden.dagen.length === 0
        ? "Overslaan"
        : huidig === "adres" && !waarden.adres.trim()
          ? "Overslaan"
          : huidig === "wensen" && !waarden.wensen.trim()
            ? "Overslaan"
            : "Volgende vraag";

  return (
    <div className="flex min-h-[calc(100svh-var(--hoogte-kop))] flex-col">
      <div className="container-page grid flex-1 items-start gap-10 py-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14 lg:py-8">
        <div>
          <div className="flex items-center gap-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lijn">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
                style={{ width: `${((stap + 1) / stappen.length) * 100}%` }}
              />
            </div>
            <Link
              href="/"
              transitionTypes={["nav-terug"]}
              className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink-soft transition hover:text-ink"
            >
              Sluiten
              <CloseIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8">
            <ViewTransition key={stap} enter={stapRichtingen} exit={stapRichtingen} default="none">
              <div>
                <Vraag
                  dienst={dienst}
                  stap={huidig}
                  waarden={waarden}
                  zet={zet}
                  vakman={vakman}
                  vakmensen={vakmensen}
                  gekozenVakmensen={gekozenVakmensen}
                />
              </div>
            </ViewTransition>
          </div>

          {fout ? (
            <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
              {fout}
            </p>
          ) : null}
        </div>

        <Zijkolom vakman={vakman} />
      </div>

      <div className="sticky bottom-0 border-t border-lijn bg-white/95 py-4 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => gaNaarStap(Math.max(0, stap - 1), "stap-terug")}
            disabled={stap === 0 || bevestigd}
            className="flex items-center gap-2 text-[14px] font-semibold text-ink-soft transition hover:text-ink disabled:invisible"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Vorige vraag
          </button>

          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={verder}
              disabled={bezig || bevestigd}
              className={`relative flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-zon px-7 font-display text-[15px] font-medium text-ink transition hover:bg-zon-dark ${
                bezig ? "opacity-60" : ""
              }`}
            >
              {/* Het label blijft staan zodat de knop niet van breedte verspringt. */}
              <span
                className={`flex items-center gap-2 transition-opacity duration-150 ${bevestigd ? "opacity-0" : "opacity-100"}`}
              >
                {knopLabel}
                <ArrowRightIcon className="h-4 w-4" />
              </span>
              {bevestigd ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <VinkjeTekentIcon className="h-6 w-6" />
                </span>
              ) : null}
            </button>
            <p className="flex items-center gap-1.5 text-[12px] text-ink-soft">
              <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
              Gratis en vrijblijvend
            </p>
          </div>

          <span className="hidden w-[120px] sm:block" />
        </div>
      </div>
    </div>
  );
}

function Vraag({
  dienst,
  stap,
  waarden,
  zet,
  vakman,
  vakmensen,
  gekozenVakmensen,
}: {
  dienst: Dienst;
  stap: StapId;
  waarden: Formulier;
  zet: <K extends keyof Formulier>(veld: K, waarde: Formulier[K]) => void;
  vakman?: Vakman;
  vakmensen: Vakman[];
  gekozenVakmensen: string[];
}) {
  if (stap === "plaats") {
    return (
      <Blok kop={`Waar zoek je ${dienst.lidwoordNaam}?`}>
        <div className="max-w-md">
          <PlaatsInvoer
            id="plaats"
            waarde={waarden.plaats}
            onWaarde={(nieuw) => zet("plaats", nieuw)}
            placeholder="Plaats"
            klassen={`${invoerklassen} pl-11`}
            metPin
          />
        </div>
      </Blok>
    );
  }

  if (stap === "type") {
    return (
      <Blok kop={`Waarvoor zoek je ${dienst.lidwoordNaam}?`}>
        <fieldset className="grid max-w-2xl gap-2.5 sm:grid-cols-2">
          <legend className="sr-only">Waarvoor zoek je {dienst.lidwoordNaam}?</legend>
          {dienst.opties.map((optie) => (
            <label
              key={optie.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-lijn bg-white px-4 py-3.5 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft"
            >
              <input
                type="radio"
                name="type"
                value={optie.id}
                checked={waarden.type === optie.id}
                onChange={(event) => zet("type", event.target.value)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-ink-soft/50 transition peer-checked:border-[5.5px] peer-checked:border-ink"
              />
              <span className="text-[15px] text-ink">{optie.label}</span>
            </label>
          ))}
        </fieldset>
      </Blok>
    );
  }

  if (stap === "datum") {
    return (
      <Blok
        kop={`Op welke datum is ${dienst.lidwoordNaam} nodig?`}
        subkop="Nog geen datum? Ga dan gewoon verder."
      >
        <div className="max-w-2xl">
          <Kalender gekozen={waarden.dagen} onWijzig={(dagen) => zet("dagen", dagen)} vakmanSlug={vakman?.slug} />
          {vakman ? (
            <p className="mt-3 text-[13px] text-ink-soft">
              Doorgestreepte dagen zitten al vol bij {vakman.naam}. Kies gerust meerdere dagen, dan is er iets te
              schuiven.
            </p>
          ) : null}
        </div>
      </Blok>
    );
  }

  if (stap === "adres") {
    return (
      <Blok kop="Wat is het adres van de locatie?" subkop="Bijvoorbeeld: Straatnaam 123, 1234 AB Plaatsnaam">
        <div className="max-w-xl">
          <PlaatsInvoer
            id="adres"
            naam="adres"
            soort="adres"
            waarde={waarden.adres}
            onWaarde={(nieuw) => zet("adres", nieuw)}
            placeholder="Nog geen locatie ingevuld"
            klassen={`${invoerklassen} pl-11`}
            metPin
          />
        </div>
      </Blok>
    );
  }

  if (stap === "wensen") {
    return (
      <Blok kop="Opmerkingen of wensen" subkop="(Optioneel)">
        <textarea
          rows={6}
          value={waarden.wensen}
          onChange={(event) => zet("wensen", event.target.value)}
          placeholder={`Met een goede beschrijving van je wensen kan ${dienst.lidwoordNaam} een passend voorstel maken.`}
          className="w-full max-w-2xl rounded-2xl border border-lijn bg-white p-4 text-[15px] text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-brand focus:ring-4 focus:ring-brand/15"
        />
      </Blok>
    );
  }

  if (stap === "vakmensen") {
    return (
      <Blok
        kop={`Beschikbare ${dienst.meervoud} gevonden`}
        subkop={`Kies er maximaal ${MAX_KEUZE} om prijzen te vergelijken.`}
      >
        <VakmanKeuze
          vakmensen={vakmensen}
          gekozen={gekozenVakmensen}
          onWijzig={(slugs) => zet("vakmensen", slugs)}
        />
      </Blok>
    );
  }

  if (stap === "email") {
    return (
      <Blok kop="Op welk e-mailadres wil je de reacties ontvangen?">
        <div className="max-w-md">
          <label htmlFor="email" className="block text-[14px] font-semibold text-ink">
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={waarden.email}
            onChange={(event) => zet("email", event.target.value)}
            placeholder="E-mailadres"
            className={`mt-2 ${invoerklassen}`}
          />
          <Belofte />
        </div>
      </Blok>
    );
  }

  if (stap === "naam") {
    return (
      <Blok kop="Wat is je naam?" bovenkop="Bijna klaar!">
        <div className="max-w-md">
          <label htmlFor="naam" className="block text-[14px] font-semibold text-ink">
            Naam
          </label>
          <input
            id="naam"
            autoComplete="name"
            value={waarden.naam}
            onChange={(event) => zet("naam", event.target.value)}
            placeholder="Naam"
            className={`mt-2 ${invoerklassen}`}
          />
          <Belofte />
        </div>
      </Blok>
    );
  }

  return (
    <Blok kop="Wat is je telefoonnummer?" bovenkop="Laatste stap!">
      <div className="max-w-md">
        <label htmlFor="telefoon" className="block text-[14px] font-semibold text-ink">
          Telefoonnummer
        </label>
        <input
          id="telefoon"
          type="tel"
          autoComplete="tel"
          value={waarden.telefoon}
          onChange={(event) => zet("telefoon", event.target.value)}
          placeholder="06 12345678"
          className={`mt-2 ${invoerklassen}`}
        />

        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-lijn bg-white px-4 py-3 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft">
          <input
            type="checkbox"
            checked={waarden.whatsapp}
            onChange={(event) => zet("whatsapp", event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink-soft/50 text-white transition peer-checked:border-ink peer-checked:bg-ink"
          >
            <CheckIcon className="h-3 w-3" />
          </span>
          <span className="text-[14px] text-ink">Ja, Werkoo mag me updates sturen via WhatsApp</span>
        </label>

        <Belofte />
      </div>
    </Blok>
  );
}

/** De vakmensen die op de aanvraag mogen reageren, als aan te vinken kaarten. */
function VakmanKeuze({
  vakmensen,
  gekozen,
  onWijzig,
}: {
  vakmensen: Vakman[];
  gekozen: string[];
  onWijzig: (slugs: string[]) => void;
}) {
  const [allesTonen, setAllesTonen] = useState(false);

  const zichtbaar = allesTonen ? vakmensen : vakmensen.slice(0, EERST_ZICHTBAAR);
  const verborgen = vakmensen.length - zichtbaar.length;
  const vol = gekozen.length >= MAX_KEUZE;

  function wissel(slug: string) {
    if (gekozen.includes(slug)) {
      onWijzig(gekozen.filter((gekozenSlug) => gekozenSlug !== slug));
      return;
    }
    if (vol) return;
    onWijzig([...gekozen, slug]);
  }

  return (
    <div className="max-w-2xl">
      <div className="grid gap-3 sm:grid-cols-2">
        {zichtbaar.map((vakman) => {
          const aan = gekozen.includes(vakman.slug);
          // Zit de selectie vol, dan blijft alleen uitvinken nog mogelijk.
          const geblokkeerd = !aan && vol;

          return (
            <label
              key={vakman.slug}
              className={`flex items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft ${
                vakman.uitgelicht ? "border-zon-dark" : "border-lijn"
              } ${geblokkeerd ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <input
                type="checkbox"
                checked={aan}
                disabled={geblokkeerd}
                onChange={() => wissel(vakman.slug)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink-soft/50 text-white transition peer-checked:border-ink peer-checked:bg-ink"
              >
                <CheckIcon className="h-3 w-3" />
              </span>

              <Image
                src={vakman.foto}
                alt=""
                width={120}
                height={120}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />

              {/* Twee regels, meer niet: wie het is, en het cijfer met de plaats. */}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-display text-[15px] font-bold text-ink">{vakman.naam}</span>
                  {vakman.uitgelicht ? <UitgelichtLabel /> : null}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-ink-soft">
                  <span className="font-display text-[15px] font-bold text-ink">
                    {vakman.score.toLocaleString("nl-NL")}
                  </span>{" "}
                  · {vakman.reviews} reviews · {vakman.plaats}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {verborgen > 0 ? (
        <button
          type="button"
          onClick={() => setAllesTonen(true)}
          className="mx-auto mt-4 flex items-center gap-1.5 text-[14px] font-semibold text-brand-deep transition hover:text-ink"
        >
          <span aria-hidden className="text-[17px] leading-none">
            +
          </span>
          Toon {verborgen} meer
        </button>
      ) : null}

      <p className="mt-4 text-[13px] text-ink-soft">
        {gekozen.length} van {MAX_KEUZE} gekozen
      </p>
    </div>
  );
}

function Blok({
  kop,
  bovenkop,
  subkop,
  children,
}: {
  kop: string;
  bovenkop?: string;
  subkop?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {bovenkop ? <p className="font-display text-[14px] font-semibold text-brand-deep">{bovenkop}</p> : null}
      <h1 className="font-display text-[24px] font-bold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[30px]">
        {kop}
      </h1>
      {subkop ? <p className="mt-2 text-[14px] text-ink-soft">{subkop}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Belofte() {
  return (
    <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
      <SlotIcon className="mt-0.5 h-4 w-4 shrink-0" />
      Je gegevens gaan alleen naar de vakmensen die op je aanvraag reageren.
    </p>
  );
}

function Zijkolom({ vakman }: { vakman?: Vakman }) {
  return (
    <aside className="hidden lg:block">
      {vakman ? (
        <div className="rounded-3xl border border-lijn bg-white p-5">
          <p className="font-display text-[14px] font-bold text-ink">Gekozen vakman</p>
          <div className="mt-4 overflow-hidden rounded-2xl">
            <Image
              src={vakman.foto}
              alt={`Werk van ${vakman.naam}`}
              width={720}
              height={580}
              className="h-[150px] w-full object-cover"
            />
          </div>
          <p className="mt-3 font-display text-[15px] font-bold leading-snug text-ink">{vakman.naam}</p>
          <div className="mt-2 flex items-center gap-2">
            <Rating score={vakman.score} />
            <span className="font-display text-[14px] font-bold text-ink">
              {vakman.score.toLocaleString("nl-NL")}
            </span>
            <span className="text-[13px] text-ink-soft">({vakman.reviews})</span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-brand-soft p-5">
          <p className="font-display text-[15px] font-bold text-ink">Al 6.300 aanvragen dit jaar</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Je vraag gaat naar vakmensen die op dat moment vrij zijn in jouw regio.
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {[
          "Rechtstreeks contact met lokale vakmensen",
          "Vergelijk vrijblijvend en bespaar",
          "Meestal binnen 24 uur antwoord",
        ].map((punt) => (
          <li key={punt} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-soft">
            <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand" />
            {punt}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Na het versturen: bevestiging plus de keuze om een account te maken. */
function Klaar({
  email,
  plaats,
  referentie,
  vakman,
}: {
  email: string;
  plaats: string;
  referentie: string;
  vakman?: Vakman;
}) {
  const [gestuurd, setGestuurd] = useState(false);

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/12 text-brand-deep">
          <VinkjeTekentIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-[26px] font-bold tracking-[-0.02em] text-ink">Je aanvraag is verstuurd</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {vakman
            ? `${vakman.naam} en andere beschikbare vakmensen in ${plaats} kijken naar je vraag.`
            : `We leggen je vraag voor aan beschikbare vakmensen in ${plaats}.`}{" "}
          De eerste reacties komen meestal binnen 24 uur binnen op {email}.
        </p>
        <p className="mt-4 text-[13px] text-ink-soft">
          Referentie <span className="font-semibold text-ink">{referentie}</span>
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-md rounded-3xl border border-lijn bg-white p-6 sm:p-7">
        {gestuurd ? (
          <div className="text-center">
            <h2 className="font-display text-[18px] font-bold text-ink">Kijk in je mail</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              We hebben een inloglink gestuurd naar {email}. Daarmee kom je in je aanvraag zonder wachtwoord.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-center font-display text-[18px] font-bold text-ink">Wil je je aanvraag volgen?</h2>
            <p className="mt-2 text-center text-[14px] leading-relaxed text-ink-soft">
              Met een account zie je alle reacties bij elkaar en kun je direct antwoorden.
            </p>

            <div className="mt-6 space-y-2.5">
              <MerkKnop merk="google" />
              <MerkKnop merk="apple" />
            </div>

            <div className="my-5 flex items-center gap-3 text-[12px] uppercase tracking-[0.12em] text-ink-soft">
              <span className="h-px flex-1 bg-lijn" />
              of
              <span className="h-px flex-1 bg-lijn" />
            </div>

            <button
              type="button"
              onClick={() => setGestuurd(true)}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-ink font-display text-[15px] font-medium text-white transition hover:bg-brand-deep"
            >
              Doorgaan met {email || "e-mail"}
            </button>
          </>
        )}

        <Link
          href="/"
          transitionTypes={["nav-terug"]}
          className="mt-5 block text-center text-[14px] font-semibold text-ink-soft transition hover:text-ink"
        >
          Nee, dat hoeft niet
        </Link>
      </div>
    </div>
  );
}

export function MerkKnop({ merk }: { merk: "google" | "apple" }) {
  const label = merk === "google" ? "Doorgaan met Google" : "Doorgaan met Apple";

  return (
    <button
      type="button"
      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-lijn bg-white font-display text-[15px] font-medium text-ink transition hover:bg-brand-soft"
    >
      {merk === "google" ? (
        <svg viewBox="0 0 18 18" aria-hidden className="h-[18px] w-[18px]">
          <path
            fill="#4285F4"
            d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z"
          />
          <path fill="#FBBC05" d="M3.9 10.6a5.4 5.4 0 0 1 0-3.4V4.9H.9a9 9 0 0 0 0 8.1l3-2.4Z" />
          <path
            fill="#EA4335"
            d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 4.9l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 18 18" aria-hidden className="h-[18px] w-[18px]" fill="currentColor">
          <path d="M12.9 9.6c0-1.7 1.4-2.5 1.4-2.6-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.1 0-2.1.7-2.7 1.7-1.2 2-.3 5 .8 6.6.6.8 1.2 1.7 2.1 1.7.9 0 1.2-.5 2.2-.5s1.3.5 2.2.5c.9 0 1.5-.8 2-1.6.7-.9.9-1.8.9-1.9 0 0-1.8-.7-1.8-2.6ZM11.3 4.6c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.4.5-.8 1.3-.7 2.1.8.1 1.6-.4 2.1-1Z" />
        </svg>
      )}
      {label}
    </button>
  );
}
