import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TekstPagina } from "@/components/tekst-pagina";
import { getPaginatekst } from "@/lib/pagina-teksten";

const pagina = getPaginatekst("privacy");

export const metadata: Metadata = {
  title: { absolute: pagina?.metaTitel ?? "Privacyverklaring" },
  description: pagina?.metaOmschrijving,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPagina() {
  if (!pagina) notFound();

  return <TekstPagina pagina={pagina} eyebrow="Privacy" />;
}
