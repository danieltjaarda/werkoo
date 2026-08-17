# Werkoo

Leadgeneratie-site naar het model van Trustoo: bezoekers doen één aanvraag en ontvangen offertes van
vakmensen in hun regio. De site kent **87 diensten in 6 categorieën**, van dakdekker tot webdesigner.
Alleen bij **videograaf** staan echte profielen; de rest van de diensten heeft wel een volledige
pagina, maar nog geen vakmensenlijst.

## Stack

- [Next.js 16](https://nextjs.org) met de App Router en Turbopack
- React 19 en TypeScript
- Tailwind CSS v4 (design tokens staan in `src/app/globals.css`)
- `sharp` voor het voorbewerken van beeld, `playwright` voor screenshots en de flowtest

## Aan de slag

```bash
npm install
npm run dev
```

De site draait daarna op [http://localhost:3000](http://localhost:3000). Wijkt Next.js uit naar een
andere poort omdat 3000 bezet is, geef die dan mee aan de scripts: `URL=http://localhost:3001 npm run flow`.

| Script              | Wat het doet                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `npm run dev`       | Ontwikkelserver                                                    |
| `npm run build`     | Productiebuild                                                     |
| `npm run typecheck` | TypeScript controleren                                             |
| `npm run lint`      | ESLint                                                             |
| `npm run assets`    | Logo's kopiëren en de hero-foto uitknippen (zie hieronder)          |
| `npm run shot`      | Screenshot van een pagina, bijv. `npm run shot / hero 1440x900`     |
| `npm run flow`      | Loopt de complete leadflow door in een echte browser                |
| `npm run locatie`   | Controleert de plaatsbepaling met nagebootste geo-headers           |
| `npm run routes`    | Controleert de routetabel (zie "Routes" hieronder — belangrijk)     |
| `npm run account`   | Loopt de hele keten door: aanmelden, aanvragen, reageren, terugzien |
| `npm run beveiliging` | Controleert de fouten uit de testronde; draai dit vóór elke release |
| `npm run migreer`   | Draait de sql-migraties in `db/migraties/`                          |
| `npm run seed`      | Zet de vier nagekeken videograafprofielen in de database            |

Met `node scripts/crop.mjs <bestand> <x> <y> <breedte> <hoogte>` snijd je een stuk uit een screenshot,
handig om een detail van dichtbij te bekijken.

## Database en accounts

De site draait op Postgres. Lokaal:

```bash
brew services start postgresql@17
createdb werkoo
cp .env.local.voorbeeld .env.local   # of zet DATABASE_URL zelf
npm run migreer
npm run seed
```

`.env.local` heeft twee waarden nodig:

```
DATABASE_URL=postgresql://localhost:5432/werkoo
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Op Vercel zet je daar de url van Neon of Supabase neer; verder verandert er niets aan
de code. Zet daar ook `NEXT_PUBLIC_SITE_URL` op het echte adres van de site.

**De build heeft de database niet nodig.** Dat was eerst wel zo en dat sloopte de
deployment: `generateStaticParams` en de sitemap vroegen tijdens de build welke diensten
profielen hebben, en zonder `DATABASE_URL` viel de hele build om. Die leesvragen gaan nu via
`vraagZacht()` in `src/lib/db.ts`, dat bij een ontbrekende of onbereikbare database een leeg
antwoord teruggeeft en dat luid in het log zet. Gevolg: de site bouwt en de openbare pagina's
werken altijd; alleen de vakmensenlijsten blijven leeg en de dashboards werken niet zolang er
geen database is. Inloggen en het opslaan van een aanvraag gebruiken `vraagZacht()` bewust
níét — die moeten wél hard falen in plaats van stil doen alsof het goed ging. Het schema staat als leesbare sql in `db/migraties/` en `scripts/migreer.mjs` is
het enige wat het uitvoert — geen ORM, geen generatiestap.

**Accounts.** Inloggen gaat met e-mailadres en wachtwoord. Na vijf mislukte pogingen op
hetzelfde adres zit het een kwartier op slot (tabel `inlogpogingen`). Bij een onbekend adres
rekenen we een hash uit tegen een schijnwaarde, zodat de reactietijd niet verraadt wie er
een account heeft. Wachtwoorden gaan door scrypt
uit de standaardbibliotheek van Node (parameters staan in de hash, zodat we ze later
kunnen verzwaren). Een sessie is een willekeurig token in een httpOnly-cookie met een rij
in `sessies`; verlopen sessies ruimen we op zodra we ze tegenkomen.

Er zijn twee soorten accounts. Een **particulier** doet aanvragen en ziet ze op `/account`.
Een **bedrijf** ontvangt ze en werkt op `/pro`. Bij het registreren als bedrijf maken we
meteen een leeg bedrijfsprofiel aan. Doet iemand eerst een aanvraag zonder account en
registreert hij zich daarna met hetzelfde e-mailadres, dan koppelen we die eerdere
aanvragen alsnog aan het nieuwe account.

Een bedrijfsprofiel kan bestaan zonder account: de vier videograafprofielen uit
`npm run seed` staan er zo in, klaar om later geclaimd te worden.

**Let op bij het koppelen van aanvragen aan accounts.** Een nieuwe aanvraag met het
e-mailadres van een bestaand account hangt zichzelf aan dat account — die richting is
veilig, je geeft iemand hooguit een aanvraag die hij niet heeft gedaan. De omgekeerde
richting doen we bewust níét: zolang er geen bevestigingsmail is, zou registreren op
andermans adres je zijn naam, telefoonnummer, huisadres en klusomschrijving opleveren. Dat
zat er even in en is eruit gehaald; `npm run beveiliging` bewaakt het. Aanvragen van vóór
een registratie blijven dus los tot er e-mailverificatie is.

## Van aanvraag naar reactie

1. De bezoeker doorloopt `/aanvraag` en `POST /api/leads` schrijft de aanvraag weg.
2. Heeft hij zelf vakmensen aangevinkt, dan gaan die de aanvraag krijgen. Anders kiezen
   wij de bovenste vier uit `bedrijvenVoorDienst()`: uitgelichte partners eerst, dan wie
   in de gevraagde plaats zit, dan het hoogste cijfer. Wie een werkgebied heeft ingesteld
   valt af als de plaats daar niet in zit.
3. Elke ontvanger krijgt een rij in `aanvraag_bedrijven` met een status
   (nieuw, in behandeling, gereageerd, gewonnen, niet doorgegaan).
   Wat de browser meestuurt is daarbij een wens, geen opdracht: de server bepaalt zelf wie
   in aanmerking komt en houdt de aangevinkte bedrijven daartegenaan. Zo blijft het
   werkgebied overeind en kan niemand de aanvraag naar alle bedrijven tegelijk sturen.
   Zijn er nul ontvangers, dan zegt de bevestiging dat ook — geen belofte over reacties
   binnen een dag als er niemand is aangesloten.
4. De vakman ziet de aanvraag op `/pro/aanvragen`, reageert met een bericht en een
   prijsindicatie, en die reactie verschijnt bij de klant op `/account/[referentie]`.

`npm run account` loopt precies die keten door in een echte browser.

## Routes

| Route                     | Rendering | Inhoud                                                        |
| ------------------------- | --------- | ------------------------------------------------------------- |
| `/`                       | dynamisch | Homepage met dienstzoeker; plaats wordt herkend               |
| `/diensten`               | statisch  | Alle 87 diensten, gegroepeerd per categorie                   |
| `/diensten/[categorie]`   | statisch  | Eén van de zes categorieën                                    |
| `/[dienst]`               | dynamisch | Dienstpagina, bijvoorbeeld `/dakdekker`; plaats wordt herkend |
| `/[dienst]/[plaats]`      | statisch  | Plaatsvariant, bijvoorbeeld `/videograaf/leeuwarden`          |
| `/aanvraag`               | dynamisch | De aanvraagflow; zonder `?dienst=` eerst een dienstkeuze      |
| `/aanmelden`              | statisch  | Werk ontvangen: de pagina voor vakmensen                      |
| `/over-ons`               | statisch  | Wie we zijn en hoe we ons geld verdienen                      |
| `/inloggen`               | dynamisch | Inloggen en registreren                                       |
| `/account`                | dynamisch | Mijn aanvragen (particulier)                                  |
| `/account/[referentie]`   | dynamisch | Eén aanvraag met de reacties erop                             |
| `/pro`                    | dynamisch | Dashboard van een vakman                                      |
| `/pro/aanvragen`          | dynamisch | Binnengekomen aanvragen, met statusfilter                     |
| `/pro/aanvragen/[id]`     | dynamisch | Eén aanvraag: contactgegevens, status en reageren             |
| `/pro/instellingen`       | dynamisch | Profiel, diensten, werkgebied en beschikbaarheid              |
| `/privacy`, `/voorwaarden`| statisch  | Juridische teksten (concept, zie hieronder)                   |
| `/api/leads`              | —         | Neemt de aanvraag aan (logt hem nu alleen)                    |

**Let op bij het wijzigen van routes.** `/[dienst]` staat op het hoogste niveau en vangt daarmee elke
url van één segment. Dat `/diensten`, `/aanvraag` en `/inloggen` tóch hun eigen pagina tonen komt
doordat Next.js statische segmenten vóór dynamische sorteert — gedrag dat in de documentatie van
Next 16 nergens staat beschreven. `npm run routes` controleert dit, plus dat een onbekende dienst of
plaats een echte 404 geeft. Draai dat script na elke wijziging aan de routeboom.

Een tweede gevolg: `app/not-found.tsx` vangt onbekende diensten niet vanzelf, want de route matcht
wél. Zowel `/[dienst]` als `/[dienst]/[plaats]` roept daarom expliciet `notFound()` aan, direct na
`await params` en dus voordat er iets gestreamd is. Alleen dan is het een echte HTTP 404 en geen
soft 404 met enkel een noindex-tag.

## De dienstencatalogus

Alle diensten staan in `src/lib/dienst-data.ts`, met de opzoekfuncties in `src/lib/diensten.ts`. Eén
record erbij is genoeg: de route, het mega-menu, de sitemap, het dienstenoverzicht en de aanvraagflow
volgen automatisch. Per dienst leggen we vast:

- `slug`, `naam` (enkelvoud), `meervoud`, `menuLabel` (meervoud, voor het menu)
- `lidwoordNaam` en `kopStaart`, samen goed voor de kop: "**Het** verhuisbedrijf in Joure **dat bij
  jouw verhuizing past**". Het lidwoord bepaalt of het "die" of "dat" wordt
- `opties`: de keuzes bij "Waarvoor zoek je …?", altijd eindigend op "Iets anders"
- `prijs`: het antwoord op "Wat kost een …?" — richtbedragen voor de Nederlandse markt, geen offerte
- `letOp`: drie controlepunten die een leek niet kent
- `vragen`: twee vragen die over het vak gaan, naast de algemene vragen uit `src/lib/content.ts`
- `foto`: alleen bij videograaf. Diensten mét foto krijgen de hero met twee kolommen, diensten
  zonder foto een gecentreerde hero waarin het formulier het middelpunt is

De prijzen horen periodiek nagelopen te worden.

## Vakmensen

De profielen staan in de database, niet meer in een vast bestand. `npm run seed` zet de vier
nagekeken videograafprofielen erin; alles wat daarna bij komt zijn echte aanmeldingen. Voor
de andere 86 diensten is er nog geen lijst, en we tonen daar bewust géén verzonnen
bedrijven; die pagina's vullen die plek met de prijsindicatie en de controlepunten. Dat
werkt door in drie dingen:

- de sectie "… die werken in Joure" valt weg als er geen profielen zijn
- de vakmensenstap in de aanvraagflow valt weg, waardoor die flow negen of acht vragen telt
- `/api/leads` accepteert daarom een lege `vakmensen`-lijst; wij leggen de aanvraag dan zelf voor

## De aanvraagflow

`/aanvraag?dienst=dakdekker` stelt de vragen op een eigen scherm: plaats, waarvoor, datum, adres,
wensen, (vakmensen), e-mail, naam en telefoon. Boven staat een voortgangsbalk met een sluitknop,
rechts een kolom met de gekozen vakman (of sociaal bewijs als er geen vakman is gekozen) en onderaan
een plakkende balk met "Vorige vraag" links en de hoofdknop in het midden. Bij de drie optionele
vragen heet die knop "Overslaan" zolang er niets is ingevuld.

Kom je op `/aanvraag` zonder `?dienst=`, dan kies je eerst de dienst via hetzelfde zoekveld als op de
homepage. Komt de bezoeker binnen via een knop bij een vakman
(`/aanvraag?dienst=videograaf&vakman=studio-noordlicht`), dan staat die vakman in de zijkolom en
kleurt de kalender zijn bezette dagen.

De datumvraag gebruikt `src/components/kalender.tsx`: twee maanden naast elkaar op een breed scherm,
één op een telefoon, en je mag meerdere dagen aanvinken. Dagen die al geweest zijn vervagen, dagen
waarop de vakman bezet is worden doorgestreept. Die bezetting is echt: ze komt uit
`bedrijf_bezet`, dat de vakman zelf vult onder Beschikbaarheid in zijn instellingen.

Na het versturen volgt de bevestiging met een referentie, en daaronder de keuze om een account te
maken. Op `/inloggen` staat dezelfde kaart, met bovenaan de keuze tussen particulier en bedrijf. Er
zit nog geen echte aanmelding achter; het is voorlopig alleen de schil.

## Plaatsbepaling

De kop past zich aan de bezoeker aan: iemand uit Amsterdam leest "De videograaf in Amsterdam". Dat
gebeurt volledig op de server, dus zonder toestemmingsvraag en zonder dat de tekst na het laden nog
verspringt. `bepaalPlaats()` in `src/lib/locatie.ts` kijkt in deze volgorde:

1. `?plaats=` in de url, bedoeld om lokaal te testen en voor advertentielinks
2. het cookie `werkoo-plaats`, dat we zetten zodra iemand zelf een plaats invult — op de homepage, in
   het formulier op een dienstpagina, en bij de eerste vraag van de aanvraagflow
3. de geo-header van de hosting: `x-vercel-ip-city` op Vercel, `cf-ipcity` op Cloudflare
4. anders "de buurt", en dan blijft het plaatsveld leeg

Wat er uit een header of cookie komt is nooit te vertrouwen, dus `normaliseerPlaats()` accepteert
alleen iets dat op een plaatsnaam lijkt en geeft daarna de schrijfwijze uit `src/lib/plaatsen.ts`
terug. Staat de plaats niet in die lijst, dan tonen we de naam wel, maar netjes met hoofdletters. Bij
een bezoeker buiten Nederland en België houden we het algemeen.

Twee dingen om te weten bij het uitrollen:

- De geo-headers bestaan alleen op de hosting. Lokaal zie je dus altijd "de buurt", tenzij je
  `?plaats=amsterdam` gebruikt of de header zelf meestuurt. Op Cloudflare moet je de managed
  transform "Add visitor location headers" aanzetten, anders krijg je alleen het land.
- Door die persoonlijke tekst worden `/` en `/[dienst]` per bezoeker gerenderd. De plaatspagina's
  onder `/[dienst]/[plaats]` blijven statisch en zijn daarom de route die je voor SEO en advertenties
  gebruikt. Zet `cookies()` of `headers()` daarom nooit in een gedeelde `layout.tsx`: dan sleep je
  élke plaatspagina mee de dynamische rendering in. We sturen bezoekers bewust niet automatisch door
  op basis van hun ip-adres: dat verwart zoekmachines en mensen die juist in een andere plaats zoeken.

## Zoekmachines

`app/sitemap.ts` zet de homepage, het dienstenoverzicht, de zes categorieën, alle 87 dienstpagina's
en de statische pagina's in de sitemap. De plaatsvarianten staan er **alleen in voor diensten met
profielen** — 87 × 40 combinaties zouden duizenden pagina's opleveren die onderling nauwelijks
verschillen, en dat is precies wat een zoekmachine als doorway pages ziet. Om dezelfde reden geeft
`/[dienst]/[plaats]` een 404 voor plaatsen die niet in `src/lib/plaatsen.ts` staan.

`generateStaticParams` in `/[dienst]/[plaats]` bouwt alleen de combinaties met profielen (nu 40
pagina's). De rest wordt bij het eerste bezoek gerenderd en daarna bewaard. Verwijder die functie
niet om "niets te bouwen": zonder `generateStaticParams` wordt de route bij élk request opnieuw
gerenderd. Een lege array teruggeven is de manier om niets bij de build te doen en tóch statisch te
blijven.

Elke dienstpagina bevat gestructureerde data (`src/components/structured-data.tsx`): een kruimelpad,
de dienst zelf en de vragenlijst als `FAQPage`. Die vragen staan ook echt op de pagina, in de
uitklappers — anders mag Google ze niet als rich result tonen. `app/robots.ts` sluit `/api/`,
`/aanvraag` en `/inloggen` uit.

## Vormgeving

De tokens staan in `@theme` in `src/app/globals.css`:

- **Typografie** als schaal, niet als losse pixelwaarden: `text-h1` tot `text-h5` voor koppen en
  `text-lead`, `text-lees`, `text-basis`, `text-klein` en `text-mini` voor tekst. De koppen schalen
  met `clamp()` mee met het scherm, dus er is geen aparte `sm:`-variant per kop nodig.
- **Ritme**: elke sectie gebruikt `.sectie` (of `.sectie-onder`), dat één waarde
  `--ruimte-sectie` aanhoudt. De achtergronden lopen om en om wit, `bg-brand-soft` en `bg-ink`.
- **Vlakken**: `.kaart` is wit met een dunne lijn en `shadow-kaart`. De straal staat op twee plekken
  in `globals.css` — normaal en in het squircle-blok — zodat een kaart dezelfde hoek heeft als een
  `rounded-3xl` ernaast.
- **Focus**: één regel geeft elk bedienbaar element een zichtbare focusring. Verborgen radio's en
  checkboxen (`sr-only`) slaan we over; daar zet het label zelf een ring met `has-[:focus-visible]`.

Chromium tekent met `corner-shape: squircle` een superellips in plaats van een cirkelboog; Safari en
Firefox kennen de eigenschap nog niet en houden gewoon ronde hoeken.

Let op: `priority` op `next/image` is in Next 16 vervangen door `preload`.

## Het mega-menu

`src/components/diensten-menu.tsx` klapt onder de header open over de volle breedte, met de zes
categorieën naast elkaar. Met 87 diensten is doorlezen geen optie meer, dus er zit een filterveld
boven: typ "dak" en je krijgt de drie dakspecialisten met hun categorie erachter. Het paneel gaat
open op hover én op klik, sluit met Escape, met een klik ernaast en met een klik op een link, en
gebruikt een korte vertraging bij het weggaan zodat de weg naar het paneel vergevend is. Op een
telefoon staat dezelfde inhoud in `src/components/mobile-menu.tsx` als uitklapbare categorieën.

## Paginaovergangen

Navigeren binnen de site schuift de oude pagina weg en de nieuwe terug, via React's
`<ViewTransition>` (zie `src/components/pagina-overgang.tsx`). De richting hangt aan het
overgangstype dat je meegeeft: `nav-vooruit` bij `router.push` in de zoekformulieren, `nav-terug` op
de link terug naar de homepage. Zonder type gebeurt er niets, dus de terugknop van de browser en een
herlaadactie blijven rustig. De header heeft een eigen `view-transition-name` en staat stil, zodat de
bezoeker een vast punt houdt. De animaties staan in `globals.css` en gaan uit bij
`prefers-reduced-motion`.

De terugknop van de browser krijgt geen animatie: Next start bij een geschiedenisnavigatie helemaal
geen view transition, dus er is niets om aan te haken. Links zonder richting, zoals de menu- en
footerlinks, vervagen zacht in plaats van hard te wisselen.

Binnen de aanvraag schuiven de stappen op dezelfde manier, met `stap-vooruit` en `stap-terug` over
een kortere afstand omdat het om een blok binnen één kaart gaat. Zo'n stap zit niet aan een navigatie
vast, dus de wisseling loopt via `startTransition` met `addTransitionType`: zonder transitie animeert
een `<ViewTransition>` niet mee. De knop die je verder helpt tekent eerst een vinkje vol (320 ms)
voordat de volgende stap komt.

De veelgestelde vragen zijn gewone `<details>`-elementen, dus ze werken met het toetsenbord en staan
ook zonder JavaScript open te klappen. Het antwoord schuift open doordat `::details-content` van
hoogte nul naar `auto` gaat; dat kan sinds `interpolate-size: allow-keywords`. `content-visibility`
gaat mee met `allow-discrete`, anders zou het antwoord bij het sluiten meteen verdwijnen in plaats van
weg te schuiven. Kent de browser `::details-content` nog niet, dan klapt de vraag gewoon direct open.

## Zoekvelden

Twee keuzelijsten die meetypen, allebei met dezelfde toetsenbordbediening (pijltjes, Enter, Escape):

- `src/components/dienst-zoeker.tsx` zoekt over alle 87 diensten, op naam, meervoud, menulabel en de
  losse opties. Een treffer aan het begin van een woord weegt zwaarder dan een treffer in het midden.
  Staat op de homepage en op `/aanvraag` zonder dienst.
- `src/components/plaats-invoer.tsx` doet plaatsen en adressen. Bij de eerste letter staan de plaatsen
  uit onze eigen lijst er meteen; na een korte pauze vult de
  [Locatieserver van PDOK](https://api.pdok.nl) aan met alle overige Nederlandse woonplaatsen. Die
  dienst is gratis, vraagt geen sleutel en staat verzoeken vanuit de browser toe, dus er loopt niets
  via onze eigen server. Valt hij weg, dan blijft de eigen lijst gewoon staan. Met `soort="adres"`
  vraagt hij `type:adres` op en toont hij straat, huisnummer, postcode en plaats.

## Lettertypes

Montserrat draagt de hele site en komt via `next/font/google`. De dienstnaam in de titel staat in
Sentient Medium Italic; die staat niet op Google Fonts, dus het bestand komt van
[Fontshare](https://www.fontshare.com/fonts/sentient) en ligt als
`src/app/fonts/sentient-medium-italic.woff2` in de repo. Zo laadt de pagina niets van een externe
server. Wil je een andere snede van Sentient, haal die dan bij Fontshare op en wijs `localFont` in
`src/app/layout.tsx` naar het nieuwe bestand.

## Beeldmateriaal

De originelen staan in `assets-src/`. `npm run assets` maakt daar de webversies van:

- `4.svg` en `5.svg` worden `public/logo-werkoo.svg` (donkere tekst, in gebruik in de header en de
  footer) en `public/logo-werkoo-wit.svg` (witte tekst, klaar voor donkere vlakken).
- `merk.svg` is het beeldmerk zonder tekst. Ondanks de extensie is het geen vector: er zitten twee
  base64-PNG's in, één met de kleuren en één als grijswaardenmask. Het script plakt de mask als
  doorzichtigheid op de kleuren, snijdt de lege rand weg en maakt er drie bestanden van:
  `public/images/werkoo-merk.png` voor de waarderingen, plus `src/app/icon.png` en
  `src/app/apple-icon.png` als favicon. Die laatste twee pikt Next vanzelf op; het Apple-icoon krijgt
  een witte achtergrond omdat iOS doorzichtige iconen op zwart zet.
- `profielen/*.png` zijn de foto's bij de vakmensen in de lijst. Ze worden bijgesneden op de
  verhouding van het vlak in de kaart en als webp naar `public/images/profielen/` geschreven. De
  uitsnede gebruikt `position: "attention"`, zodat het drukste deel van de foto in beeld blijft.
- `foto.png` is een studiofoto met witte achtergrond. Het script haalt die achtergrond weg met een
  flood fill vanaf de randen, verwijdert ook de grote witte vlakken die door de teal lijn worden
  ingesloten, en schrijft `public/images/videograaf.png` en `.webp`.

Wil je een andere foto gebruiken? Zet hem als `assets-src/foto.png` neer en draai `npm run assets`
opnieuw. Controleer het resultaat met `node scripts/check-cutout.mjs`, dat zet de uitsnede op het
hero-blauw.

De waarderingen gebruiken het beeldmerk in plaats van sterren: vijf merken naast elkaar, waarvan het
laatste gevulde merk deels wordt ingekleurd zodat een 9,4 er ook als 9,4 uitziet. Zie
`src/components/rating.tsx`.

## Nog te doen

- **Er gaat nog geen mail de deur uit.** Een vakman ziet een nieuwe aanvraag pas als hij zelf
  inlogt, en een klant hoort niets als er een reactie binnenkomt. Daar is een mailprovider
  voor nodig (Resend, Postmark); zodra die er is horen de meldingen aan
  `bewaarAanvraag()` en `bewaarReactie()` te hangen.
- **Wachtwoord vergeten kan niet.** Dat heeft dezelfde mailprovider nodig.
- **De juridische teksten zijn een concept.** `/privacy` en `/voorwaarden` zijn als opzet geschreven
  en moeten door een jurist worden nagekeken voordat de site live gaat. Dat staat ook in de eerste
  sectie van beide pagina's zelf; haal die pas weg als het echt is nagekeken.
- De kop van de openbare site toont altijd "Inloggen", ook als je al bent ingelogd. Dat is met
  opzet: `cookies()` uitlezen in `SiteHeader` zou elke pagina dynamisch maken. `/inloggen`
  stuurt een ingelogde bezoeker meteen door naar zijn eigen omgeving.
- Reviews bestaan nog niet. De cijfers bij een profiel (`score`, `reviews`) staan in de
  database maar worden nergens ingevuld; er is geen manier om een beoordeling achter te laten.
- Inloggen met Google of Apple. De knoppen zijn weggehaald omdat ze niets deden; ze horen
  pas terug als er een OAuth-client is.
- Echte profielen voor de overige 86 diensten, plus profielpagina's per vakman
- De cijfers in `src/components/cijfer-balk.tsx` en de hero (9,4 uit 4.384 beoordelingen, 650+
  vakmensen) zijn nog vaste waarden en horen uit de database te komen
- De prijzen in de catalogus periodiek nalopen
