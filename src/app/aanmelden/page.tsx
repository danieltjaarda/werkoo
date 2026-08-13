import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TekstPagina } from "@/components/tekst-pagina";
import { getPaginatekst } from "@/lib/pagina-teksten";

const pagina = getPaginatekst("aanmelden");

export const metadata: Metadata = {
  title: { absolute: pagina?.metaTitel ?? "Werk ontvangen via Werkoo" },
  description: pagina?.metaOmschrijving,
  alternates: { canonical: "/aanmelden" },
};

export default function AanmeldenPagina() {
  if (!pagina) notFound();

  return (
    <TekstPagina
      pagina={pagina}
      eyebrow="Voor vakmensen"
      cta={{
        titel: "Klaar om aanvragen te ontvangen?",
        // Er is nog geen aanmeldformulier, dus we sturen naar de mail in plaats
        // van naar een inlogpagina die weer hierheen wijst.
        tekst: "Mail ons je bedrijfsnaam en KvK-nummer, dan nemen we contact op om je profiel samen op te zetten.",
        label: "Stuur ons een mail",
        href: "mailto:hallo@werkoo.nl?subject=Aanmelden%20als%20vakman",
      }}
    />
  );
}
