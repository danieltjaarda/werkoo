"use server";

import { revalidatePath } from "next/cache";
import { bewaarReactie, isUuid, zetStatus, type Status } from "@/lib/aanvragen";
import { vereisBedrijf } from "@/lib/auth";
import { vraag, vraagEen } from "@/lib/db";
import { getDienst } from "@/lib/diensten";
import { meldNieuweReactie } from "@/lib/meldingen";
import { bekendePlaats } from "@/lib/plaatsen";
import { isProvincie } from "@/lib/provincie-kaart";

export type Uitkomst = { fout?: string; gelukt?: string };

/**
 * De openbare plaatspagina's zijn statisch. Verandert een profiel, zijn diensten
 * of zijn werkgebied, dan moeten ze opnieuw gebouwd worden — anders staat een
 * vakman er pas de volgende build op, of blijft hij er staan terwijl hij zich
 * heeft uitgezet.
 */
function verversOpenbaar(): void {
  revalidatePath("/[dienst]/[plaats]", "page");
  revalidatePath("/vakman/[slug]", "page");
  revalidatePath("/diensten");
}

const STATUSSEN: Status[] = ["nieuw", "in_behandeling", "gereageerd", "gewonnen", "verloren"];

function tekst(data: FormData, veld: string): string {
  const waarde = data.get(veld);
  return typeof waarde === "string" ? waarde.trim() : "";
}

/** Reageren op een aanvraag: bericht plus een prijsindicatie. */
export async function reageren(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const { bedrijf } = await vereisBedrijf("/pro");
  const aanvraagId = tekst(data, "aanvraagId");
  const bericht = tekst(data, "bericht");
  const prijs = tekst(data, "prijs");

  if (bericht.length < 10) return { fout: "Schrijf even een bericht van een paar zinnen." };
  if (!isUuid(aanvraagId)) return { fout: "Deze aanvraag staat niet bij jouw bedrijf." };

  // Controleren dat deze aanvraag echt bij dit bedrijf hoort.
  const hoortErbij = await vraagEen(
    "select 1 from aanvraag_bedrijven where aanvraag_id = $1 and bedrijf_id = $2",
    [aanvraagId, bedrijf.id],
  );
  if (!hoortErbij) return { fout: "Deze aanvraag staat niet bij jouw bedrijf." };

  await bewaarReactie(aanvraagId, bedrijf.id, bericht, prijs);
  meldNieuweReactie(aanvraagId, bedrijf.id);
  revalidatePath(`/pro/aanvragen/${aanvraagId}`);
  revalidatePath("/pro/aanvragen");
  revalidatePath("/pro");

  return { gelukt: "Je reactie is verstuurd." };
}

export async function statusWijzigen(data: FormData): Promise<void> {
  const { bedrijf } = await vereisBedrijf("/pro");
  const aanvraagId = tekst(data, "aanvraagId");
  const status = tekst(data, "status") as Status;

  if (!STATUSSEN.includes(status) || !isUuid(aanvraagId)) return;

  await zetStatus(aanvraagId, bedrijf.id, status);
  revalidatePath(`/pro/aanvragen/${aanvraagId}`);
  revalidatePath("/pro/aanvragen");
  revalidatePath("/pro");
}

export async function profielOpslaan(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const { bedrijf } = await vereisBedrijf("/pro/instellingen");

  const naam = tekst(data, "naam");
  if (!naam) return { fout: "Vul de naam van je bedrijf in." };

  const jaren = Number(tekst(data, "jaren")) || 0;
  if (jaren < 0 || jaren > 200) return { fout: "Vul een geloofwaardig aantal jaren in." };

  const kvk = tekst(data, "kvk").replace(/\s/g, "");
  if (kvk && !/^\d{8}$/.test(kvk)) return { fout: "Een KvK-nummer bestaat uit 8 cijfers." };
  const postcode = tekst(data, "postcode").toUpperCase().replace(/\s/g, "");
  if (postcode && !/^\d{4}[A-Z]{2}$/.test(postcode)) return { fout: "Vul een Nederlandse postcode in, bijvoorbeeld 1012 AB." };
  const website = tekst(data, "website");

  await vraagEen(
    `update bedrijven
        set naam = $2, plaats = $3, adres = $4, telefoon = $5, belofte = $6, tekst = $7,
            jaren = $8, actief = $9, kvk = $10, postcode = $11, website = $12
      where id = $1`,
    [
      bedrijf.id,
      naam,
      tekst(data, "plaats"),
      tekst(data, "adres"),
      tekst(data, "telefoon"),
      tekst(data, "belofte"),
      tekst(data, "tekst"),
      jaren,
      data.get("actief") === "aan",
      kvk,
      postcode,
      website,
    ],
  );

  revalidatePath("/pro/instellingen");
  revalidatePath("/pro");
  verversOpenbaar();
  return { gelukt: "Je profiel is opgeslagen." };
}

/** De diensten waarvoor dit bedrijf aanvragen wil ontvangen. */
export async function dienstenOpslaan(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const { bedrijf } = await vereisBedrijf("/pro/instellingen");

  const gekozen = data
    .getAll("dienst")
    .filter((w): w is string => typeof w === "string")
    .filter((slug) => getDienst(slug));

  if (gekozen.length === 0) return { fout: "Kies minstens één dienst, anders krijg je geen aanvragen." };

  await vraag("delete from bedrijf_diensten where bedrijf_id = $1", [bedrijf.id]);
  for (const slug of gekozen) {
    await vraagEen("insert into bedrijf_diensten (bedrijf_id, dienst) values ($1, $2)", [bedrijf.id, slug]);
  }

  revalidatePath("/pro/instellingen");
  verversOpenbaar();
  return { gelukt: `${gekozen.length} ${gekozen.length === 1 ? "dienst" : "diensten"} opgeslagen.` };
}

/** Het werkgebied: leeg betekent heel Nederland. */
export async function werkgebiedOpslaan(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const { bedrijf } = await vereisBedrijf("/pro/instellingen");

  const plaatsen = data
    .getAll("plaats")
    .filter((w): w is string => typeof w === "string")
    .map((naam) => bekendePlaats(naam))
    .filter((naam): naam is string => Boolean(naam));

  const provincies = [...new Set(data.getAll("provincie").filter((w): w is string => typeof w === "string"))].filter(
    isProvincie,
  );

  await vraag("delete from bedrijf_plaatsen where bedrijf_id = $1", [bedrijf.id]);
  for (const plaats of plaatsen) {
    await vraagEen("insert into bedrijf_plaatsen (bedrijf_id, plaats) values ($1, $2)", [bedrijf.id, plaats]);
  }

  await vraag("delete from bedrijf_provincies where bedrijf_id = $1", [bedrijf.id]);
  for (const provincie of provincies) {
    await vraagEen("insert into bedrijf_provincies (bedrijf_id, provincie) values ($1, $2)", [bedrijf.id, provincie]);
  }

  revalidatePath("/pro/instellingen");
  verversOpenbaar();
  if (plaatsen.length === 0 && provincies.length === 0) {
    return { gelukt: "Je werkgebied staat op heel Nederland." };
  }

  const delen = [
    provincies.length ? `${provincies.length} ${provincies.length === 1 ? "provincie" : "provincies"}` : "",
    plaatsen.length ? `${plaatsen.length} ${plaatsen.length === 1 ? "plaats" : "plaatsen"}` : "",
  ].filter(Boolean);

  return { gelukt: `${delen.join(" en ")} opgeslagen.` };
}

/** Slaat de hele lijst bezette dagen in één keer op. */
export async function beschikbaarheidOpslaan(_vorige: Uitkomst, data: FormData): Promise<Uitkomst> {
  const { bedrijf } = await vereisBedrijf("/pro/instellingen");

  const dagen = data
    .getAll("dag")
    .filter((w): w is string => typeof w === "string")
    .filter((dag) => /^\d{4}-\d{2}-\d{2}$/.test(dag));

  await vraag("delete from bedrijf_bezet where bedrijf_id = $1", [bedrijf.id]);
  for (const dag of dagen) {
    await vraagEen("insert into bedrijf_bezet (bedrijf_id, datum) values ($1, $2) on conflict do nothing", [
      bedrijf.id,
      dag,
    ]);
  }

  revalidatePath("/pro/instellingen");
  return {
    gelukt: dagen.length === 0
      ? "Je staat alle dagen open."
      : `${dagen.length} ${dagen.length === 1 ? "dag" : "dagen"} op bezet gezet.`,
  };
}
