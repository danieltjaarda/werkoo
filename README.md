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

## Beeldmateriaal

De originelen staan in `assets-src/`. `npm run assets` maakt daar de webversies van:

- `4.svg` en `5.svg` worden `public/logo-werkoo.svg` (donkere tekst, in gebruik in de header en de
  footer) en `public/logo-werkoo-wit.svg` (witte tekst, klaar voor donkere vlakken).
- `foto.png` is een studiofoto met witte achtergrond. Het script haalt die achtergrond weg met een
  flood fill vanaf de randen, verwijdert ook de grote witte vlakken die door de teal lijn worden
  ingesloten, en schrijft `public/images/videograaf.png` en `.webp`.

Wil je een andere foto gebruiken? Zet hem als `assets-src/foto.png` neer en draai `npm run assets`
opnieuw. Controleer het resultaat met `node scripts/check-cutout.mjs`, dat zet de uitsnede op het
hero-blauw.

## Nog te doen

- Aanvragen wegschrijven naar een database en doorsturen naar vakmensen (nu alleen `console.info`)
- Profielpagina's voor vakmensen en een echt aanmeldproces voor bedrijven
- Meer diensten toevoegen in `src/lib/diensten.ts` en de bijbehorende routes
- Sitemap, robots.txt en gestructureerde data voor de plaatspagina's
