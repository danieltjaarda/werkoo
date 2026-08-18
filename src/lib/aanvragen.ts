import "server-only";
import { randomBytes } from "node:crypto";
import { vraag, vraagEen, vraagZacht } from "@/lib/db";
import { provincieVanPlaats } from "@/lib/provincies";

export type Troef = {
  label: string;
  soort: "aanbod" | "snelheid" | "keurmerk";
};

/** Een bedrijfsprofiel zoals het in de openbare lijsten staat. */
export type Bedrijf = {
  id: string;
  slug: string;
  naam: string;
  plaats: string;
  adres: string;
  telefoon: string;
  belofte: string;
  tekst: string;
  jaren: number;
  foto: string;
  score: number;
  reviews: number;
  fotos: number;
  topPro: boolean;
  uitgelicht: boolean;
  troeven: Troef[];
};

export type Status = "nieuw" | "in_behandeling" | "gereageerd" | "gewonnen" | "verloren";

/**
 * Postgres valt om op een uuid-kolom zodra je er iets in stopt wat geen uuid is,
 * en dat werd een 500 in plaats van een nette 404. Daarom eerst zelf kijken.
 */
export function isUuid(waarde: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(waarde);
}

export const statusLabels: Record<Status, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  gereageerd: "Gereageerd",
  gewonnen: "Gewonnen",
  verloren: "Niet doorgegaan",
};

type BedrijfRij = Omit<Bedrijf, "troeven" | "topPro" | "score"> & {
  top_pro: boolean;
  score: string;
};

const BEDRIJF_KOLOMMEN = `b.id, b.slug, b.naam, b.plaats, b.adres, b.telefoon, b.belofte,
  b.tekst, b.jaren, b.foto, b.score, b.reviews, b.fotos, b.top_pro, b.uitgelicht`;

/** Postgres geeft numeric als string terug; die zetten we hier één keer om. */
async function metTroeven(rijen: BedrijfRij[]): Promise<Bedrijf[]> {
  if (rijen.length === 0) return [];

  const troeven = await vraag<{ bedrijf_id: string; label: string; soort: Troef["soort"] }>(
    "select bedrijf_id, label, soort from bedrijf_troeven where bedrijf_id = any($1) order by volgorde",
    [rijen.map((r) => r.id)],
  );

  return rijen.map(({ top_pro, score, ...rest }) => ({
    ...rest,
    topPro: top_pro,
    score: Number(score),
    troeven: troeven.filter((t) => t.bedrijf_id === rest.id).map(({ label, soort }) => ({ label, soort })),
  }));
}

/**
 * De bedrijven die een dienst aanbieden, in de volgorde waarin we ze tonen:
 * uitgelichte partners eerst, dan wie in de gevraagde plaats zit, dan het
 * hoogste cijfer. We filteren niet op plaats — dan houdt iemand buiten de regio
 * een lege lijst over — maar wie een werkgebied heeft ingesteld valt er buiten
 * als de plaats daar niet in zit.
 *
 * Kennen we de plaats niet, dan slaan we het werkgebied én de plaatsvoorrang
 * over. Anders sluit een lege plaats iedereen mét werkgebied uit, en krijgt een
 * bedrijf zonder ingevulde plaats de voorrang cadeau omdat een lege string aan
 * een lege string gelijk is.
 */
export async function bedrijvenVoorDienst(dienstSlug: string, plaats = ""): Promise<Bedrijf[]> {
  return vraagZacht(() => haalBedrijven(dienstSlug, plaats), [], "de lijst met vakmensen");
}

/**
 * Het werkgebied van een bedrijf bestaat uit provincies (van de kaart) en/of
 * losse plaatsen. Niets ingesteld betekent: heel Nederland. Een plaats past
 * als hij letterlijk in de lijst staat óf in een aangevinkte provincie ligt.
 */
async function haalBedrijven(dienstSlug: string, plaats: string): Promise<Bedrijf[]> {
  const provincie = plaats ? await provincieVanPlaats(plaats) : "";
  const rijen = await vraag<BedrijfRij>(
    `select ${BEDRIJF_KOLOMMEN}
       from bedrijven b
       join bedrijf_diensten d on d.bedrijf_id = b.id and d.dienst = $1
      where b.actief
        and (
          $2 = ''
          or (
            not exists (select 1 from bedrijf_plaatsen p where p.bedrijf_id = b.id)
            and not exists (select 1 from bedrijf_provincies v where v.bedrijf_id = b.id)
          )
          or exists (
            select 1 from bedrijf_plaatsen p
             where p.bedrijf_id = b.id and lower(p.plaats) = lower($2)
          )
          or ($3 <> '' and exists (
            select 1 from bedrijf_provincies v
             where v.bedrijf_id = b.id and v.provincie = $3
          ))
        )
      order by b.uitgelicht desc, ($2 <> '' and lower(b.plaats) = lower($2)) desc, b.score desc, b.naam`,
    [dienstSlug, plaats, provincie],
  );

  return metTroeven(rijen);
}

/** Eén profiel op slug. Met een dienst erbij controleren we of hij die ook aanbiedt. */
export async function bedrijfVanSlug(slug: string, dienstSlug?: string): Promise<Bedrijf | undefined> {
  return vraagZacht(() => haalBedrijf(slug, dienstSlug), undefined, "een bedrijfsprofiel");
}

async function haalBedrijf(slug: string, dienstSlug?: string): Promise<Bedrijf | undefined> {
  const rijen = await vraag<BedrijfRij>(
    `select ${BEDRIJF_KOLOMMEN}
       from bedrijven b
      where b.slug = $1 and b.actief
        and ($2::text is null or exists (
          select 1 from bedrijf_diensten d where d.bedrijf_id = b.id and d.dienst = $2
        ))`,
    [slug, dienstSlug ?? null],
  );
  return (await metTroeven(rijen))[0];
}

/**
 * Welke diensten profielen hebben. Dit draait tijdens de build (voor
 * generateStaticParams en de sitemap), dus het mag de build niet kunnen slopen:
 * zonder database komt er een lege verzameling uit en worden er simpelweg geen
 * plaatspagina's vooraf gebouwd.
 */
export async function dienstenMetBedrijven(): Promise<Set<string>> {
  return vraagZacht(
    async () => {
      const rijen = await vraag<{ dienst: string }>(
        `select distinct d.dienst
           from bedrijf_diensten d
           join bedrijven b on b.id = d.bedrijf_id and b.actief`,
      );
      return new Set(rijen.map((r) => r.dienst));
    },
    new Set<string>(),
    "de diensten met profielen",
  );
}

/** Dagen waarop dit bedrijf al vol zit, als "2026-08-21". */
export async function bezetteDagen(bedrijfId: string): Promise<string[]> {
  return vraagZacht(
    async () => {
      const rijen = await vraag<{ dag: string }>(
        "select to_char(datum, 'YYYY-MM-DD') as dag from bedrijf_bezet where bedrijf_id = $1",
        [bedrijfId],
      );
      return rijen.map((r) => r.dag);
    },
    [],
    "de beschikbaarheid",
  );
}

export type NieuweAanvraag = {
  dienst: string;
  type: string;
  plaats: string;
  adres: string;
  wensen: string;
  dagen: string[];
  naam: string;
  email: string;
  telefoon: string;
  whatsapp: boolean;
  /** Slugs die de bezoeker zelf aanvinkte; leeg betekent: kies jij maar. */
  bedrijfSlugs: string[];
  gebruikerId?: string | null;
};

/** Zoveel bedrijven krijgen een aanvraag als de bezoeker niet zelf koos. */
const MAX_ONTVANGERS = 4;

export async function bewaarAanvraag(
  invoer: NieuweAanvraag,
): Promise<{ id: string; referentie: string; ontvangers: number }> {
  const referentie = `WK-${randomBytes(6).toString("hex").toUpperCase()}`;

  /**
   * Hoort dit adres al bij een account, dan hangt de aanvraag daar meteen aan.
   * Deze richting is veilig: je geeft iemand hooguit een aanvraag die hij niet
   * heeft gedaan. De omgekeerde koppeling — bij registratie — is dat niet, en
   * gebeurt daarom niet (zie de opmerking in `registreren`).
   */
  const eigenaar =
    invoer.gebruikerId ??
    (
      await vraagEen<{ id: string }>("select id from gebruikers where email = $1", [
        invoer.email.toLowerCase(),
      ])
    )?.id ??
    null;

  const provincie = await provincieVanPlaats(invoer.plaats);

  const aanvraag = await vraagEen<{ id: string }>(
    `insert into aanvragen
       (referentie, gebruiker_id, dienst, type, plaats, adres, wensen, dagen, naam, email, telefoon, whatsapp, provincie)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     returning id`,
    [
      referentie,
      eigenaar,
      invoer.dienst,
      invoer.type,
      invoer.plaats,
      invoer.adres,
      invoer.wensen,
      invoer.dagen,
      invoer.naam,
      invoer.email.toLowerCase(),
      invoer.telefoon,
      invoer.whatsapp,
      provincie,
    ],
  );

  if (!aanvraag) throw new Error("De aanvraag kon niet worden opgeslagen.");

  /**
   * Wat de browser meestuurt is een wens, geen opdracht. We halen zelf op wie
   * deze dienst in deze plaats doet en leggen de aangevinkte bedrijven daarnaast.
   * Zo blijft het werkgebied dat een vakman instelde overeind, ook als iemand de
   * lijst in de browser aanpast of onderweg een andere plaats invult, en kan
   * niemand de aanvraag naar alle bedrijven tegelijk sturen.
   */
  const mogelijk = await bedrijvenVoorDienst(invoer.dienst, invoer.plaats);
  const gewenst = new Set(invoer.bedrijfSlugs);
  const gekozen = (gewenst.size ? mogelijk.filter((b) => gewenst.has(b.slug)) : mogelijk).slice(
    0,
    MAX_ONTVANGERS,
  );

  for (const bedrijf of gekozen) {
    await vraagEen(
      "insert into aanvraag_bedrijven (aanvraag_id, bedrijf_id) values ($1, $2) on conflict do nothing",
      [aanvraag.id, bedrijf.id],
    );
  }

  return { id: aanvraag.id, referentie, ontvangers: gekozen.length };
}

export type AanvraagRij = {
  id: string;
  referentie: string;
  dienst: string;
  type: string;
  plaats: string;
  adres: string;
  wensen: string;
  dagen: string[];
  naam: string;
  email: string;
  telefoon: string;
  whatsapp: boolean;
  aangemaakt_op: Date;
};

export type Reactie = {
  id: string;
  bedrijf_naam: string;
  bedrijf_slug: string;
  bedrijf_telefoon: string;
  bericht: string;
  prijs: string;
  aangemaakt_op: Date;
};

/** De aanvragen van één bezoeker, met het aantal reacties erbij. */
export async function aanvragenVanGebruiker(gebruikerId: string) {
  return vraag<AanvraagRij & { reacties: number; ontvangers: number }>(
    `select a.*,
            (select count(*)::int from reacties r where r.aanvraag_id = a.id) as reacties,
            (select count(*)::int from aanvraag_bedrijven ab where ab.aanvraag_id = a.id) as ontvangers
       from aanvragen a
      where a.gebruiker_id = $1
      order by a.aangemaakt_op desc`,
    [gebruikerId],
  );
}

export async function aanvraagVanGebruiker(referentie: string, gebruikerId: string) {
  const aanvraag = await vraagEen<AanvraagRij & { ontvangers: number }>(
    `select a.*,
            (select count(*)::int from aanvraag_bedrijven ab where ab.aanvraag_id = a.id) as ontvangers
       from aanvragen a
      where a.referentie = $1 and a.gebruiker_id = $2`,
    [referentie, gebruikerId],
  );
  if (!aanvraag) return undefined;

  const reacties = await vraag<Reactie>(
    `select r.id, b.naam as bedrijf_naam, b.slug as bedrijf_slug, b.telefoon as bedrijf_telefoon,
            r.bericht, r.prijs, r.aangemaakt_op
       from reacties r
       join bedrijven b on b.id = r.bedrijf_id
      where r.aanvraag_id = $1
      order by r.aangemaakt_op`,
    [aanvraag.id],
  );

  return { aanvraag, reacties };
}

/** De aanvragen die bij één bedrijf binnenkwamen. */
export async function aanvragenVanBedrijf(bedrijfId: string) {
  return vraag<AanvraagRij & { status: Status; heeft_reactie: boolean }>(
    `select a.*, ab.status,
            exists (select 1 from reacties r where r.aanvraag_id = a.id and r.bedrijf_id = $1) as heeft_reactie
       from aanvraag_bedrijven ab
       join aanvragen a on a.id = ab.aanvraag_id
      where ab.bedrijf_id = $1
      order by a.aangemaakt_op desc`,
    [bedrijfId],
  );
}

export async function aanvraagVanBedrijf(aanvraagId: string, bedrijfId: string) {
  if (!isUuid(aanvraagId)) return undefined;

  const aanvraag = await vraagEen<AanvraagRij & { status: Status }>(
    `select a.*, ab.status
       from aanvraag_bedrijven ab
       join aanvragen a on a.id = ab.aanvraag_id
      where ab.bedrijf_id = $1 and a.id = $2`,
    [bedrijfId, aanvraagId],
  );
  if (!aanvraag) return undefined;

  const reacties = await vraag<Reactie>(
    `select r.id, b.naam as bedrijf_naam, b.slug as bedrijf_slug, b.telefoon as bedrijf_telefoon,
            r.bericht, r.prijs, r.aangemaakt_op
       from reacties r join bedrijven b on b.id = r.bedrijf_id
      where r.aanvraag_id = $1 and r.bedrijf_id = $2
      order by r.aangemaakt_op`,
    [aanvraag.id, bedrijfId],
  );

  return { aanvraag, reacties };
}

export async function zetStatus(aanvraagId: string, bedrijfId: string, status: Status): Promise<void> {
  await vraagEen(
    "update aanvraag_bedrijven set status = $3, gewijzigd_op = now() where aanvraag_id = $1 and bedrijf_id = $2",
    [aanvraagId, bedrijfId, status],
  );
}

export async function bewaarReactie(
  aanvraagId: string,
  bedrijfId: string,
  bericht: string,
  prijs: string,
): Promise<void> {
  await vraagEen(
    "insert into reacties (aanvraag_id, bedrijf_id, bericht, prijs) values ($1,$2,$3,$4)",
    [aanvraagId, bedrijfId, bericht, prijs],
  );
  // Reageren zet de status vanzelf door; handmatig bijwerken kan daarna nog.
  await vraagEen(
    `update aanvraag_bedrijven set status = 'gereageerd', gewijzigd_op = now()
      where aanvraag_id = $1 and bedrijf_id = $2 and status in ('nieuw', 'in_behandeling')`,
    [aanvraagId, bedrijfId],
  );
}

/** Cijfers voor het dashboard van een vakman. */
export async function cijfersVanBedrijf(bedrijfId: string) {
  const rij = await vraagEen<{
    totaal: number;
    open: number;
    gereageerd: number;
    gewonnen: number;
    deze_maand: number;
  }>(
    `select count(*)::int as totaal,
            count(*) filter (where status in ('nieuw','in_behandeling'))::int as open,
            count(*) filter (where status = 'gereageerd')::int as gereageerd,
            count(*) filter (where status = 'gewonnen')::int as gewonnen,
            count(*) filter (where a.aangemaakt_op > now() - interval '30 days')::int as deze_maand
       from aanvraag_bedrijven ab
       join aanvragen a on a.id = ab.aanvraag_id
      where ab.bedrijf_id = $1`,
    [bedrijfId],
  );

  return rij ?? { totaal: 0, open: 0, gereageerd: 0, gewonnen: 0, deze_maand: 0 };
}

export type Profiel = {
  bedrijf: Bedrijf;
  /** Slugs van de diensten die dit bedrijf doet, in catalogusvolgorde. */
  diensten: string[];
  /** Plaatsen in het werkgebied; leeg betekent: heel het land. */
  plaatsen: string[];
  /** Provincies in het werkgebied, van de kaart. */
  provincies: string[];
};

/** Alles voor de openbare profielpagina van één bedrijf. */
export async function profielVanSlug(slug: string): Promise<Profiel | undefined> {
  return vraagZacht(
    async () => {
      const bedrijf = await haalBedrijf(slug);
      if (!bedrijf) return undefined;
      const [diensten, plaatsen, provincies] = await Promise.all([
        vraag<{ dienst: string }>("select dienst from bedrijf_diensten where bedrijf_id = $1", [bedrijf.id]),
        vraag<{ plaats: string }>("select plaats from bedrijf_plaatsen where bedrijf_id = $1 order by plaats", [bedrijf.id]),
        vraag<{ provincie: string }>("select provincie from bedrijf_provincies where bedrijf_id = $1 order by provincie", [bedrijf.id]),
      ]);
      return {
        bedrijf,
        diensten: diensten.map((d) => d.dienst),
        plaatsen: plaatsen.map((p) => p.plaats),
        provincies: provincies.map((p) => p.provincie),
      };
    },
    undefined,
    "een profielpagina",
  );
}

/** Slugs van alle zichtbare bedrijven, voor de sitemap en de statische build. */
export async function actieveBedrijfSlugs(): Promise<string[]> {
  return vraagZacht(
    async () => (await vraag<{ slug: string }>("select slug from bedrijven where actief order by naam")).map((r) => r.slug),
    [],
    "de lijst met profielen",
  );
}
