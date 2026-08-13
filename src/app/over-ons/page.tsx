import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TekstPagina } from "@/components/tekst-pagina";
import { getPaginatekst } from "@/lib/pagina-teksten";

const pagina = getPaginatekst("over-ons");

export const metadata: Metadata = {
  title: { absolute: pagina?.metaTitel ?? "Over Werkoo" },
  description: pagina?.metaOmschrijving,
  alternates: { canonical: "/over-ons" },
};

export default function OverOnsPagina() {
  if (!pagina) notFound();

  return (
    <TekstPagina
      pagina={pagina}
      eyebrow="Over ons"
      cta={{
        titel: "Iets te vragen?",
        tekst: "Mail ons of bel op werkdagen tussen 09:00 en 17:30. Er zit altijd iemand aan de andere kant.",
        label: "Stuur een bericht",
        href: "/aanvraag",
      }}
    />
  );
}
