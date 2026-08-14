import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BladIcon,
  ChatIcon,
  CheckIcon,
  EuroIcon,
  FeestIcon,
  FotoIcon,
  HuisIcon,
  KeurmerkIcon,
  KofferIcon,
  LampIcon,
  MapPinIcon,
  PersoonIcon,
  PhoneIcon,
  QuoteIcon,
  TagIcon,
  TuinIcon,
  ZegelIcon,
} from "@/components/icons";
import { Rating } from "@/components/rating";
import { UitgelichtLabel } from "@/components/uitgelicht-label";
import { reviewsVoorDienst, stappen, voordelen } from "@/lib/content";
import {
  categorieen,
  deelLidwoord,
  dienstenVanCategorie,
  getCategorie,
  verwanteDiensten,
  type CategorieId,
  type Dienst,
  type Vraag,
} from "@/lib/diensten";
import { bedrijvenVoorDienst, type Troef } from "@/lib/aanvragen";

export const categorieIconen: Record<CategorieId, (props: { className?: string }) => React.ReactElement> = {
  verbouwen: HuisIcon,
  "huis-tuin": TuinIcon,
  duurzaam: BladIcon,
  persoonlijk: PersoonIcon,
  zakelijk: KofferIcon,
  evenementen: FeestIcon,
};

export function SectionTitle({
  eyebrow,
  titel,
  tekst,
  licht = false,
  gecentreerd = false,
}: {
  eyebrow: string;
  titel: string;
  tekst?: string;
  licht?: boolean;
  gecentreerd?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${gecentreerd ? "mx-auto text-center" : ""}`}>
      <p
        className={`font-display text-klein font-medium uppercase tracking-[0.14em] ${
          licht ? "text-turquoise" : "text-brand-deep"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className={`mt-3 font-display text-h2 text-balance ${licht ? "text-white" : "text-ink"}`}>{titel}</h2>
      {tekst ? (
        <p className={`mt-4 text-lees ${licht ? "text-white/70" : "text-ink-soft"}`}>{tekst}</p>
      ) : null}
    </div>
  );
}

export function HoeHetWerkt() {
  return (
    <section id="zo-werkt-het" className="sectie bg-brand-soft">
      <div className="container-page">
        <SectionTitle
          eyebrow="Zo werkt het"
          titel="Van vraag naar de juiste vakman in drie stappen"
          tekst="Jij hoeft niet het halve internet af. Eén aanvraag is genoeg."
        />

        <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
          {/* Doorlopende lijn tussen de stappen. */}
          <span
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden border-t-2 border-dashed border-lijn md:block"
          />

          {stappen.map((stap, index) => (
            <li key={stap.titel} className="relative">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-deep font-display text-h5 text-white ring-8 ring-brand-soft">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-h4 text-ink">{stap.titel}</h3>
              <p className="mt-2.5 text-basis text-ink-soft">{stap.tekst}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Voordelen({ dienstSlug }: { dienstSlug?: string }) {
  return (
    <section className="sectie">
      <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14">
        <div>
          <SectionTitle
            eyebrow="Waarom Werkoo"
            titel="Wij nemen het uitzoekwerk over"
            tekst="Zodat jij je kunt bezighouden met de klus zelf, en niet met het vergelijken van tien websites."
          />
          <Link
            href={dienstSlug ? `/aanvraag?dienst=${dienstSlug}` : "/aanvraag"}
            transitionTypes={["nav-vooruit"]}
            className="mt-7 inline-flex h-veld items-center gap-2 rounded-2xl bg-ink px-6 font-display text-basis font-medium text-white transition hover:bg-brand-deep"
          >
            Begin je aanvraag
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {voordelen.map((voordeel) => (
            <li key={voordeel.titel} className="kaart p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/12 text-brand-deep">
                <CheckIcon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-display text-h5 text-ink">{voordeel.titel}</h3>
              <p className="mt-2 text-basis text-ink-soft">{voordeel.tekst}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const troefKleuren: Record<Troef["soort"], string> = {
  aanbod: "bg-emerald-50 text-emerald-700",
  snelheid: "bg-brand-soft text-brand-deep",
  keurmerk: "bg-amber-50 text-amber-700",
};

function TroefLabel({ troef }: { troef: Troef }) {
  const Icoon = troef.soort === "aanbod" ? TagIcon : troef.soort === "snelheid" ? ChatIcon : KeurmerkIcon;

  return (
    <li
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-mini font-medium ${troefKleuren[troef.soort]}`}
    >
      <Icoon className="h-3.5 w-3.5" />
      {troef.label}
    </li>
  );
}

export async function TopLijst({ dienst, plaats }: { dienst: Dienst; plaats: string }) {
  const lijst = await bedrijvenVoorDienst(dienst.slug, plaats);
  if (lijst.length === 0) return null;

  // De plaats meegeven, anders begint de flow weer bij "de buurt" en krijgt de
  // bezoeker een lijst die niet bij zijn regio hoort.
  const aanvraagPad = `/aanvraag?dienst=${dienst.slug}&plaats=${encodeURIComponent(plaats)}`;

  return (
    <section id="vakmensen" className="sectie">
      <div className="container-page">
        <SectionTitle
          eyebrow="In de buurt"
          titel={`${dienst.menuLabel} die werken in ${plaats}`}
          tekst="Een greep uit de vakmensen die op dit moment opdrachten aannemen in deze regio."
        />

        <ul className="mt-10 space-y-4">
          {lijst.map((vakman, index) => (
            <li
              key={vakman.slug}
              className="kaart p-5 transition hover:border-brand hover:shadow-kaart-op sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row">
                <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-2xl bg-brand-soft sm:h-[136px] sm:w-[168px]">
                  {/* Wie zich net heeft aangemeld heeft nog geen foto; een lege src
                      geeft een gebroken plaatje, dus dan tonen we de beginletter. */}
                  {vakman.foto ? (
                    <Image
                      src={vakman.foto}
                      alt={`Werk van ${vakman.naam}`}
                      width={720}
                      height={580}
                      sizes="(min-width: 640px) 168px, 100vw"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-display text-h2 text-brand-deep">
                      {vakman.naam.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {vakman.fotos > 0 ? (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-ink/70 px-1.5 py-0.5 text-mini font-medium text-white">
                      <FotoIcon className="h-3 w-3" />
                      {vakman.fotos}
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Naam op een eigen regel; het cijfer eronder, anders wordt de kop een rommeltje. */}
                  <h3 className="font-display text-h5 text-ink">
                    <Link
                      href={`${aanvraagPad}&vakman=${vakman.slug}`}
                      transitionTypes={["nav-vooruit"]}
                      className="text-brand-deep underline-offset-4 hover:underline"
                    >
                      {index + 1}. {vakman.naam}
                      {vakman.belofte ? ` – ${vakman.belofte}` : ""}
                    </Link>
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-display text-h4 leading-none text-ink">
                      {vakman.score.toLocaleString("nl-NL")}
                    </span>
                    <Rating score={vakman.score} />
                    <span className="text-klein text-ink-soft">({vakman.reviews} beoordelingen)</span>
                    {vakman.topPro ? (
                      <span className="flex items-center gap-1.5 font-display text-mini font-bold uppercase tracking-[0.08em] text-ink">
                        <KeurmerkIcon className="h-[18px] w-[18px] text-brand" />
                        Top pro
                      </span>
                    ) : null}
                    {vakman.uitgelicht ? <UitgelichtLabel /> : null}
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-2">
                    {vakman.troeven.map((troef) => (
                      <TroefLabel key={troef.label} troef={troef} />
                    ))}
                  </ul>

                  <p className="mt-3 text-basis text-ink-soft">{vakman.tekst}</p>

                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-klein text-ink-soft">
                    <li className="flex items-center gap-1.5">
                      <MapPinIcon className="h-4 w-4 text-ink-soft/70" />
                      {vakman.adres}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <ZegelIcon className="h-4 w-4 text-ink-soft/70" />
                      {vakman.jaren} jaar in bedrijf
                    </li>
                    <li className="flex items-center gap-1.5">
                      <PhoneIcon className="h-4 w-4 text-ink-soft/70" />
                      <a
                        href={`tel:${vakman.telefoon.replace(/\s/g, "")}`}
                        className="text-brand-deep underline underline-offset-4"
                      >
                        {vakman.telefoon}
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col justify-end gap-2 lg:w-[220px] lg:shrink-0">
                  <Link
                    href={`${aanvraagPad}&vakman=${vakman.slug}`}
                    transitionTypes={["nav-vooruit"]}
                    className="flex items-center justify-center rounded-xl border border-brand px-4 py-3 font-display text-basis font-semibold text-brand-deep transition hover:bg-brand-soft"
                  >
                    Start jouw project
                  </Link>
                  <Link
                    href={`${aanvraagPad}&vakman=${vakman.slug}`}
                    transitionTypes={["nav-vooruit"]}
                    className="flex items-center justify-center rounded-xl bg-zon px-4 py-3 font-display text-basis font-semibold text-ink transition hover:bg-zon-dark"
                  >
                    Check beschikbaarheid
                  </Link>
                  <p className="flex items-center justify-center gap-1.5 text-mini text-ink-soft">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                    Gratis en vrijblijvend
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Wat het werk ongeveer kost, plus waar de prijs van afhangt. */
export function Prijsindicatie({ dienst }: { dienst: Dienst }) {
  return (
    <section id="prijzen" className="sectie">
      <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14">
        <SectionTitle
          eyebrow="Prijzen"
          titel={`Wat kost een ${deelLidwoord(dienst).naam}?`}
          tekst="Een richtprijs om je verwachting bij te stellen. Wat jouw klus kost hangt af van de omvang, en dat lees je pas echt af aan de reacties op je aanvraag."
        />

        <div className="kaart p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/12 text-brand-deep">
            <EuroIcon className="h-5 w-5" />
          </span>
          <p className="mt-5 text-lead text-ink">{dienst.prijs}</p>
          <p className="mt-5 border-t border-lijn pt-5 text-klein text-ink-soft">
            Bedragen zijn indicatief en gelden inclusief btw voor particulieren, tenzij een vakman iets anders
            aangeeft in zijn reactie.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Drie controlepunten die een leek niet kent. */
export function WaarOpLetten({ dienst }: { dienst: Dienst }) {
  return (
    <section className="sectie bg-ink text-white">
      <div className="container-page">
        <SectionTitle
          eyebrow="Voor je kiest"
          titel={`Waar je op let bij het kiezen van ${dienst.lidwoordNaam}`}
          licht
        />

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {dienst.letOp.map((punt) => (
            <li key={punt} className="rounded-3xl bg-white/[0.06] p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-turquoise/15 text-turquoise">
                <LampIcon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-basis text-white/85">{punt}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Beoordelingen({ dienstSlug }: { dienstSlug?: string }) {
  const reviews = reviewsVoorDienst(dienstSlug);

  return (
    <section id="ervaringen" className="sectie bg-brand-soft">
      <div className="container-page">
        <SectionTitle eyebrow="Ervaringen" titel="Wat mensen achteraf vertellen" />

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.naam} className="kaart p-7">
              <QuoteIcon className="h-7 w-7 text-brand/50" />
              <p className="mt-4 text-basis text-ink">{review.tekst}</p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-lijn pt-4">
                <p className="min-w-0 text-klein font-semibold text-ink">
                  {review.naam}
                  <span className="ml-1.5 font-normal text-ink-soft">{review.plaats}</span>
                </p>
                <Rating score={review.score} className="shrink-0" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq({ vragen }: { vragen: Vraag[] }) {
  return (
    <section id="vragen" className="sectie">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        {/* De titel loopt mee: de vragenlijst is een stuk langer dan de kop ernaast. */}
        <div className="lg:sticky lg:top-[calc(var(--hoogte-kop)+2rem)] lg:self-start">
          <SectionTitle
            eyebrow="Vragen"
            titel="Dit willen mensen meestal weten"
            tekst="Zit jouw vraag er niet bij? Stel hem via de chat, meestal antwoorden we binnen een paar minuten."
          />
        </div>

        <div className="divide-y divide-lijn border-y border-lijn">
          {vragen.map((item) => (
            <details key={item.vraag} className="uitklapper group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lees font-medium text-ink transition-colors marker:content-[''] hover:text-brand-deep">
                {item.vraag}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-deep transition duration-300 group-open:bg-ink group-open:text-white">
                  <span className="relative h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-180">
                    <span className="absolute left-0 top-1/2 h-0.5 w-3.5 -translate-y-1/2 rounded bg-current" />
                    <span className="absolute left-1/2 top-0 h-3.5 w-0.5 -translate-x-1/2 rounded bg-current transition-transform duration-300 group-open:scale-y-0" />
                  </span>
                </span>
              </summary>
              <p className="max-w-2xl pt-3 text-basis text-ink-soft">{item.antwoord}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Doorverwijzing naar de buren binnen dezelfde categorie. */
export function VerwanteDiensten({ dienst }: { dienst: Dienst }) {
  const buren = verwanteDiensten(dienst, 8);
  if (buren.length === 0) return null;

  const categorie = getCategorie(dienst.categorie);

  return (
    <section className="sectie-onder">
      <div className="container-page">
        <div className="rounded-3xl border border-lijn bg-brand-soft/60 p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-h4 text-ink">Ook gezocht in {categorie.titel}</h2>
            <Link
              href={`/diensten/${categorie.slug}`}
              className="flex items-center gap-1.5 text-basis font-semibold text-brand-deep underline-offset-4 hover:underline"
            >
              Hele categorie
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <ul className="mt-5 flex flex-wrap gap-2">
            {buren.map((buur) => (
              <li key={buur.slug}>
                <Link
                  href={`/${buur.slug}`}
                  className="flex rounded-full border border-lijn bg-white px-4 py-2 text-basis text-ink transition hover:border-brand hover:text-brand-deep"
                >
                  {buur.menuLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** De zes categorieën als kaarten, met een greep uit wat eronder valt. */
export function CategorieRaster({ toonAlles = false }: { toonAlles?: boolean }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categorieen.map((categorie) => {
        const lijst = dienstenVanCategorie(categorie.id);
        const Icoon = categorieIconen[categorie.id];
        const zichtbaar = toonAlles ? lijst : lijst.slice(0, 5);

        return (
          <li key={categorie.id} className="kaart relative flex flex-col p-6 transition hover:shadow-kaart-op">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/12 text-brand-deep">
              <Icoon className="h-5 w-5" />
            </span>

            <h3 className="mt-5 font-display text-h4 text-ink">
              <Link href={`/diensten/${categorie.slug}`} className="kaart-link underline-offset-4 hover:underline">
                {categorie.titel}
              </Link>
            </h3>
            <p className="mt-2 text-basis text-ink-soft">{categorie.omschrijving}</p>

            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-klein text-ink-soft">
              {zichtbaar.map((dienst) => (
                <li key={dienst.slug} className="after:ml-2 after:text-ink-soft/40 after:content-['·'] last:after:content-['']">
                  {dienst.menuLabel}
                </li>
              ))}
            </ul>

            <p className="mt-auto flex items-center gap-1.5 pt-6 text-basis font-semibold text-brand-deep">
              Alle {lijst.length} diensten
              <ArrowRightIcon className="h-4 w-4" />
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function SlotCta({ dienst, plaats }: { dienst?: Dienst; plaats: string }) {
  return (
    <section className="sectie-onder">
      <div className="container-page">
        <div className="flex flex-col items-start gap-7 rounded-3xl bg-ink px-8 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <div>
            <h2 className="max-w-lg font-display text-h3 text-white">
              Zullen we kijken wie er vrij is in {plaats}?
            </h2>
            <p className="mt-3 text-basis text-white/65">
              Eén formulier, een paar reacties, en jij beslist. Meer is het niet.
            </p>
          </div>
          <Link
            href={dienst ? `/aanvraag?dienst=${dienst.slug}` : "/aanvraag"}
            transitionTypes={["nav-vooruit"]}
            className="flex h-veld shrink-0 items-center gap-2 rounded-2xl bg-zon px-7 font-display text-basis font-medium text-ink transition hover:bg-zon-dark"
          >
            Begin je aanvraag
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
