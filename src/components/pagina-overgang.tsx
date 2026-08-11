import { ViewTransition, type ReactNode } from "react";

/**
 * Laat de pagina bij navigatie opzij schuiven in plaats van hard wisselen.
 * De richting komt uit het overgangstype dat we bij `router.push` meegeven:
 * vooruit schuift naar links, terug naar rechts.
 *
 * De terugknop van de browser draagt geen type mee, dus daar valt hij terug op
 * een zachte vervaging. Dat geldt ook voor de menulinks: die gaan opzij in de
 * site en niet dieper, dus een richting zou daar het verkeerde suggereren.
 */
const richtingen = {
  "nav-vooruit": "nav-vooruit",
  "nav-terug": "nav-terug",
  default: "nav-vervaag",
} as const;

export function PaginaOvergang({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={richtingen} exit={richtingen} default="none">
      {children}
    </ViewTransition>
  );
}
