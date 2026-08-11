# Werkoo

Leadgeneratie-site naar het model van Trustoo: bezoekers doen één aanvraag en ontvangen offertes van
vakmensen in hun regio. De eerste dienst die live staat is **videograaf**.

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

| Script              | Wat het doet                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `npm run dev`       | Ontwikkelserver                                                  |
| `npm run build`     | Productiebuild                                                   |
| `npm run typecheck` | TypeScript controleren                                           |
| `npm run lint`      | ESLint                                                           |
| `npm run assets`    | Logo's kopiëren en de hero-foto uitknippen (zie hieronder)        |
| `npm run shot`      | Screenshot van een pagina, bijv. `npm run shot / hero 1440x900`   |
| `npm run flow`      | Loopt de complete leadflow door in een echte browser              |
| `npm run locatie`   | Controleert de plaatsbepaling met nagebootste geo-headers         |

Met `node scripts/crop.mjs <bestand> <x> <y> <breedte> <hoogte>` snijd je een stuk uit een screenshot,
handig om een detail van dichtbij te bekijken.

## Pagina's

| Route                  | Inhoud                                                            |
| ---------------------- | ----------------------------------------------------------------- |
| `/`                    | Landingspagina videograaf, plaats wordt herkend (zie hieronder)   |
| `/videograaf`          | Zelfde pagina, ook met herkende plaats                            |
| `/videograaf/[plaats]` | Plaatsvariant, bijvoorbeeld `/videograaf/leeuwarden`              |
| `/aanvraag`            | Aanvraag in vier stappen, gevoed door het zoekformulier in de hero |
| `/api/leads`           | Neemt de aanvraag aan (logt hem nu alleen)                        |

## De hero

Vanaf 1024 pixels breed vult de hero precies de ruimte onder de header: `min(100svh -
var(--hoogte-kop), 62rem)`. Die `--hoogte-kop` staat in `globals.css` en wordt ook gebruikt voor
`scroll-padding-top`, zodat de header maar op één plek een hoogte heeft. De bovengrens voorkomt dat
een hele hoge browser een hero oplevert waar de foto in verdrinkt.

De tekstkolom staat verticaal in het midden, de foto staat met `object-bottom` op de onderrand, dus
die loopt precies tot de vouw. Past de inhoud niet in de schermhoogte, dan groeit de hero gewoon mee:
het is een minimum, geen vaste hoogte. Op smallere schermen bepaalt de inhoud de hoogte en staat de
foto onder het formulier.

## Plaatsbepaling

De kop op `/` past zich aan de bezoeker aan: iemand uit Amsterdam leest "De videograaf in Amsterdam".
Dat gebeurt volledig op de server, dus zonder toestemmingsvraag en zonder dat de tekst na het laden
nog verspringt. `bepaalPlaats()` in `src/lib/locatie.ts` kijkt in deze volgorde:

1. `?plaats=` in de url, bedoeld om lokaal te testen en voor advertentielinks
2. het cookie `werkoo-plaats`, dat we zetten zodra iemand zelf een plaats invult in het formulier
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
- Door die persoonlijke tekst worden `/` en `/videograaf` per bezoeker gerenderd. De plaatspagina's
  onder `/videograaf/[plaats]` blijven statisch en zijn daarom de route die je voor SEO en advertenties
  gebruikt. We sturen bezoekers bewust niet automatisch door op basis van hun ip-adres: dat verwart
  zoekmachines en mensen die juist in een andere plaats zoeken.

## Paginaovergangen

Navigeren binnen de site schuift de oude pagina weg en de nieuwe terug, via React's
`<ViewTransition>` (zie `src/components/pagina-overgang.tsx`). De richting hangt aan het
overgangstype dat je meegeeft: `nav-vooruit` bij `router.push` in het zoekformulier, `nav-terug` op de
link terug naar de homepage. Zonder type gebeurt er niets, dus de terugknop van de browser en een
herlaadactie blijven rustig. De header heeft een eigen `view-transition-name` en staat stil, zodat de
bezoeker een vast punt houdt. De animaties staan in `globals.css` en gaan uit bij
`prefers-reduced-motion`.

De terugknop van de browser krijgt geen animatie: Next start bij een geschiedenisnavigatie helemaal
geen view transition, dus er is niets om aan te haken. Daarom heeft de aanvraagpagina een eigen
"Terug naar zoeken" en gaat het logo in de header ook als `nav-terug`; die schuiven wel netjes terug.
Links zonder richting, zoals de menu- en footerlinks, vervagen zacht in plaats van hard te wisselen.

Binnen de aanvraag schuiven de vier stappen op dezelfde manier, met `stap-vooruit` en `stap-terug`
over een kortere afstand omdat het om een blok binnen één kaart gaat. Zo'n stap zit niet aan een
navigatie vast, dus de wisseling loopt via `startTransition` met `addTransitionType`: zonder transitie
animeert een `<ViewTransition>` niet mee. De knop die je verder helpt tekent eerst een vinkje vol
(320 ms) voordat de volgende stap komt.

De veelgestelde vragen zijn gewone `<details>`-elementen, dus ze werken met het toetsenbord en staan
ook zonder JavaScript open te klappen. Het antwoord schuift open doordat `::details-content` van
hoogte nul naar `auto` gaat; dat kan sinds `interpolate-size: allow-keywords`. `content-visibility`
gaat mee met `allow-discrete`, anders zou het antwoord bij het sluiten meteen verdwijnen in plaats van
weg te schuiven. Kent de browser `::details-content` nog niet, dan klapt de vraag gewoon direct open.

## Plaatssuggesties

Het plaatsveld in de hero en in stap 2 van de aanvraag is een keuzelijst die meetypt
(`src/components/plaats-invoer.tsx`). Bij de eerste letter staan de plaatsen uit onze eigen lijst er
meteen; na een korte pauze vult de [Locatieserver van PDOK](https://api.pdok.nl) aan met alle overige
Nederlandse woonplaatsen, met de provincie erachter zodat je twee gelijknamige plaatsen uit elkaar
houdt. Die dienst is gratis, vraagt geen sleutel en staat verzoeken vanuit de browser toe, dus er
loopt niets via onze eigen server. Valt hij weg, dan blijft de eigen lijst gewoon staan.

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
laatste gevulde merk deels wordt ingekleurd zodat een 4,7 er ook als 4,7 uitziet. Zie
`src/components/rating.tsx`.

## Nog te doen

- Aanvragen wegschrijven naar een database en doorsturen naar vakmensen (nu alleen `console.info`)
- Profielpagina's voor vakmensen en een echt aanmeldproces voor bedrijven
- Meer diensten toevoegen in `src/lib/diensten.ts` en de bijbehorende routes
- Sitemap, robots.txt en gestructureerde data voor de plaatspagina's
