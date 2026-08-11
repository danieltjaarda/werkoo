import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChatIcon,
  CheckIcon,
  FotoIcon,
  KeurmerkIcon,
  MapPinIcon,
  PhoneIcon,
  QuoteIcon,
  TagIcon,
  ZegelIcon,
} from "@/components/icons";
import { Rating } from "@/components/rating";
import type { Troef } from "@/lib/content";
import { reviews, stappen, veelgesteldeVragen, videografen, voordelen } from "@/lib/content";

function SectionTitle({
  eyebrow,
  titel,
  tekst,
  licht = false,
}: {
  eyebrow: string;
  titel: string;
  tekst?: string;
  licht?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <p
        className={`font-display text-[13px] font-medium uppercase tracking-[0.14em] ${
          licht ? "text-turquoise" : "text-brand-deep"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[36px] ${
          licht ? "text-white" : "text-ink"
        }`}
      >
        {titel}
      </h2>
      {tekst ? (
        <p className={`mt-4 text-[16px] leading-relaxed ${licht ? "text-white/70" : "text-ink-soft"}`}>{tekst}</p>
      ) : null}
    </div>
  );
}

export function HoeHetWerkt() {
  return (
    <section id="zo-werkt-het" className="py-20 sm:py-24">
      <div className="container-page">
        <SectionTitle
          eyebrow="Zo werkt het"
          titel="Van vraag naar de juiste vakman in drie stappen"
          tekst="Jij hoeft niet het halve internet af. Eén aanvraag is genoeg."
        />

        <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
          {/* Doorlopende lijn tussen de stappen. */}
          <span aria-hidden className="absolute left-0 right-0 top-6 hidden border-t-2 border-dashed border-lijn md:block" />

          {stappen.map((stap, index) => (
            <li key={stap.titel} className="relative">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand font-display text-[18px] font-bold text-white ring-8 ring-white">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-[19px] font-bold text-ink">{stap.titel}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">{stap.tekst}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Voordelen() {
  return (
    <section className="bg-brand-soft py-20 sm:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionTitle
          eyebrow="Waarom Werkoo"
          titel="Wij nemen het uitzoekwerk over"
          tekst="Zodat jij je kunt bezighouden met de klus zelf, en niet met het vergelijken van tien websites."
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {voordelen.map((voordeel) => (
            <li key={voordeel.titel} className="rounded-3xl bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/12 text-brand-deep">
                <CheckIcon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-display text-[16px] font-bold text-ink">{voordeel.titel}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{voordeel.tekst}</p>
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
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium ${troefKleuren[troef.soort]}`}
    >
      <Icoon className="h-3.5 w-3.5" />
      {troef.label}
    </li>
  );
}

export function TopLijst({ plaats }: { plaats: string }) {
  return (
    <section id="videografen" className="py-20 sm:py-24">
      <div className="container-page">
        <SectionTitle
          eyebrow="In de buurt"
          titel={`Videografen die werken in ${plaats}`}
          tekst="Een greep uit de vakmensen die op dit moment opdrachten aannemen in deze regio."
        />

        <ul className="mt-12 space-y-4">
          {videografen.map((videograaf, index) => (
            <li
              key={videograaf.naam}
              className="rounded-3xl border border-lijn bg-white p-5 transition hover:border-brand hover:shadow-[0_18px_40px_-28px_rgba(18,20,26,0.35)] sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row">
                <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-2xl bg-brand-soft sm:h-[136px] sm:w-[168px]">
                  <Image
                    src={videograaf.foto}
                    alt={`Werk van ${videograaf.naam}`}
                    width={720}
                    height={580}
                    sizes="(min-width: 640px) 168px, 100vw"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-ink/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
                    <FotoIcon className="h-3 w-3" />
                    {videograaf.fotos}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <h3 className="font-display text-[17px] font-bold leading-snug text-ink">
                      <Link
                        href="/aanvraag?dienst=videograaf"
                        className="text-brand-deep underline-offset-4 hover:underline"
                      >
                        {index + 1}. {videograaf.naam} – {videograaf.belofte}
                      </Link>
                    </h3>

                    <div className="flex shrink-0 items-center gap-3">
                      {videograaf.topPro ? (
                        <span className="flex items-center gap-1.5 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-ink">
                          <KeurmerkIcon className="h-[18px] w-[18px] text-brand" />
                          Top pro
                        </span>
                      ) : null}
                      <span className="font-display text-[20px] font-bold leading-none text-ink">
                        {videograaf.score.toLocaleString("nl-NL")}
                      </span>
                      <Rating score={videograaf.score} formaat="groot" />
                      <span className="text-[13px] text-ink-soft">({videograaf.reviews})</span>
                    </div>
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-2">
                    {videograaf.troeven.map((troef) => (
                      <TroefLabel key={troef.label} troef={troef} />
                    ))}
                  </ul>

                  <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{videograaf.tekst}</p>

                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-soft">
                    <li className="flex items-center gap-1.5">
                      <MapPinIcon className="h-4 w-4 text-ink-soft/70" />
                      {videograaf.adres}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <ZegelIcon className="h-4 w-4 text-ink-soft/70" />
                      {videograaf.jaren} jaar in bedrijf
                    </li>
                    <li className="flex items-center gap-1.5">
                      <PhoneIcon className="h-4 w-4 text-ink-soft/70" />
                      <a
                        href={`tel:${videograaf.telefoon.replace(/\s/g, "")}`}
                        className="text-brand-deep underline underline-offset-4"
                      >
                        {videograaf.telefoon}
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col justify-end gap-2 lg:w-[220px] lg:shrink-0">
                  <Link
                    href="/aanvraag?dienst=videograaf"
                    className="flex items-center justify-center rounded-xl border border-brand px-4 py-3 font-display text-[14px] font-semibold text-brand-deep transition hover:bg-brand-soft"
                  >
                    Start jouw project
                  </Link>
                  <Link
                    href="/aanvraag?dienst=videograaf"
                    className="flex items-center justify-center rounded-xl bg-zon px-4 py-3 font-display text-[14px] font-semibold text-ink transition hover:brightness-95"
                  >
                    Check beschikbaarheid
                  </Link>
                  <p className="flex items-center justify-center gap-1.5 text-[12px] text-ink-soft">
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

export function Beoordelingen() {
  return (
    <section id="ervaringen" className="bg-ink py-20 text-white sm:py-24">
      <div className="container-page">
        <SectionTitle eyebrow="Ervaringen" titel="Wat mensen achteraf vertellen" licht />

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.naam} className="rounded-3xl bg-white/[0.06] p-7">
              <QuoteIcon className="h-7 w-7 text-turquoise/70" />
              <p className="mt-4 text-[15px] leading-relaxed text-white/85">{review.tekst}</p>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <p className="text-[13px] font-semibold">
                  {review.naam}
                  <span className="ml-1.5 font-normal text-white/50">{review.plaats}</span>
                </p>
                <Rating score={review.score} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="vragen" className="py-20 sm:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionTitle
          eyebrow="Vragen"
          titel="Dit willen mensen meestal weten"
          tekst="Zit jouw vraag er niet bij? Stel hem via de chat, meestal antwoorden we binnen een paar minuten."
        />

        <div className="divide-y divide-lijn border-y border-lijn">
          {veelgesteldeVragen.map((item) => (
            <details key={item.vraag} className="uitklapper group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[16px] font-medium text-ink transition-colors marker:content-[''] hover:text-brand-deep">
                {item.vraag}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-deep transition duration-300 group-open:bg-ink group-open:text-white">
                  <span className="relative h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-180">
                    <span className="absolute left-0 top-1/2 h-0.5 w-3.5 -translate-y-1/2 rounded bg-current" />
                    <span className="absolute left-1/2 top-0 h-3.5 w-0.5 -translate-x-1/2 rounded bg-current transition-transform duration-300 group-open:scale-y-0" />
                  </span>
                </span>
              </summary>
              <p className="max-w-2xl pt-3 text-[15px] leading-relaxed text-ink-soft">{item.antwoord}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SlotCta({ plaats }: { plaats: string }) {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="container-page">
        <div className="flex flex-col items-start gap-7 rounded-[32px] bg-ink px-8 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <div>
            <h2 className="max-w-lg font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[32px]">
              Zullen we kijken wie er vrij is in {plaats}?
            </h2>
            <p className="mt-3 text-[15px] text-white/65">
              Eén formulier, een paar reacties, en jij beslist. Meer is het niet.
            </p>
          </div>
          <Link
            href="/aanvraag?dienst=videograaf"
            className="flex h-13 shrink-0 items-center gap-2 rounded-2xl bg-zon px-7 font-display text-[15px] font-medium text-ink transition hover:bg-zon-dark"
          >
            Begin je aanvraag
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
