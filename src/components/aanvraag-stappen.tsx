"use client";

import Image from "next/image";
import Link from "next/link";
import { addTransitionType, startTransition, useEffect, useRef, useState, ViewTransition } from "react";
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
import { deelLidwoord, type Dienst } from "@/lib/diensten";
import { onthoudPlaats } from "@/lib/plaats-cookie";
// Alleen het type: `@/lib/aanvragen` is server-only en mag hier niet draaien.
import type { Bedrijf } from "@/lib/aanvragen";

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

/**
 * De volledige vragenlijst. De stap "vakmensen" valt weg bij diensten waar nog
 * geen profielen bij staan: een lege keuzelijst is een doodlopende vraag.
 */
const alleStappen: StapId[] = [
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
function standaardKeuze(vakmensen: Bedrijf[]): string[] {
  return vakmensen.slice(0, EERST_ZICHTBAAR).map((vakman) => vakman.slug);
}

const invoerklassen =
  "h-veld w-full rounded-2xl border border-lijn bg-white px-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15";

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
  vakmensen,
  bezet,
  beginType,
  beginPlaats,
  ingelogdAls,
}: {
  dienst: Dienst;
  vakman?: Bedrijf;
  /** De bedrijven die deze dienst doen; komt van de server, want dit is een clientcomponent. */
  vakmensen: Bedrijf[];
  /** Dagen waarop de gekozen vakman al vol zit, als "2026-08-21". */
  bezet: string[];
  beginType: string;
  beginPlaats: string;
  /** Al ingelogd? Dan vullen we naam, e-mail en telefoon vast in. */
  ingelogdAls: { naam: string; email: string; telefoon: string } | null;
}) {
  const [stap, setStap] = useState(0);
  const vraagVak = useRef<HTMLDivElement>(null);
  const eersteRender = useRef(true);
  const [bezig, setBezig] = useState(false);
  const [bevestigd, setBevestigd] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [referentie, setReferentie] = useState<string | null>(null);
  // Hoeveel vakmensen de aanvraag daadwerkelijk hebben gekregen; bij een dienst
  // zonder aangesloten bedrijven is dat nul en dat mogen we niet verzwijgen.
  const [ontvangers, setOntvangers] = useState(0);
  const [waarden, setWaarden] = useState<Formulier>({
    plaats: beginPlaats,
    type: dienst.opties.some((optie) => optie.id === beginType) ? beginType : "",
    dagen: [],
    adres: "",
    wensen: "",
    vakmensen: null,
    email: ingelogdAls?.email ?? "",
    naam: ingelogdAls?.naam ?? "",
    telefoon: ingelogdAls?.telefoon ?? "",
    whatsapp: false,
  });

  const gekozenVakmensen = waarden.vakmensen ?? standaardKeuze(vakmensen);

  const stappen =
    vakmensen.length > 0 ? alleStappen : alleStappen.filter((id) => id !== "vakmensen");
  const huidig = stappen[stap];
  const laatste = stap === stappen.length - 1;

  /**
   * Na een stapwissel verspringt alleen de inhoud, niet de pagina. Een
   * schermlezer merkt daar niets van, dus zetten we de focus op de nieuwe vraag.
   */
  useEffect(() => {
    if (eersteRender.current) {
      eersteRender.current = false;
      return;
    }
    vraagVak.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [stap]);

  const zet = <K extends keyof Formulier>(veld: K, waarde: Formulier[K]) => {
    setWaarden((vorige) => ({ ...vorige, [veld]: waarde }));
    setFout(null);
  };

  function valideer(): string | null {
    if (huidig === "plaats" && !waarden.plaats.trim()) return "Vul in waar je zoekt.";
    if (huidig === "type" && !waarden.type) return `Kies waar je ${dienst.lidwoordNaam} voor nodig hebt.`;
    if (huidig === "vakmensen" && gekozenVakmensen.length === 0)
      return `Kies minstens één ${deelLidwoord(dienst).naam} om je aanvraag naartoe te sturen.`;
    if (huidig === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waarden.email))
      return "Vul een geldig e-mailadres in.";
    if (huidig === "naam" && !waarden.naam.trim()) return "Vul je naam in.";
    if (huidig === "telefoon" && !/^[+0][\d\s-]{8,}$/.test(waarden.telefoon.trim()))
      return "Vul een geldig telefoonnummer in.";
    return null;
  }

  /** Zet de stap in een transitie, want alleen dan animeert de ViewTransition mee. */
  function gaNaarStap(nieuw: number, richting: "stap-vooruit" | "stap-terug") {
    // Anders blijft de melding van de vorige vraag onder de volgende staan.
    setFout(null);
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
    if (bezig || bevestigd) return;

    const melding = valideer();
    if (melding) {
      setFout(melding);
      return;
    }

    // Wat iemand hier zelf intypt weegt zwaarder dan het ip-adres, dus dat onthouden we.
    if (huidig === "plaats") onthoudPlaats(waarden.plaats);

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
          setOntvangers(data.ontvangers ?? 0);
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
        <Klaar
          email={waarden.email}
          plaats={waarden.plaats}
          referentie={referentie}
          vakman={vakman}
          ontvangers={ontvangers}
          alIngelogd={Boolean(ingelogdAls)}
        />
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
            <div
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={stappen.length}
              aria-valuenow={stap + 1}
              aria-label={`Vraag ${stap + 1} van ${stappen.length}`}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-lijn"
            >
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
                style={{ width: `${((stap + 1) / stappen.length) * 100}%` }}
              />
            </div>
            <Link
              href="/"
              transitionTypes={["nav-terug"]}
              className="flex shrink-0 items-center gap-1.5 text-klein font-medium text-ink-soft transition hover:text-ink"
            >
              Sluiten
              <CloseIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8">
            <ViewTransition key={stap} enter={stapRichtingen} exit={stapRichtingen} default="none">
              <div ref={vraagVak}>
                <Vraag
                  dienst={dienst}
                  stap={huidig}
                  waarden={waarden}
                  zet={zet}
                  vakman={vakman}
                  vakmensen={vakmensen}
                  gekozenVakmensen={gekozenVakmensen}
                  bezet={bezet}
                />
              </div>
            </ViewTransition>
          </div>

          {fout ? (
            <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-basis font-medium text-red-700">
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
            onClick={() => {
              if (bevestigd) return;
              gaNaarStap(Math.max(0, stap - 1), "stap-terug");
            }}
            disabled={stap === 0}
            className="flex items-center gap-2 text-basis font-semibold text-ink-soft transition hover:text-ink disabled:invisible"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Vorige vraag
          </button>

          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={verder}
              // aria-disabled en niet disabled: een knop die zichzelf uitschakelt
              // terwijl hij focus heeft, laat de browser de focus naar <body>
              // gooien en die komt daarna niet vanzelf terug.
              aria-disabled={bezig || bevestigd}
              className={`relative flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-zon px-7 font-display text-basis font-medium text-ink transition hover:bg-zon-dark ${
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
            <p className="flex items-center gap-1.5 text-mini text-ink-soft">
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
  bezet,
}: {
  dienst: Dienst;
  stap: StapId;
  waarden: Formulier;
  zet: <K extends keyof Formulier>(veld: K, waarde: Formulier[K]) => void;
  vakman?: Bedrijf;
  vakmensen: Bedrijf[];
  gekozenVakmensen: string[];
  bezet: string[];
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
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-lijn bg-white px-4 py-3.5 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-deep"
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
              <span className="text-basis text-ink">{optie.label}</span>
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
          <Kalender gekozen={waarden.dagen} onWijzig={(dagen) => zet("dagen", dagen)} bezet={bezet} />
          {vakman ? (
            <p className="mt-3 text-klein text-ink-soft">
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
          className="w-full max-w-2xl rounded-2xl border border-lijn bg-white p-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
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
          <label htmlFor="email" className="block text-basis font-semibold text-ink">
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
          <label htmlFor="naam" className="block text-basis font-semibold text-ink">
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
        <label htmlFor="telefoon" className="block text-basis font-semibold text-ink">
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

        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-lijn bg-white px-4 py-3 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-deep">
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
          <span className="text-basis text-ink">Ja, Werkoo mag me updates sturen via WhatsApp</span>
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
  vakmensen: Bedrijf[];
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
              className={`flex items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-deep ${
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
                  <span className="truncate font-display text-basis font-bold text-ink">{vakman.naam}</span>
                  {vakman.uitgelicht ? <UitgelichtLabel /> : null}
                </span>
                <span className="mt-0.5 block truncate text-klein text-ink-soft">
                  <span className="font-display text-basis font-bold text-ink">
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
          className="mx-auto mt-4 flex items-center gap-1.5 text-basis font-semibold text-brand-deep transition hover:text-ink"
        >
          <span aria-hidden className="text-[17px] leading-none">
            +
          </span>
          Toon {verborgen} meer
        </button>
      ) : null}

      <p className="mt-4 text-klein text-ink-soft">
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
      {bovenkop ? <p className="font-display text-basis font-semibold text-brand-deep">{bovenkop}</p> : null}
      {/* tabIndex -1: na een stapwissel zetten we de focus hierop, zodat een
          schermlezer de nieuwe vraag voorleest. */}
      <h1 tabIndex={-1} className="font-display text-h2 text-ink">
        {kop}
      </h1>
      {subkop ? <p className="mt-2 text-basis text-ink-soft">{subkop}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Belofte() {
  return (
    <p className="mt-3 flex items-start gap-2 text-klein text-ink-soft">
      <SlotIcon className="mt-0.5 h-4 w-4 shrink-0" />
      Je gegevens gaan alleen naar de vakmensen die op je aanvraag reageren.
    </p>
  );
}

function Zijkolom({ vakman }: { vakman?: Bedrijf }) {
  return (
    <aside className="hidden lg:block">
      {vakman ? (
        <div className="kaart p-5">
          <p className="font-display text-basis font-bold text-ink">Gekozen vakman</p>
          <div className="mt-4 overflow-hidden rounded-2xl">
            <Image
              src={vakman.foto}
              alt={`Werk van ${vakman.naam}`}
              width={720}
              height={580}
              className="h-[150px] w-full object-cover"
            />
          </div>
          <p className="mt-3 font-display text-basis font-bold leading-snug text-ink">{vakman.naam}</p>
          <div className="mt-2 flex items-center gap-2">
            <Rating score={vakman.score} />
            <span className="font-display text-basis font-bold text-ink">
              {vakman.score.toLocaleString("nl-NL")}
            </span>
            <span className="text-klein text-ink-soft">({vakman.reviews})</span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-brand-soft p-5">
          <p className="font-display text-basis font-bold text-ink">Al 6.300 aanvragen dit jaar</p>
          <p className="mt-2 text-basis text-ink-soft">
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
          <li key={punt} className="flex items-start gap-2.5 text-basis text-ink-soft">
            <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand" />
            {punt}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Na het versturen: bevestiging plus de weg naar het eigen overzicht. */
function Klaar({
  email,
  plaats,
  referentie,
  vakman,
  ontvangers,
  alIngelogd,
}: {
  email: string;
  plaats: string;
  referentie: string;
  vakman?: Bedrijf;
  /** Aantal vakmensen dat de aanvraag heeft ontvangen. */
  ontvangers: number;
  alIngelogd: boolean;
}) {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/12 text-brand-deep">
          <VinkjeTekentIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-h3 text-ink">
          {ontvangers === 0 ? "We hebben je aanvraag" : "Je aanvraag is verstuurd"}
        </h1>
        {/* Bij nul ontvangers geen belofte over reacties binnen een dag: voor deze
            dienst is in deze regio nog niemand aangesloten. */}
        <p className="mt-3 text-basis text-ink-soft">
          {ontvangers === 0 ? (
            <>
              Voor deze dienst hebben we in {plaats} nog geen vakmensen aangesloten. We gaan er zelf
              achteraan en laten het je weten op {email} zodra we iemand hebben gevonden. Duurt dat te
              lang, bel ons dan gerust.
            </>
          ) : (
            <>
              {vakman
                ? `${vakman.naam} en andere beschikbare vakmensen in ${plaats} kijken naar je vraag.`
                : `Je vraag ligt bij ${ontvangers} ${ontvangers === 1 ? "vakman" : "vakmensen"} in ${plaats}.`}{" "}
              De eerste reacties komen meestal binnen 24 uur binnen op {email}.
            </>
          )}
        </p>
        <p className="mt-4 text-klein text-ink-soft">
          Referentie <span className="font-semibold text-ink">{referentie}</span>
        </p>
      </div>

      <div className="kaart mx-auto mt-10 max-w-md p-6 sm:p-7">
        {alIngelogd ? (
          <>
            <h2 className="text-center font-display text-h4 text-ink">Je aanvraag staat in je overzicht</h2>
            <p className="mt-2 text-center text-basis text-ink-soft">
              Daar zie je de reacties binnenkomen, met de contactgegevens van wie er reageert.
            </p>
            <Link
              href="/account"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-ink font-display text-basis font-medium text-white transition hover:bg-brand-deep"
            >
              Naar mijn aanvragen
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-center font-display text-h4 text-ink">Wil je je aanvraag volgen?</h2>
            <p className="mt-2 text-center text-basis text-ink-soft">
              Maak een account met dit e-mailadres, dan staan alle reacties bij elkaar en zie je meteen wie er
              heeft gereageerd. Je eerdere aanvragen komen er vanzelf bij te staan.
            </p>
            <Link
              href={`/inloggen?modus=registreren&verder=${encodeURIComponent("/account")}`}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-ink font-display text-basis font-medium text-white transition hover:bg-brand-deep"
            >
              Account maken
            </Link>
          </>
        )}

        <Link
          href="/"
          transitionTypes={["nav-terug"]}
          className="mt-5 block text-center text-basis font-semibold text-ink-soft transition hover:text-ink"
        >
          Nee, dat hoeft niet
        </Link>
      </div>
    </div>
  );
}
