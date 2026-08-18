"use client";

import { useActionState, useState } from "react";
import { Kalender } from "@/components/kalender";
import { ProvincieKaart } from "@/components/provincie-kaart";
import { SearchIcon } from "@/components/icons";
import {
  beschikbaarheidOpslaan,
  dienstenOpslaan,
  profielOpslaan,
  werkgebiedOpslaan,
  type Uitkomst,
} from "@/lib/pro-acties";
import { categorieen, dienstenVanCategorie, zoekDiensten, type Dienst } from "@/lib/diensten";

const leeg: Uitkomst = {};

const veldklassen =
  "mt-2 h-veld w-full rounded-2xl border border-lijn bg-white px-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15";

const aankruisklassen =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-lijn bg-white px-3.5 py-2.5 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-deep";

function Melding({ staat }: { staat: Uitkomst }) {
  if (staat.fout) {
    return (
      <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-basis font-medium text-red-700">
        {staat.fout}
      </p>
    );
  }
  if (staat.gelukt) {
    return (
      <p role="status" className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-basis font-medium text-emerald-700">
        {staat.gelukt}
      </p>
    );
  }
  return null;
}

function Opslaan({ bezig }: { bezig: boolean }) {
  return (
    <button
      type="submit"
      aria-disabled={bezig}
      className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-ink px-6 font-display text-basis font-medium text-white transition hover:bg-brand-deep"
    >
      {bezig ? "Opslaan…" : "Opslaan"}
    </button>
  );
}

function Blok({ id, titel, uitleg, children }: { id: string; titel: string; uitleg: string; children: React.ReactNode }) {
  return (
    <section id={id} className="kaart scroll-mt-28 p-6 sm:p-8">
      <h2 className="font-display text-h4 text-ink">{titel}</h2>
      <p className="mt-1.5 max-w-2xl text-basis text-ink-soft">{uitleg}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

type Profiel = {
  naam: string;
  plaats: string;
  adres: string;
  telefoon: string;
  belofte: string;
  tekst: string;
  jaren: number;
  actief: boolean;
  kvk: string;
  website: string;
  postcode: string;
};

function ProfielFormulier({ profiel }: { profiel: Profiel }) {
  const [staat, actie, bezig] = useActionState(profielOpslaan, leeg);

  return (
    <form action={actie}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="naam" className="block text-basis font-semibold text-ink">
            Bedrijfsnaam
          </label>
          <input id="naam" name="naam" defaultValue={profiel.naam} required className={veldklassen} />
        </div>

        <div>
          <label htmlFor="plaats" className="block text-basis font-semibold text-ink">
            Vestigingsplaats
          </label>
          <input id="plaats" name="plaats" defaultValue={profiel.plaats} className={veldklassen} />
        </div>

        <div>
          <label htmlFor="telefoon" className="block text-basis font-semibold text-ink">
            Telefoonnummer
          </label>
          <input id="telefoon" name="telefoon" defaultValue={profiel.telefoon} className={veldklassen} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="adres" className="block text-basis font-semibold text-ink">
            Adres
          </label>
          <input id="adres" name="adres" defaultValue={profiel.adres} className={veldklassen} />
        </div>

        <div>
          <label htmlFor="postcode" className="block text-basis font-semibold text-ink">
            Postcode
          </label>
          <input id="postcode" name="postcode" defaultValue={profiel.postcode} autoComplete="postal-code" className={veldklassen} />
        </div>

        <div>
          <label htmlFor="website" className="block text-basis font-semibold text-ink">
            Website <span className="font-normal text-ink-soft">(niet openbaar)</span>
          </label>
          <input id="website" name="website" defaultValue={profiel.website} inputMode="url" className={veldklassen} />
        </div>

        <div>
          <label htmlFor="kvk" className="block text-basis font-semibold text-ink">
            KvK-nummer <span className="font-normal text-ink-soft">(niet openbaar)</span>
          </label>
          <input id="kvk" name="kvk" defaultValue={profiel.kvk} inputMode="numeric" className={veldklassen} />
        </div>

        <div>
          <label htmlFor="jaren" className="block text-basis font-semibold text-ink">
            Jaren in bedrijf
          </label>
          <input
            id="jaren"
            name="jaren"
            type="number"
            min={0}
            max={200}
            defaultValue={profiel.jaren}
            className={veldklassen}
          />
        </div>

        <div>
          <label htmlFor="belofte" className="block text-basis font-semibold text-ink">
            Korte belofte
          </label>
          <input
            id="belofte"
            name="belofte"
            defaultValue={profiel.belofte}
            placeholder="van eerste opzet tot montage"
            className={veldklassen}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tekst" className="block text-basis font-semibold text-ink">
            Omschrijving
          </label>
          <textarea
            id="tekst"
            name="tekst"
            rows={5}
            defaultValue={profiel.tekst}
            placeholder="Wat doe je, voor wie, en waarin ben je anders dan de rest?"
            className="mt-2 w-full rounded-2xl border border-lijn bg-white p-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-lijn bg-white px-4 py-3.5 transition has-[:checked]:border-ink has-[:checked]:bg-brand-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-deep">
        <input type="checkbox" name="actief" value="aan" defaultChecked={profiel.actief} className="mt-0.5" />
        <span>
          <span className="block text-basis font-semibold text-ink">Mijn profiel is zichtbaar</span>
          <span className="mt-0.5 block text-klein text-ink-soft">
            Staat dit uit, dan sta je niet in de lijsten en ontvang je geen aanvragen.
          </span>
        </span>
      </label>

      <Melding staat={staat} />
      <Opslaan bezig={bezig} />
    </form>
  );
}

function DienstenFormulier({ gekozen }: { gekozen: string[] }) {
  const [staat, actie, bezig] = useActionState(dienstenOpslaan, leeg);
  const [term, setTerm] = useState("");
  const [selectie, setSelectie] = useState<string[]>(gekozen);

  const treffers: Dienst[] = term.trim() ? zoekDiensten(term, 12) : [];

  function wissel(slug: string) {
    setSelectie((vorige) => (vorige.includes(slug) ? vorige.filter((s) => s !== slug) : [...vorige, slug]));
  }

  return (
    <form action={actie}>
      {/* De keuze zit in state, dus de verborgen velden dragen hem naar de server. */}
      {selectie.map((slug) => (
        <input key={slug} type="hidden" name="dienst" value={slug} />
      ))}

      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Zoek een dienst"
          aria-label="Zoek een dienst"
          className="h-11 w-full rounded-xl border border-lijn bg-white pl-11 pr-4 text-basis text-ink outline-none transition placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/15"
        />
      </div>

      <p className="mt-4 text-klein text-ink-soft">
        {selectie.length === 0 ? "Nog niets gekozen" : `${selectie.length} gekozen`}
      </p>

      {selectie.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {selectie.map((slug) => (
            <li key={slug}>
              <button
                type="button"
                onClick={() => wissel(slug)}
                className="flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-klein font-medium text-white transition hover:bg-brand-deep"
              >
                {slug}
                <span aria-hidden>×</span>
                <span className="sr-only">verwijderen</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 max-h-96 space-y-5 overflow-y-auto rounded-2xl border border-lijn p-4">
        {term.trim() ? (
          treffers.length === 0 ? (
            <p className="text-basis text-ink-soft">Geen dienst gevonden voor {term.trim()}.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {treffers.map((dienst) => (
                <li key={dienst.slug}>
                  <label className={aankruisklassen}>
                    <input
                      type="checkbox"
                      checked={selectie.includes(dienst.slug)}
                      onChange={() => wissel(dienst.slug)}
                    />
                    <span className="text-basis text-ink">{dienst.menuLabel}</span>
                  </label>
                </li>
              ))}
            </ul>
          )
        ) : (
          categorieen.map((categorie) => (
            <div key={categorie.id}>
              <p className="font-display text-basis font-bold text-ink">{categorie.titel}</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {dienstenVanCategorie(categorie.id).map((dienst) => (
                  <li key={dienst.slug}>
                    <label className={aankruisklassen}>
                      <input
                        type="checkbox"
                        checked={selectie.includes(dienst.slug)}
                        onChange={() => wissel(dienst.slug)}
                      />
                      <span className="text-basis text-ink">{dienst.menuLabel}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <Melding staat={staat} />
      <Opslaan bezig={bezig} />
    </form>
  );
}

function WerkgebiedFormulier({
  plaatsen,
  gekozen,
  provincies,
}: {
  plaatsen: readonly string[];
  gekozen: string[];
  provincies: string[];
}) {
  const [staat, actie, bezig] = useActionState(werkgebiedOpslaan, leeg);
  const [selectie, setSelectie] = useState<string[]>(gekozen);
  const [gebieden, setGebieden] = useState<string[]>(provincies);
  const [toonPlaatsen, setToonPlaatsen] = useState(gekozen.length > 0);

  function wisselProvincie(naam: string) {
    setGebieden((vorige) => (vorige.includes(naam) ? vorige.filter((p) => p !== naam) : [...vorige, naam]));
  }

  const leegGebied = gebieden.length === 0 && selectie.length === 0;

  return (
    <form action={actie}>
      {selectie.map((plaats) => (
        <input key={plaats} type="hidden" name="plaats" value={plaats} />
      ))}
      {gebieden.map((provincie) => (
        <input key={provincie} type="hidden" name="provincie" value={provincie} />
      ))}

      <p className="text-klein text-ink-soft">
        {leegGebied
          ? "Niets aangevinkt betekent: heel Nederland."
          : [
              gebieden.length ? `${gebieden.length} ${gebieden.length === 1 ? "provincie" : "provincies"}` : "",
              selectie.length ? `${selectie.length} losse ${selectie.length === 1 ? "plaats" : "plaatsen"}` : "",
            ]
              .filter(Boolean)
              .join(" en ")}
      </p>

      <div className="mt-4">
        <ProvincieKaart gekozen={gebieden} onWissel={wisselProvincie} naam="weergave-provincie" />
      </div>

      <div className="mt-6 border-t border-lijn pt-5">
        <button
          type="button"
          onClick={() => setToonPlaatsen((v) => !v)}
          aria-expanded={toonPlaatsen}
          className="text-basis font-semibold text-brand-deep underline-offset-4 hover:underline"
        >
          {toonPlaatsen ? "Losse plaatsen verbergen" : "Liever losse plaatsen kiezen? Open de lijst"}
        </button>
        {toonPlaatsen ? (
          <>
            <p className="mt-2 text-klein text-ink-soft">
              Handig als je maar in een paar steden werkt. Dit staat los van de provincies hierboven; alles wat je
              aanvinkt telt mee.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {plaatsen.map((plaats) => (
                <li key={plaats}>
                  <label className={aankruisklassen}>
                    <input
                      type="checkbox"
                      checked={selectie.includes(plaats)}
                      onChange={() =>
                        setSelectie((vorige) =>
                          vorige.includes(plaats) ? vorige.filter((p) => p !== plaats) : [...vorige, plaats],
                        )
                      }
                    />
                    <span className="text-basis text-ink">{plaats}</span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <Melding staat={staat} />
      <Opslaan bezig={bezig} />
    </form>
  );
}

function BeschikbaarheidFormulier({ bezet }: { bezet: string[] }) {
  const [staat, actie, bezig] = useActionState(beschikbaarheidOpslaan, leeg);
  const [dagen, setDagen] = useState<string[]>(bezet);

  return (
    <form action={actie}>
      {dagen.map((dag) => (
        <input key={dag} type="hidden" name="dag" value={dag} />
      ))}

      <p className="text-klein text-ink-soft">
        Klik een dag aan om hem op bezet te zetten. Bezette dagen staan doorgestreept in de kalender die
        klanten bij jouw profiel zien.
      </p>

      <div className="mt-4 max-w-2xl">
        <Kalender gekozen={dagen} onWijzig={setDagen} />
      </div>

      <Melding staat={staat} />
      <Opslaan bezig={bezig} />
    </form>
  );
}

export function ProInstellingen({
  profiel,
  diensten,
  plaatsen,
  werkgebied,
  provincies,
  bezet,
}: {
  profiel: Profiel;
  diensten: string[];
  plaatsen: readonly string[];
  werkgebied: string[];
  provincies: string[];
  bezet: string[];
}) {
  return (
    <div className="mt-10 space-y-6">
      <Blok id="profiel" titel="Je bedrijfsprofiel" uitleg="Dit is wat klanten van je zien in de lijst en op je kaart.">
        <ProfielFormulier profiel={profiel} />
      </Blok>

      <Blok
        id="diensten"
        titel="Je diensten"
        uitleg="Alleen aanvragen voor deze diensten komen bij jou binnen. Kies er gerust meerdere."
      >
        <DienstenFormulier gekozen={diensten} />
      </Blok>

      <Blok
        id="werkgebied"
        titel="Je werkgebied"
        uitleg="Klik op de kaart in welke provincies je werkt. Vink je niets aan, dan krijg je aanvragen uit heel Nederland."
      >
        <WerkgebiedFormulier plaatsen={plaatsen} gekozen={werkgebied} provincies={provincies} />
      </Blok>

      <Blok
        id="beschikbaarheid"
        titel="Je beschikbaarheid"
        uitleg="Dagen waarop je al vol zit. Klanten zien die doorgestreept staan als ze een datum kiezen."
      >
        <BeschikbaarheidFormulier bezet={bezet} />
      </Blok>
    </div>
  );
}
