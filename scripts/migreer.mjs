/**
 * Draait de sql-bestanden in db/migraties/ op volgorde en houdt in een tabel bij
 * welke al gedraaid zijn. Bewust geen ORM: de schema's staan als leesbare sql in
 * de repo, en dit script is het enige wat ze uitvoert.
 *
 * npm run migreer
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const hier = dirname(fileURLToPath(import.meta.url));
const map = join(hier, "..", "db", "migraties");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL ontbreekt. Zet hem in .env.local, bijvoorbeeld:");
  console.error("  DATABASE_URL=postgresql://localhost:5432/werkoo");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();

await client.query(`
  create table if not exists migraties (
    naam text primary key,
    gedraaid_op timestamptz not null default now()
  )
`);

const { rows } = await client.query("select naam from migraties");
const gedaan = new Set(rows.map((r) => r.naam));

const bestanden = readdirSync(map).filter((n) => n.endsWith(".sql")).sort();
let nieuw = 0;

for (const bestand of bestanden) {
  if (gedaan.has(bestand)) {
    console.log(`over  ${bestand}`);
    continue;
  }

  const sql = readFileSync(join(map, bestand), "utf8");
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into migraties (naam) values ($1)", [bestand]);
    await client.query("commit");
    console.log(`ok    ${bestand}`);
    nieuw += 1;
  } catch (fout) {
    await client.query("rollback");
    console.error(`FOUT  ${bestand}\n      ${fout.message}`);
    await client.end();
    process.exit(1);
  }
}

console.log(nieuw === 0 ? "\nniets te doen, schema is bij" : `\n${nieuw} migratie(s) gedraaid`);
await client.end();
