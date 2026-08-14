import { Pool } from "pg";

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

  return new Pool({
    connectionString: url,
    max: 10,
    // Een gehoste database (Neon, Supabase) wil tls; lokaal niet.
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
  });
}

export function pool(): Pool {
  globaalMetPool.werkooPool ??= maakPool();
  return globaalMetPool.werkooPool;
}

/** Voert een query uit en geeft de rijen terug, getypeerd zoals jij ze verwacht. */
export async function vraag<T extends Record<string, unknown>>(
  sql: string,
  waarden: unknown[] = [],
): Promise<T[]> {
  const uitkomst = await pool().query(sql, waarden);
  return uitkomst.rows as T[];
}

/** Zelfde als `vraag`, maar voor het geval waarin je één of geen rij verwacht. */
export async function vraagEen<T extends Record<string, unknown>>(
  sql: string,
  waarden: unknown[] = [],
): Promise<T | undefined> {
  const rijen = await vraag<T>(sql, waarden);
  return rijen[0];
}
