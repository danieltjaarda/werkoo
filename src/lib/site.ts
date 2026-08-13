/**
 * Het adres waarop de site draait. Vercel zet NEXT_PUBLIC_SITE_URL niet zelf,
 * dus we vallen terug op de url die Vercel wél meegeeft en anders op localhost.
 * Canonicals en de sitemap hebben een absoluut adres nodig, vandaar deze plek.
 */
function bepaalBasis(): string {
  const eigen = process.env.NEXT_PUBLIC_SITE_URL;
  if (eigen) return eigen.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  // Een productiebuild zonder basisadres bakt localhost in de sitemap, de
  // robots.txt en elke voorgerenderde canonical, en dat merk je pas als Google
  // het al heeft opgehaald. We laten de build niet vallen — een lokale
  // controlebuild moet gewoon kunnen — maar het staat wel in het buildlog.
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "\n⚠️  NEXT_PUBLIC_SITE_URL is niet gezet. De sitemap, robots.txt en alle canonicals krijgen nu localhost-urls.\n",
    );
  }

  return "http://localhost:3000";
}

export const SITE_URL = bepaalBasis();

export const SITE_NAAM = "Werkoo";

export const CONTACT = {
  email: "hallo@werkoo.nl",
  telefoon: "085 - 123 45 67",
  telefoonLink: "+31851234567",
  kvk: "12345678",
};

export function absoluut(pad: string): string {
  return `${SITE_URL}${pad.startsWith("/") ? pad : `/${pad}`}`;
}
