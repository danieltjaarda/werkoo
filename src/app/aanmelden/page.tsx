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
      kopKnop={{ label: "Meld je bedrijf aan", href: "/aanmelden/start" }}
      kopBeeld="/images/site/vakman-aanmelden.webp"
      cta={{
        titel: "Klaar om aanvragen te ontvangen?",
        tekst: "Meld je bedrijf in drie stappen aan. Het kost niets en je bepaalt zelf wanneer je profiel live gaat.",
        label: "Meld je bedrijf aan",
        href: "/aanmelden/start",
      }}
    />
  );
}
