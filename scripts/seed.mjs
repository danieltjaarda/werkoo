/**
 * Zet de vier nagekeken videograafprofielen in de database. Ze stonden eerder
 * als vaste lijst in src/lib/vakmensen.ts; sinds de openbare lijst uit de
 * database komt horen ze hier. Het script is idempotent: nog eens draaien werkt
 * de bestaande rijen bij in plaats van dubbele profielen te maken.
 *
 * npm run seed
 */
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL ontbreekt. Zet hem in .env.local.");
  process.exit(1);
}

const profielen = [
  {
    slug: "mediaspot",
    naam: "Mediaspot",
    dienst: "videograaf",
    foto: "/images/profielen/mediaspot.webp",
    belofte: "van concept tot montage",
    plaats: "Joure",
    adres: "Brandemeer 6, Joure",
    jaren: 2,
    telefoon: "06 20176727",
    score: 10,
    reviews: 234,
    fotos: 42,
    topPro: true,
    uitgelicht: true,
    troeven: [
      ["Gratis kennismaking", "aanbod"],
      ["Reageert binnen 1 uur", "snelheid"],
      ["Werkoo-keurmerk", "keurmerk"],
    ],
    tekst:
      "Videograaf uit Joure voor bruiloften, evenementen, bedrijfsfilms en social content. Van concept tot montage, actief in Friesland, Groningen, Drenthe, Overijssel, Flevoland en Gelderland.",
  },
  {
    slug: "studio-noordlicht",
    naam: "Studio Noordlicht",
    dienst: "videograaf",
    foto: "/images/profielen/profiel-noordlicht.webp",
    belofte: "elk merk heeft een verhaal",
    plaats: "Heerenveen",
    adres: "Fok 32, Heerenveen",
    jaren: 11,
    telefoon: "0513 820 145",
    score: 9.8,
    reviews: 121,
    fotos: 38,
    topPro: true,
    uitgelicht: false,
    troeven: [
      ["Gratis kennismaking", "aanbod"],
      ["Reageert binnen 1 uur", "snelheid"],
      ["Werkoo-keurmerk", "keurmerk"],
    ],
    tekst:
      "Team van drie dat korte commercials en socialmediacontent maakt voor het mkb. We schrijven het script mee, filmen met twee camera's en leveren binnen tien werkdagen een versie voor elk kanaal.",
  },
  {
    slug: "djarno-van-elst",
    naam: "Djarno van Elst",
    dienst: "videograaf",
    foto: "/images/profielen/profiel-djarno.webp",
    belofte: "cinematisch, zonder poespas",
    plaats: "Joure",
    adres: "Midstraat 104, Joure",
    jaren: 7,
    telefoon: "0513 745 210",
    score: 9.6,
    reviews: 63,
    fotos: 24,
    topPro: true,
    uitgelicht: false,
    troeven: [
      ["10% korting bij twee dagdelen", "aanbod"],
      ["Reageert snel", "snelheid"],
      ["Werkoo-keurmerk", "keurmerk"],
    ],
    tekst:
      "Filmt met Sony FX-camera's en doet de kleurcorrectie zelf, zodat het beeld precies wordt wat je voor ogen had. Trouwfilms en bedrijfsvideo's, altijd binnen twee weken geleverd.",
  },
  {
    slug: "marit-de-vries",
    naam: "Marit de Vries",
    dienst: "videograaf",
    foto: "/images/profielen/profiel-marit.webp",
    belofte: "documentair en dichtbij",
    plaats: "Sneek",
    adres: "Oosterdijk 19, Sneek",
    jaren: 5,
    telefoon: "0515 336 802",
    score: 9.4,
    reviews: 48,
    fotos: 16,
    topPro: false,
    uitgelicht: false,
    troeven: [
      ["Gratis draaiboekgesprek", "aanbod"],
      ["Reageert binnen een dag", "snelheid"],
    ],
    tekst:
      "Blijft het liefst op de achtergrond en filmt wat er echt gebeurt. Werkt bij drukke dagen samen met een tweede camera, zodat er niets tussen wal en schip valt.",
  },
];

const client = new pg.Client({ connectionString: url });
await client.connect();

for (const p of profielen) {
  const { rows } = await client.query(
    `insert into bedrijven
       (naam, slug, plaats, adres, telefoon, belofte, tekst, jaren, foto, actief,
        score, reviews, fotos, top_pro, uitgelicht)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11,$12,$13,$14)
     on conflict (slug) do update set
       naam = excluded.naam, plaats = excluded.plaats, adres = excluded.adres,
       telefoon = excluded.telefoon, belofte = excluded.belofte, tekst = excluded.tekst,
       jaren = excluded.jaren, foto = excluded.foto, score = excluded.score,
       reviews = excluded.reviews, fotos = excluded.fotos, top_pro = excluded.top_pro,
       uitgelicht = excluded.uitgelicht, actief = true
     returning id`,
    [
      p.naam, p.slug, p.plaats, p.adres, p.telefoon, p.belofte, p.tekst, p.jaren, p.foto,
      p.score, p.reviews, p.fotos, p.topPro, p.uitgelicht,
    ],
  );

  const id = rows[0].id;

  await client.query("insert into bedrijf_diensten (bedrijf_id, dienst) values ($1,$2) on conflict do nothing", [id, p.dienst]);

  await client.query("delete from bedrijf_troeven where bedrijf_id = $1", [id]);
  for (const [index, [label, soort]] of p.troeven.entries()) {
    await client.query(
      "insert into bedrijf_troeven (bedrijf_id, label, soort, volgorde) values ($1,$2,$3,$4)",
      [id, label, soort, index],
    );
  }

  console.log(`ok  ${p.slug}`);
}

const { rows: telling } = await client.query("select count(*)::int as n from bedrijven");
console.log(`\n${telling[0].n} bedrijven in de database`);
await client.end();
