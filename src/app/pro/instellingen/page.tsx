import type { Metadata } from "next";
import { DashboardKop } from "@/components/dashboard-kop";
import { ProInstellingen } from "@/components/pro-instellingen";
import { bezetteDagen } from "@/lib/aanvragen";
import { vereisBedrijf } from "@/lib/auth";
import { vraag } from "@/lib/db";
import { plaatsen } from "@/lib/plaatsen";
import { PRO_LINKS } from "@/lib/pro-links";

export const metadata: Metadata = {
  title: "Instellingen",
  robots: { index: false, follow: false },
};

export default async function ProInstellingenPagina() {
  const { gebruiker, bedrijf } = await vereisBedrijf("/pro/instellingen");

  const [diensten, werkgebied, bezet] = await Promise.all([
    vraag<{ dienst: string }>("select dienst from bedrijf_diensten where bedrijf_id = $1", [bedrijf.id]),
    vraag<{ plaats: string }>("select plaats from bedrijf_plaatsen where bedrijf_id = $1", [bedrijf.id]),
    bezetteDagen(bedrijf.id),
  ]);

  return (
    <>
      <DashboardKop gebruiker={gebruiker} huidig="/pro/instellingen" links={PRO_LINKS} />

      <main className="flex-1 bg-brand-soft/40">
        <div className="container-page sectie">
          <h1 className="font-display text-h2 text-ink">Instellingen</h1>
          <p className="mt-2 max-w-2xl text-lead text-ink-soft">
            Hier bepaal je hoe je op de site staat en welke aanvragen je krijgt.
          </p>

          <ProInstellingen
            profiel={{
              naam: bedrijf.naam,
              plaats: bedrijf.plaats,
              adres: bedrijf.adres,
              telefoon: bedrijf.telefoon,
              belofte: bedrijf.belofte,
              tekst: bedrijf.tekst,
              jaren: bedrijf.jaren,
              actief: bedrijf.actief,
            }}
            diensten={diensten.map((d) => d.dienst)}
            plaatsen={plaatsen}
            werkgebied={werkgebied.map((p) => p.plaats)}
            bezet={bezet}
          />
        </div>
      </main>
    </>
  );
}
