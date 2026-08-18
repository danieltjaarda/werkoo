import "server-only";
import { mailNaderhand } from "@/lib/mail";
import { vraag, vraagEen } from "@/lib/db";
import { getDienst } from "@/lib/diensten";
import { absoluut } from "@/lib/site";

/**
 * De mails die de site zelf verstuurt bij een gebeurtenis. Alles hier loopt via
 * `mailNaderhand`: de bezoeker wacht er niet op en een storing bij de
 * mailprovider raakt de aanvraag zelf niet.
 */

function dienstNaam(slug: string): string {
  return getDienst(slug)?.naam.toLowerCase() ?? slug;
}

function datumNl(d: Date): string {
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

/** Nieuwe aanvraag: elke ontvangende vakman krijgt bericht, de klant een bevestiging. */
export function meldNieuweAanvraag(aanvraagId: string): void {
  mailNaderhand(async () => {
    const a = await vraagEen<{
      referentie: string; dienst: string; type: string; plaats: string; wensen: string;
      dagen: string[]; naam: string; email: string; gebruiker_id: string | null;
    }>("select referentie, dienst, type, plaats, wensen, dagen, naam, email, gebruiker_id from aanvragen where id = $1", [aanvraagId]);
    if (!a) return [];

    const vakmensen = await vraag<{ email: string; naam: string; bedrijf: string }>(
      `select g.email, g.naam, b.naam as bedrijf
         from aanvraag_bedrijven ab
         join bedrijven b on b.id = ab.bedrijf_id
         join gebruikers g on g.id = b.gebruiker_id
        where ab.aanvraag_id = $1`,
      [aanvraagId],
    );

    const dienst = dienstNaam(a.dienst);
    const dagen = a.dagen.length ? a.dagen.join(", ") : "in overleg";

    const naarVakmensen = vakmensen.map((v) => ({
      aan: v.email,
      onderwerp: `Nieuwe aanvraag: ${dienst} in ${a.plaats}`,
      tekst: `Hoi ${v.naam},

Er is een nieuwe aanvraag voor ${v.bedrijf} binnengekomen op Werkoo.

Dienst: ${dienst}${a.type ? ` (${a.type})` : ""}
Plaats: ${a.plaats}
Gewenste dagen: ${dagen}
${a.wensen ? `Toelichting: ${a.wensen}\n` : ""}
Bekijk de aanvraag en reageer via je dashboard:
${absoluut("/pro/aanvragen/" + aanvraagId)}

Hoe sneller je reageert, hoe groter de kans dat de klus naar jou gaat.`,
    }));

    const naarKlant = {
      aan: a.email,
      onderwerp: `Je aanvraag ${a.referentie} is verstuurd`,
      tekst: `Hoi ${a.naam},

Bedankt voor je aanvraag voor ${dienst} in ${a.plaats}. We hebben hem doorgezet naar ${vakmensen.length} ${vakmensen.length === 1 ? "vakman" : "vakmensen"} in jouw regio. Zodra iemand reageert krijg je een mail.

Je referentie is ${a.referentie}.
${a.gebruiker_id ? `\nJe aanvraag en de reacties volg je hier:\n${absoluut("/account/" + a.referentie)}` : `\nMaak een account aan met dit e-mailadres om je aanvraag en de reacties online te volgen:\n${absoluut("/inloggen?modus=registreren")}`}`,
    };

    return [...naarVakmensen, naarKlant];
  });
}

/** Een vakman heeft gereageerd: de klant hoort dat meteen. */
export function meldNieuweReactie(aanvraagId: string, bedrijfId: string): void {
  mailNaderhand(async () => {
    const r = await vraagEen<{
      referentie: string; dienst: string; plaats: string; naam: string; email: string;
      gebruiker_id: string | null; bedrijf: string; bericht: string; prijs: string; telefoon: string;
    }>(
      `select a.referentie, a.dienst, a.plaats, a.naam, a.email, a.gebruiker_id,
              b.naam as bedrijf, b.telefoon, r.bericht, r.prijs
         from reacties r
         join aanvragen a on a.id = r.aanvraag_id
         join bedrijven b on b.id = r.bedrijf_id
        where r.aanvraag_id = $1 and r.bedrijf_id = $2
        order by r.aangemaakt_op desc limit 1`,
      [aanvraagId, bedrijfId],
    );
    if (!r) return [];

    return [{
      aan: r.email,
      onderwerp: `${r.bedrijf} heeft gereageerd op je aanvraag`,
      tekst: `Hoi ${r.naam},

${r.bedrijf} heeft gereageerd op je aanvraag voor ${dienstNaam(r.dienst)} in ${r.plaats} (${r.referentie}):

"${r.bericht}"
${r.prijs ? `\nPrijsindicatie: ${r.prijs}` : ""}${r.telefoon ? `\nTelefoon: ${r.telefoon}` : ""}
${r.gebruiker_id ? `\nAlle reacties op een rij:\n${absoluut("/account/" + r.referentie)}` : `\nMaak een account aan met dit e-mailadres om alle reacties online te bekijken:\n${absoluut("/inloggen?modus=registreren")}`}`,
    }];
  });
}

export { datumNl };
