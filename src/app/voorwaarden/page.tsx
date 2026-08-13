import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TekstPagina } from "@/components/tekst-pagina";
import { getPaginatekst } from "@/lib/pagina-teksten";

const pagina = getPaginatekst("voorwaarden");

export const metadata: Metadata = {
  title: { absolute: pagina?.metaTitel ?? "Algemene voorwaarden" },
  description: pagina?.metaOmschrijving,
  alternates: { canonical: "/voorwaarden" },
};

export default function VoorwaardenPagina() {
  if (!pagina) notFound();

  return <TekstPagina pagina={pagina} eyebrow="Voorwaarden" />;
}
