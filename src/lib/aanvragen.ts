import "server-only";
import { randomBytes } from "node:crypto";
import { vraag, vraagEen } from "@/lib/db";

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
 */
export async function bedrijvenVoorDienst(dienstSlug: string, plaats = ""): Promise<Bedrijf[]> {
  const rijen = await vraag<BedrijfRij>(
    `select ${BEDRIJF_KOLOMMEN}
       from bedrijven b
       join bedrijf_diensten d on d.bedrijf_id = b.id and d.dienst = $1
      where b.actief
        and (
          not exists (select 1 from bedrijf_plaatsen p where p.bedrijf_id = b.id)
          or exists (
            select 1 from bedrijf_plaatsen p
             where p.bedrijf_id = b.id and lower(p.plaats) = lower($2)
          )
        )
      order by b.uitgelicht desc, (lower(b.plaats) = lower($2)) desc, b.score desc, b.naam`,
    [dienstSlug, plaats],
  );

  return metTroeven(rijen);
}

export async function bedrijfVanSlug(slug: string): Promise<Bedrijf | undefined> {
  const rijen = await vraag<BedrijfRij>(
    `select ${BEDRIJF_KOLOMMEN} from bedrijven b where b.slug = $1 and b.actief`,
    [slug],
  );
  return (await metTroeven(rijen))[0];
}

export async function dienstenMetBedrijven(): Promise<Set<string>> {
  const rijen = await vraag<{ dienst: string }>(
    `select distinct d.dienst
       from bedrijf_diensten d
       join bedrijven b on b.id = d.bedrijf_id and b.actief`,
  );
  return new Set(rijen.map((r) => r.dienst));
}

/** Dagen waarop dit bedrijf al vol zit, als "2026-08-21". */
export async function bezetteDagen(bedrijfId: string): Promise<string[]> {
  const rijen = await vraag<{ dag: string }>(
    "select to_char(datum, 'YYYY-MM-DD') as dag from bedrijf_bezet where bedrijf_id = $1",
    [bedrijfId],
  );
  return rijen.map((r) => r.dag);
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

export async function bewaarAanvraag(invoer: NieuweAanvraag): Promise<{ referentie: string; ontvangers: number }> {
  const referentie = `WK-${randomBytes(4).toString("hex").toUpperCase()}`;

  const aanvraag = await vraagEen<{ id: string }>(
    `insert into aanvragen
       (referentie, gebruiker_id, dienst, type, plaats, adres, wensen, dagen, naam, email, telefoon, whatsapp)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     returning id`,
    [
      referentie,
      invoer.gebruikerId ?? null,
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
    ],
  );

  if (!aanvraag) throw new Error("De aanvraag kon niet worden opgeslagen.");

  // Zelf gekozen bedrijven gaan voor; anders pakken we de bovenste uit de lijst
  // die deze dienst in deze plaats doet.
  const gekozen = invoer.bedrijfSlugs.length
    ? await vraag<{ id: string }>(
        `select b.id from bedrijven b
           join bedrijf_diensten d on d.bedrijf_id = b.id and d.dienst = $2
          where b.slug = any($1) and b.actief`,
        [invoer.bedrijfSlugs, invoer.dienst],
      )
    : (await bedrijvenVoorDienst(invoer.dienst, invoer.plaats)).slice(0, MAX_ONTVANGERS);

  for (const bedrijf of gekozen) {
    await vraagEen(
      "insert into aanvraag_bedrijven (aanvraag_id, bedrijf_id) values ($1, $2) on conflict do nothing",
      [aanvraag.id, bedrijf.id],
    );
  }

  return { referentie, ontvangers: gekozen.length };
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
  const aanvraag = await vraagEen<AanvraagRij>(
    "select * from aanvragen where referentie = $1 and gebruiker_id = $2",
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
