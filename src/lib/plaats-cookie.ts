import { PLAATS_COOKIE } from "@/lib/plaatsen";

const JAAR_IN_SECONDEN = 60 * 60 * 24 * 365;

/**
 * Onthoudt de plaats die iemand zelf invult, zodat die bij een volgend bezoek
 * voorgaat op wat het ip-adres suggereert. Alleen aan te roepen in de browser.
 */
export function onthoudPlaats(plaats: string) {
  const schoon = plaats.trim();
  if (!schoon) return;

  document.cookie = `${PLAATS_COOKIE}=${encodeURIComponent(schoon)}; path=/; max-age=${JAAR_IN_SECONDEN}; samesite=lax`;
}
