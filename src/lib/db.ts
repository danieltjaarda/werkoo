import { Pool, type PoolClient } from "pg";

/**
 * Eén pool voor het hele proces. In ontwikkeling herlaadt Next de modules bij
 * elke wijziging, dus zonder deze globale variabele bouw je binnen een minuut
 * tientallen pools op en loopt Postgres vol.
 */
const globaalMetPool = globalThis as typeof globalThis & { werkooPool?: Pool };

function maakPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL ontbreekt. Zet hem in .env.local, bijvoorbeeld postgresql://localhost:5432/werkoo",
    );
  }

  const lokaal = url.includes("localhost") || url.includes("127.0.0.1");

  /**
   * Lokaal geen tls, daarbuiten wel — en mét certificaatcontrole. Neon en
   * Supabase zetten zelf `sslmode` in de url; die laten we dan staan, want de
   * driver verifieert daarmee het certificaat. Staat er niets in, dan zetten we
   * tls zelf aan. Wat hier níét meer staat is `rejectUnauthorized: false`: dat
   * accepteert elk certificaat en maakt de versleuteling zinloos tegen iemand
   * die tussen de server en de database zit.
   */
  return new Pool({
    connectionString: url,
    max: 10,
    ...(lokaal ? { ssl: false as const } : url.includes("sslmode=") ? {} : { ssl: true as const }),
  });
}

export function pool(): Pool {
  globaalMetPool.werkooPool ??= maakPool();
  return globaalMetPool.werkooPool;
}

/** Is er überhaupt een database geconfigureerd? */
export function heeftDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Voor leesvragen die een zinnig leeg antwoord hebben. Zonder database of met een
 * database die even niet reageert geeft dit de terugvalwaarde in plaats van de
 * hele pagina — of erger, de hele build — om te laten vallen. Schrijfacties en
 * inloggen gebruiken dit bewust niet: die moeten wél hard falen.
 */
export async function vraagZacht<T>(werk: () => Promise<T>, terugval: T, wat: string): Promise<T> {
  if (!heeftDatabase()) {
    console.warn(`Geen DATABASE_URL: ${wat} blijft leeg.`);
    return terugval;
  }

  try {
    return await werk();
  } catch (fout) {
    console.error(`Database onbereikbaar, ${wat} blijft leeg:`, fout);
    return terugval;
  }
}

/** Voert een query uit en geeft de rijen terug, getypeerd zoals jij ze verwacht. */
export async function vraag<T extends Record<string, unknown>>(
  sql: string,
  waarden: unknown[] = [],
): Promise<T[]> {
  const uitkomst = await pool().query(sql, waarden);
  return uitkomst.rows as T[];
}

/**
 * Voert een reeks queries uit in één transactie. Alles of niets: valt er iets om,
 * dan draait de hele boel terug en blijft er geen half account achter.
 */
export async function metTransactie<T>(werk: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    const uitkomst = await werk(client);
    await client.query("commit");
    return uitkomst;
  } catch (fout) {
    await client.query("rollback");
    throw fout;
  } finally {
    client.release();
  }
}

/** Zelfde als `vraag`, maar voor het geval waarin je één of geen rij verwacht. */
export async function vraagEen<T extends Record<string, unknown>>(
  sql: string,
  waarden: unknown[] = [],
): Promise<T | undefined> {
  const rijen = await vraag<T>(sql, waarden);
  return rijen[0];
}
