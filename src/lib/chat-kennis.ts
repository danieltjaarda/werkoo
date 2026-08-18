import "server-only";
import { bedrijvenVoorDienst, type Bedrijf } from "@/lib/aanvragen";
import { algemeneVragen, stappen, voordelen } from "@/lib/content";
import { categorieen, diensten, getDienst } from "@/lib/diensten";
import { plaatsen } from "@/lib/plaatsen";
import { provincieVanPlaats } from "@/lib/provincies";
import { CONTACT, SITE_NAAM } from "@/lib/site";

/**
 * Alles wat de chatassistent over Werkoo mag weten, opgebouwd uit dezelfde
 * bronnen als de site zelf. Zo verzint hij geen prijzen of regels: de
 * prijsindicaties komen uit de catalogus en de spelregels uit de FAQ.
 *
 * De volledige catalogus (87 diensten met intro en prijs) is te groot voor
 * elk gesprek. Daarom: alle namen + slugs compact, en alleen van de dienst
 * waar de bezoeker nu op zit — plus diensten die in het gesprek genoemd
 * worden — de details.
 */

const NAAM_ASSISTENT = "Wout";

function dienstenLijst(): string {
  return categorieen
    .map((c) => {
      const lijst = diensten
        .filter((d) => d.categorie === c.id)
        .map((d) => `${d.naam} (/${d.slug})`)
        .join(", ");
      return `- ${c.titel}: ${lijst}`;
    })
    .join("\n");
}

function dienstDetails(slug: string): string {
  const d = getDienst(slug);
  if (!d) return "";
  return `### ${d.naam} (pagina: /${d.slug}, aanvraag: /aanvraag?dienst=${d.slug})
${d.intro}
Prijsindicatie: ${d.prijs}
Waar op letten: ${d.letOp.join(" ")}
Keuzes in de aanvraag: ${d.opties.map((o) => o.label).join(", ")}
Veelgestelde vragen: ${d.vragen.map((v) => `${v.vraag} ${v.antwoord}`).join(" ")}`;
}

/** Vindt de plaats die in de gesprekstekst genoemd wordt: eerst onze eigen lijst, dan PDOK. */
export async function genoemdePlaats(tekst: string): Promise<string> {
  const t = tekst.toLowerCase();
  const eigen = plaatsen.find((p) => t.includes(p.toLowerCase()));
  if (eigen) return eigen;

  // "in Wageningen", "uit Sneek", "rond Zaandam" — pak het woord na het voorzetsel.
  const treffers = [...tekst.matchAll(/\b(?:in|uit|rond|omgeving|nabij|bij)\s+([A-Z][a-zA-Zäëïöüáéíóú'\-]{2,}(?:\s[A-Z][a-zA-Zäëïöü'\-]{2,})?)/g)];
  for (const treffer of treffers.slice(0, 3)) {
    const kandidaat = treffer[1]!.trim();
    if (await provincieVanPlaats(kandidaat)) return kandidaat;
  }
  return "";
}

/** Vindt diensten die letterlijk in de gesprekstekst voorkomen. */
export function genoemdeDiensten(tekst: string, maximum = 3): string[] {
  const t = tekst.toLowerCase();
  return diensten
    .filter((d) => [d.naam, d.meervoud, d.menuLabel].some((n) => t.includes(n.toLowerCase())))
    .slice(0, maximum)
    .map((d) => d.slug);
}

/**
 * De vakmensen die nu echt op het platform staan voor deze dienst en plaats.
 * Zonder deze lijst zou de assistent alleen "doe een aanvraag" kunnen zeggen,
 * terwijl de bezoeker vraagt wíé er is. We geven alleen wat ook openbaar op de
 * dienstpagina staat.
 */
export async function vakmensenVoor(dienstSlug: string, plaats: string): Promise<Bedrijf[]> {
  const lijst = await bedrijvenVoorDienst(dienstSlug, plaats);
  return lijst.slice(0, 5);
}

function vakmensenBlok(dienstSlug: string, plaats: string, lijst: Bedrijf[]): string {
  const dienst = getDienst(dienstSlug);
  if (!dienst) return "";

  if (lijst.length === 0) {
    return `## Vakmensen voor ${dienst.naam}${plaats ? ` in ${plaats}` : ""}
Er staan op dit moment geen profielen voor deze combinatie. Zeg dat eerlijk: er is nog niemand actief voor deze dienst in deze plaats. Bied aan dat de bezoeker toch een aanvraag doet — die leggen we voor aan vakmensen die zich aanmelden — of noem een naburige plaats.`;
  }

  const regels = lijst
    .map((b) => {
      const cijfer = b.reviews > 0 ? `${b.score.toLocaleString("nl-NL")} uit ${b.reviews} beoordelingen` : "nog geen beoordelingen";
      const troeven = b.troeven.map((t) => t.label).join(", ");
      return `- ${b.naam}${b.plaats ? ` uit ${b.plaats}` : ""} — profiel: /vakman/${b.slug}. ${b.belofte || ""} Cijfer: ${cijfer}.${b.jaren ? ` ${b.jaren} jaar in bedrijf.` : ""}${troeven ? ` Troeven: ${troeven}.` : ""}${b.tekst ? ` Over: ${b.tekst.slice(0, 200)}` : ""}`;
    })
    .join("\n");

  return `## Vakmensen die NU op Werkoo staan voor ${dienst.naam}${plaats ? ` in ${plaats}` : ""}
${regels}

Noem deze vakmensen bij naam als de bezoeker een vakman zoekt, met een link naar hun profiel, bijvoorbeeld [${lijst[0]!.naam}](/vakman/${lijst[0]!.slug}). Verzin er niets bij: alleen wat hierboven staat. Zeg erbij dat hij via een aanvraag zelf kiest wie mag reageren.`;
}

export function systeemPrompt({
  huidigeDienst,
  extraDiensten,
  vakmensen,
}: {
  huidigeDienst?: string;
  extraDiensten: string[];
  vakmensen?: { dienst: string; plaats: string; lijst: Bedrijf[] };
}): string {
  const details = [...new Set([huidigeDienst, ...extraDiensten].filter((s): s is string => Boolean(s)))]
    .map(dienstDetails)
    .filter(Boolean)
    .join("\n\n");

  return `Je bent ${NAAM_ASSISTENT}, de chatassistent van ${SITE_NAAM} (werkoo.nl). Werkoo is een Nederlands platform waar consumenten en bedrijven één aanvraag doen voor een klus en reacties krijgen van gecontroleerde vakmensen uit hun eigen regio.

## Zo praat je
- Nederlands, je-vorm, warm, kort en concreet. Meestal 2 tot 5 zinnen; gebruik een lijstje alleen als dat echt helpt.
- Geef antwoord op wat er gevraagd wordt en eindig met één logische vervolgstap of vraag.
- Stuur, waar het past, naar het doen van een aanvraag: dat is gratis en vrijblijvend. Gebruik daarvoor een markdown-link naar het juiste pad, bijvoorbeeld [doe een aanvraag](/aanvraag?dienst=videograaf&plaats=Amsterdam). Voeg de plaats toe als je die weet. Verwijs naar dienstpagina's als [Videografen](/videograaf) en naar plaatspagina's als /videograaf/amsterdam (kleine letters, spaties worden koppeltekens).
- Verzin nooit bedrijfsnamen, beoordelingen, aantallen vakmensen of beschikbaarheid. Staat er verderop een lijst met vakmensen die nu op het platform staan, gebruik dan uitsluitend die namen en cijfers. Staat die lijst er niet, vraag dan eerst welke dienst en plaats het betreft.
- Zoekt iemand een vakman, dan laat je zien wie er is: noem twee tot vier namen met een link naar hun profiel en één zin waarom ze passen, en pas daarna de uitnodiging om een aanvraag te doen. Antwoord dus nooit alleen met "doe een aanvraag" als je namen hebt.
- Prijzen alleen uit de catalogus hieronder; staat er niets over de gevraagde dienst, zeg dan dat het van de klus afhangt en dat de reacties op een aanvraag een eerlijk beeld geven.
- Ben je iets niet zeker of gaat het om een klacht, betaling of iets persoonlijks: verwijs naar ${CONTACT.email} of ${CONTACT.telefoon} (werkdagen 09:00–17:30).
- Ga niet in op onderwerpen die niets met klussen, vakmensen of Werkoo te maken hebben; zeg vriendelijk dat je daar niet voor bent.
- Vakmensen die willen aansluiten verwijs je naar [meld je bedrijf aan](/aanmelden/start) (gratis, geen abonnement, betalen alleen bij een opdracht) of naar [hoe het werkt voor vakmensen](/aanmelden). Inloggen: /inloggen. Eigen aanvragen volgen: /account.

## Zo werkt Werkoo voor een consument
${stappen.map((s, i) => `${i + 1}. ${s.titel}: ${s.tekst}`).join("\n")}
Een aanvraag gaat naar maximaal een handvol passende vakmensen; de aanvrager kiest zelf wie mag reageren, krijgt de reacties per mail en in zijn account, en beslist zelf of hij iemand boekt.

## Waarom Werkoo
${voordelen.map((v) => `- ${v.titel}: ${v.tekst}`).join("\n")}

## Veelgestelde vragen
${algemeneVragen.map((v) => `- ${v.vraag} ${v.antwoord}`).join("\n")}

## Alle diensten (naam en pad)
${dienstenLijst()}

## Plaatsen met eigen pagina's
${plaatsen.join(", ")} — andere plaatsen kunnen ook gewoon in een aanvraag.

${details ? `## Details van de diensten die nu relevant zijn\n${details}` : ""}

${vakmensen ? vakmensenBlok(vakmensen.dienst, vakmensen.plaats, vakmensen.lijst) : ""}`;
}

export { NAAM_ASSISTENT };
