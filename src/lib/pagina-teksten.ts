export type PaginaSectie = {
  kop: string;
  alineas: string[];
  lijst?: string[];
};

export type Paginatekst = {
  slug: string;
  titel: string;
  metaTitel: string;
  metaOmschrijving: string;
  inleiding: string;
  secties: PaginaSectie[];
};

/**
 * De tekst van de pagina's die uit losse alinea's bestaan: de privacyverklaring,
 * de voorwaarden, de aanmeldpagina voor vakmensen en de pagina over ons. Ze
 * staan hier bij elkaar zodat er maar één plek is waar tekst wordt bijgewerkt.
 *
 * De juridische teksten zijn een concept en moeten door een jurist worden
 * nagekeken; dat staat ook in de eerste sectie van die pagina's zelf.
 */
export const paginateksten: Paginatekst[] = [
  {
    slug: "privacy",
    titel: "Privacyverklaring",
    metaTitel: "Privacyverklaring | Werkoo",
    metaOmschrijving: "Welke gegevens Werkoo van je vraagt, waarvoor we ze gebruiken, met wie we ze delen en welke rechten je hebt. Concepttekst, nog niet juridisch nagekeken.",
    inleiding: "Als je op Werkoo een klus beschrijft, geef je ons een paar gegevens over jezelf en over het werk dat je wilt laten doen. Op deze pagina staat wat we daarmee doen, wie ze verder te zien krijgen en hoe je ze weer laat verwijderen. We houden het zo kort en concreet als mogelijk.",
    secties: [
      {
        kop: "Dit is nog een concept",
        alineas: [
          "Deze privacyverklaring is geschreven als opzet en is nog niet door een jurist nagekeken. Dat gebeurt voordat de site live gaat. Tot die tijd kun je aan deze tekst geen rechten ontlenen.",
        ],
      },
      {
        kop: "Wie wij zijn",
        alineas: [
          "Werkoo is een Nederlands platform waar je gratis een klus beschrijft en reacties krijgt van vakmensen in je regio. Wij zijn verantwoordelijk voor de gegevens die je via deze site invult.",
          "Je bereikt ons op hallo@werkoo.nl of 085 - 123 45 67. Ons KvK-nummer is 12345678.",
        ],
      },
      {
        kop: "Welke gegevens we van je vragen",
        alineas: [
          "Bij een aanvraag vragen we alleen wat een vakman nodig heeft om je een reactie te kunnen geven:",
        ],
        lijst: [
          "Je naam",
          "Je e-mailadres",
          "Je telefoonnummer",
          "Je plaats",
          "Het adres van de locatie waar de klus is",
          "De datum waarop je het werk wilt laten doen",
          "Een beschrijving van de klus",
          "Of je updates via WhatsApp wilt ontvangen (optioneel, alleen als je dat zelf aanvinkt)",
        ],
      },
      {
        kop: "Waarvoor we die gegevens gebruiken",
        alineas: [
          "We gebruiken je gegevens om je aanvraag door te geven aan vakmensen, zodat zij contact met je kunnen opnemen. Staat er bij jouw dienst een lijst met profielen, dan gaat je aanvraag alleen naar de vakmensen die je zelf aanvinkt. Is die lijst er nog niet, dan leggen wij je aanvraag voor aan vakmensen die dat werk in jouw regio doen. Daarnaast gebruiken we je gegevens om je op de hoogte te houden van je aanvraag en om te reageren als je ons een vraag stelt.",
          "Als je toestemming hebt gegeven voor WhatsApp, gebruiken we je telefoonnummer ook voor updates via dat kanaal. Die toestemming kun je op elk moment intrekken.",
          "We verkopen je gegevens niet en we gebruiken ze niet om je advertenties te tonen.",
        ],
      },
      {
        kop: "Op welke grondslag we ze verwerken",
        alineas: [
          "Voor het doorgeven van je aanvraag verwerken we je gegevens omdat dat nodig is om te doen wat je van ons vraagt: reacties van vakmensen. Dat geldt zowel wanneer je zelf vakmensen aanvinkt als wanneer wij je aanvraag voorleggen aan vakmensen in jouw regio, want in beide gevallen is dat precies waar je om vraagt. Zonder die gegevens kan er geen reactie komen.",
          "Voor updates via WhatsApp verwerken we je telefoonnummer op basis van je toestemming. Voor het bijhouden van welke aanvragen er via het platform zijn gelopen, hebben we een eigen belang: we moeten kunnen nagaan wat er is doorgegeven en aan wie.",
        ],
      },
      {
        kop: "Met wie we je gegevens delen",
        alineas: [
          "Je aanvraag gaat naar vakmensen die het werk doen dat je zoekt, en naar niemand anders. Zij zien je naam, contactgegevens, het adres van de klus, de gewenste datum en je beschrijving. Vink je zelf vakmensen aan, dan krijgen alleen die personen je gegevens; is er bij jouw dienst nog geen lijst om uit te kiezen, dan bepalen wij aan wie we je aanvraag voorleggen en houden we dat aantal beperkt.",
          "Een vakman die je gegevens ontvangt, is daarna zelf verantwoordelijk voor wat hij daarmee doet. Wij vragen vakmensen je gegevens alleen te gebruiken voor jouw aanvraag.",
          "Verder gebruiken we partijen die onze site en e-mail technisch mogelijk maken, zoals onze hostingpartij en onze e-maildienst. Zij verwerken gegevens in onze opdracht en mogen ze niet voor eigen doelen gebruiken.",
        ],
      },
      {
        kop: "Cookies en de plaatsnaam",
        alineas: [
          "We plaatsen één cookie: werkoo-plaats. Daarin staat de plaats die je zelf hebt ingevuld, zodat je die niet elke keer opnieuw hoeft in te typen. Dat cookie blijft een jaar staan en je kunt het via je browser verwijderen.",
          "Als je nog geen plaats hebt ingevuld, leiden we een plaatsnaam af uit een geo-header die onze hosting meestuurt (Vercel of Cloudflare). We slaan daarbij geen ip-adres op; we gebruiken alleen de plaatsnaam om de juiste vakmensen te tonen.",
          "De plaatssuggesties die je tijdens het typen ziet, komen van de PDOK Locatieserver. Die opvraging gaat rechtstreeks uit je browser naar PDOK; wij ontvangen niet wat je daar intypt.",
        ],
      },
      {
        kop: "Hoe lang we ze bewaren",
        alineas: [
          "We bewaren je gegevens zolang als nodig voor het doel waarvoor je ze hebt achtergelaten, daarna verwijderen we ze. Voor een aanvraag betekent dat: zolang de klus loopt en een tijd daarna, zodat we kunnen nagaan wat er is doorgegeven als jij of een vakman daar een vraag over heeft.",
          "Vraag je ons eerder om verwijdering, dan doen we dat, tenzij we iets moeten bewaren omdat de wet dat van ons vraagt.",
        ],
      },
      {
        kop: "Je rechten",
        alineas: [
          "Je hebt het recht om te vragen welke gegevens we van je hebben, om ze te laten corrigeren als ze niet kloppen en om ze te laten verwijderen. Je kunt ook bezwaar maken tegen het gebruik van je gegevens en je toestemming voor WhatsApp intrekken.",
          "Stuur je verzoek naar hallo@werkoo.nl. We reageren binnen een maand. Om te voorkomen dat we gegevens aan de verkeerde persoon geven, kunnen we je vragen je verzoek te sturen vanaf het e-mailadres waarmee je de aanvraag hebt gedaan.",
          "Ben je niet tevreden over hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.",
        ],
      },
      {
        kop: "Wijzigingen",
        alineas: [
          "Verandert er iets aan wat we met je gegevens doen, dan passen we deze pagina aan. Heb je een vraag over een eerdere versie, mail dan naar hallo@werkoo.nl.",
        ],
      },
    ],
  },
  {
    slug: "voorwaarden",
    titel: "Algemene voorwaarden",
    metaTitel: "Algemene voorwaarden | Werkoo",
    metaOmschrijving: "Wat Werkoo doet en niet doet, hoe de overeenkomst met een vakman tot stand komt, en waar je terechtkomt bij een klacht. Concepttekst, nog niet juridisch nagekeken.",
    inleiding: "Werkoo brengt je in contact met vakmensen in je regio. Hieronder staat wat je van ons kunt verwachten, wat je van een vakman mag verwachten en waar de grens ligt tussen die twee. Deze voorwaarden gelden voor iedereen die de site gebruikt: bezoekers die een klus beschrijven en vakmensen die op het platform staan.",
    secties: [
      {
        kop: "Dit is nog een concept",
        alineas: [
          "Deze algemene voorwaarden zijn geschreven als opzet en zijn nog niet door een jurist nagekeken. Dat gebeurt voordat de site live gaat. Tot die tijd kun je aan deze tekst geen rechten ontlenen.",
        ],
      },
      {
        kop: "Wat Werkoo doet",
        alineas: [
          "Werkoo is een platform, geen aannemer. Je beschrijft je klus en wij zorgen dat die bij vakmensen terechtkomt die dat werk in je regio doen. Staan er profielen bij jouw dienst, dan vink je zelf aan wie je aanvraag mag ontvangen; is die lijst er nog niet, dan kiezen wij aan wie we hem voorleggen. Daarna nemen zij contact met je op.",
          "Wij voeren geen werk uit, geven geen prijsopgaven af namens vakmensen en beoordelen niet of een prijs redelijk is. Bedragen die op de site staan zijn indicaties om je een idee te geven van wat werk ongeveer kost, bijvoorbeeld € 450 tot € 900 voor een dagdeel. Wat je uiteindelijk betaalt, spreek je met de vakman zelf af.",
        ],
      },
      {
        kop: "Een aanvraag is gratis en vrijblijvend",
        alineas: [
          "Het beschrijven van een klus kost je niets. Een paar vragen over wat je zoekt, waar en wanneer, en je bent klaar. Geen abonnement, geen bemiddelingskosten en geen verplichting om iemand te boeken.",
          "Je mag alle reacties naast je neerleggen, met niemand verder praten of je aanvraag intrekken. Wij rekenen niets aan de consument; een vakman betaalt ons pas als hij een opdracht krijgt.",
        ],
      },
      {
        kop: "De overeenkomst sluit je met de vakman",
        alineas: [
          "Zodra je met een vakman afspraken maakt over het werk, de prijs en de planning, ontstaat er een overeenkomst tussen jou en die vakman. Werkoo is daar geen partij in.",
          "Dat betekent dat de vakman verantwoordelijk is voor het werk, de garantie, de facturatie en de afhandeling van klachten over de uitvoering. Afspraken die je met een vakman maakt, binden ons niet.",
        ],
      },
      {
        kop: "Wat wij van vakmensen controleren",
        alineas: [
          "We controleren de KvK-inschrijving en eerder werk voordat iemand op het platform komt. Daarnaast kijken we of het opgegeven werkgebied en de opgegeven diensten kloppen met wat iemand daadwerkelijk doet.",
        ],
        lijst: [
          "Inschrijving bij de Kamer van Koophandel",
          "Eerder uitgevoerd werk",
          "Werkgebied en aangeboden diensten",
          "Contactgegevens waarop iemand bereikbaar is",
        ],
      },
      {
        kop: "Wat die controle niet is",
        alineas: [
          "Onze controle is een eerste zeef, geen keurmerk. We geven geen garantie op de kwaliteit van het werk, op de vakbekwaamheid van een individuele vakman of op de afspraken die hij met je maakt. We houden geen toezicht op de uitvoering en we zijn niet op de klus aanwezig.",
          "Vraag daarom altijd zelf om een schriftelijke opdracht of prijsopgave voordat het werk begint, en spreek af wat er gebeurt als het werk uitloopt of duurder wordt.",
        ],
      },
      {
        kop: "Wat we van jou vragen",
        alineas: [
          "Vul gegevens in die kloppen: je eigen naam, je eigen contactgegevens en het echte adres van de klus. Een vakman moet erop kunnen vertrouwen dat een aanvraag serieus is.",
          "Gebruik het platform niet om reclame te maken, om aanvragen te plaatsen die je niet meent, of om gegevens van vakmensen te verzamelen voor andere doelen. Bij misbruik kunnen we een aanvraag of een profiel verwijderen.",
        ],
      },
      {
        kop: "Aansprakelijkheid",
        alineas: [
          "Wij zijn verantwoordelijk voor het platform: dat het werkt en dat je aanvraag terechtkomt bij de vakmensen die je hebt aangevinkt, of — als je die keuze niet hebt gehad — bij vakmensen die het gevraagde werk in jouw regio doen. Wij zijn niet aansprakelijk voor schade die voortkomt uit het werk van een vakman, uit afspraken die je met hem maakt of uit het niet nakomen daarvan.",
          "We doen ons best om de site beschikbaar te houden en de informatie juist te houden, maar we kunnen niet garanderen dat de site altijd bereikbaar is of dat elk gegeven op de site actueel is.",
          "Is er onverhoopt toch schade waarvoor wij aansprakelijk zijn, dan blijft die aansprakelijkheid beperkt tot wat wij in dat geval van onze verzekering of onder de wet moeten vergoeden. Deze bepaling geldt niet bij opzet of grove schuld van onze kant.",
        ],
      },
      {
        kop: "Een aanvraag of profiel laten verwijderen",
        alineas: [
          "Wil je je aanvraag intrekken, mail dan naar hallo@werkoo.nl met het e-mailadres waarmee je de aanvraag hebt gedaan. We halen je aanvraag dan van het platform. Vakmensen die je gegevens al hebben ontvangen, moet je zelf laten weten dat je afziet van de klus.",
          "Ben je vakman en wil je van het platform af, dan mail je hetzelfde adres of je belt 085 - 123 45 67. We verwijderen je profiel en je gegevens, behalve wat we moeten bewaren voor onze administratie.",
        ],
      },
      {
        kop: "Klachten en toepasselijk recht",
        alineas: [
          "Heb je een klacht over Werkoo zelf, mail dan naar hallo@werkoo.nl. We reageren zo snel als we kunnen en zoeken samen met je naar een oplossing. Gaat je klacht over het werk van een vakman, leg die dan eerst bij hem neer; wij kunnen zijn werk niet beoordelen of herstellen.",
          "Op deze voorwaarden en op het gebruik van Werkoo is Nederlands recht van toepassing. Komen we samen niet tot een oplossing, dan leggen we het geschil voor aan de bevoegde Nederlandse rechter.",
        ],
      },
    ],
  },
  {
    slug: "aanmelden",
    titel: "Werk ontvangen via Werkoo",
    metaTitel: "Aanmelden als vakman bij Werkoo",
    metaOmschrijving: "Meld je aan als vakman bij Werkoo. Je betaalt pas als je via ons een opdracht binnenhaalt: geen abonnement en geen kosten per aanvraag.",
    inleiding: "Werkoo brengt aanvragen van consumenten bij vakmensen in 87 diensten. Je geeft aan welk werk je aanneemt en in welke regio je werkt, en je krijgt alleen aanvragen die daarbij passen. Aanmelden kost niets en je betaalt pas wanneer je via Werkoo een opdracht binnenhaalt.",
    secties: [
      {
        kop: "Wat je krijgt",
        alineas: [
          "Je staat op het platform met een profiel en je ontvangt aanvragen van consumenten die zelf hebben aangegeven dat jij mag reageren. Verder regel je alles direct met de aanvrager.",
        ],
        lijst: [
          "Aanvragen uit de diensten en de regio die je zelf hebt ingesteld.",
          "Een profiel met je werk, je werkgebied en de beoordelingen die je bij ons opbouwt.",
          "Rechtstreeks contact met de aanvrager, zonder dat wij tussen jullie zitten.",
          "Je eigen prijs en je eigen afspraken; wij bepalen niets over je tarief.",
          "Geen kosten om aangemeld te staan.",
        ],
      },
      {
        kop: "Je betaalt pas als je werk binnenhaalt",
        alineas: [
          "Wij verdienen alleen wanneer jij via Werkoo een opdracht krijgt. Ontvang je aanvragen maar komt er geen werk uit, dan betaal je niets. Staat je profiel een maand stil, dan kost die maand je niets.",
          "Wat je betaalt hangt af van de dienst en de opdracht. Je hoort van ons welk bedrag daarbij hoort voordat je live gaat, zodat je kunt narekenen of het uitkomt.",
          "Je bepaalt zelf op welke aanvragen je reageert en welke opdracht je aanneemt. Zeg je nee, dan heeft dat geen gevolgen voor je profiel.",
        ],
      },
      {
        kop: "Wat het niet is",
        alineas: [
          "Werkoo werkt anders dan platforms waar je per aanvraag betaalt of een vast bedrag per maand kwijt bent.",
        ],
        lijst: [
          "Geen abonnement en geen maandbedrag.",
          "Geen kosten per aanvraag of per lead.",
          "Geen aanmeldkosten en geen opstartkosten.",
          "Geen exclusiviteit: je blijft gewoon werk aannemen via je eigen kanalen.",
          "Geen verplichting om op een aanvraag te reageren.",
        ],
      },
      {
        kop: "Zo verloopt de aanmelding",
        alineas: [
          "Vier stappen, en je kunt na iedere stap nog afzien van aanmelden. Hoelang het duurt hangt af van hoe snel we je gegevens en je werk kunnen nakijken en of we je telefonisch te pakken krijgen.",
        ],
        lijst: [
          "Je vult het aanmeldformulier in: bedrijfsnaam, KvK-nummer, het werk dat je doet en de regio waarin je werkt.",
          "Wij controleren de KvK-inschrijving en bekijken eerder werk. Meestal vragen we foto's van afgeronde opdrachten, je website of een paar klanten die we mogen bellen.",
          "We nemen contact op om je profiel door te nemen: wat je aanneemt, wat je niet doet, hoe ver je rijdt en welk bedrag je betaalt bij een opdracht.",
          "Je profiel gaat live. Je ontvangt een aanvraag zodra een consument in jouw dienst en regio jou aanwijst.",
        ],
      },
      {
        kop: "Wat we van je vragen",
        alineas: [
          "We controleren wie er op het platform komt, omdat de consument daarop rekent. Dat betekent ook dat we een aanmelding kunnen afwijzen.",
        ],
        lijst: [
          "Een geldige inschrijving bij de KvK.",
          "Eerder werk dat wij kunnen bekijken: foto's, een website of klanten die we mogen bellen.",
          "Een gemiddelde beoordeling van 8,0 of hoger. Zakt je gemiddelde daaronder, dan halen we je profiel van het platform.",
          "Bereikbaar zijn voor de aanvrager: reageren op berichten en laten weten wanneer je niet kunt.",
          "Duidelijk zijn over je prijs voordat je aan het werk gaat.",
        ],
      },
      {
        kop: "Wat we niet kunnen beloven",
        alineas: [
          "Werkoo is een nieuw platform. Er zijn nu ruim 650 vakmensen aangesloten en er komen ongeveer 6.300 aanvragen per jaar binnen, verdeeld over 87 diensten. Die verdeling is scheef: in sommige diensten en regio's komt regelmatig werk voorbij, in andere kan het weken stil blijven.",
          "Daarom noemen we geen aantal aanvragen per maand. Wil je weten hoe het er in jouw dienst en jouw regio voorstaat, vraag het dan voordat je je aanmeldt. We vertellen wat we zien, ook als dat weinig is.",
          "Ook de aanvragen zelf verschillen. De een weet precies wat hij wil, de ander is nog aan het oriënteren. Je ziet per aanvraag wat er is ingevuld en beslist daarna of je reageert.",
        ],
      },
      {
        kop: "Veelgestelde vragen",
        alineas: [
          "De vragen die ondernemers ons het vaakst stellen voordat ze zich aanmelden.",
        ],
        lijst: [
          "Kost het me iets als ik niets binnenhaal? Nee. Je betaalt alleen over opdrachten die je via Werkoo krijgt. Geen opdracht is geen kosten, ook niet als je aanvragen hebt ontvangen.",
          "Hoeveel aanvragen kan ik verwachten? Dat hangt af van je dienst en je regio. Over het hele platform gaat het om ongeveer 6.300 aanvragen per jaar in 87 diensten, en die zijn niet gelijk verdeeld. We geven je liever geen getal dat we niet waar kunnen maken.",
          "Kan ik mijn regio en mijn soort werk instellen? Ja. Je geeft aan welke diensten je aanneemt en welke plaatsen of postcodes je aanhoudt. Aanvragen daarbuiten krijg je niet. Je past het aan wanneer het je uitkomt, bijvoorbeeld als je agenda vol zit.",
          "Krijg ik elke aanvraag in mijn dienst en regio? Nee. De consument doet één aanvraag en kiest zelf welke vakmensen mogen reageren. Je profiel en je beoordelingen bepalen mede of iemand jou aanwijst.",
          "Kan ik stoppen? Ja, wanneer je wil. Er is geen contract en geen opzegtermijn. Je laat het ons weten en we halen je profiel offline. Opdrachten die je al hebt aangenomen, maak je af met de klant.",
          "Wat als een klus afketst? Komt er geen opdracht uit de aanvraag, dan betaal je niets.",
        ],
      },
      {
        kop: "Aanmelden of eerst iets vragen",
        alineas: [
          "Je meldt je aan via het formulier op deze pagina. Dat kost je een paar minuten en verplicht je tot niets: we nemen daarna contact op om je profiel door te nemen.",
          "Wil je eerst weten hoe het in jouw dienst en regio staat, bel of mail dan. We zijn op werkdagen bereikbaar van 09:00 tot 17:30 via 085 - 123 45 67 en hallo@werkoo.nl.",
        ],
      },
    ],
  },
  {
    slug: "over-ons",
    titel: "Over Werkoo",
    metaTitel: "Over Werkoo: hoe wij werken",
    metaOmschrijving: "Werkoo verbindt consumenten met vakmensen in 87 diensten. Wat we controleren voordat iemand op het platform komt en hoe wij ons geld verdienen.",
    inleiding: "Werkoo is een Nederlands platform dat consumenten en vakmensen bij elkaar brengt in 87 diensten, van dakdekker tot webdesigner. De consument doet gratis één aanvraag en kiest zelf welke vakmensen mogen reageren. De vakman betaalt pas als er werk uit komt. Op deze pagina staat hoe we dat hebben ingericht.",
    secties: [
      {
        kop: "Waarom Werkoo bestaat",
        alineas: [
          "Wie een vakman zoekt, belt er meestal een paar en hoort van één iets terug. Wie zelf vakman is, betaalt bij veel platforms per aanvraag, ook voor aanvragen die niets worden. Aan beide kanten gaat er tijd en geld op aan gesprekken die nergens toe leiden.",
          "Werkoo draait dat om. De consument vult één keer in wat hij zoekt en houdt zelf in de hand wie mag reageren. De vakman betaalt niets om aangemeld te staan en niets per aanvraag, maar pas wanneer hij via Werkoo een opdracht binnenhaalt.",
        ],
      },
      {
        kop: "Hoe het werkt",
        alineas: [
          "Een aanvraag begint met een paar vragen over wat je zoekt, waar en wanneer. Je bent in een minuut klaar en het kost je niets. Daarna zie je welke vakmensen bij je aanvraag passen en geef je aan wie contact met je mag opnemen. Geen abonnement, geen bemiddelingskosten en geen verplichting om iemand te boeken.",
          "Aan de andere kant staat de vakman, die zelf heeft ingesteld welk werk hij doet en in welke regio. Hij ontvangt alleen aanvragen die daarbij passen. Prijs, planning en afspraken maken jullie onderling; wij zitten daar niet tussen.",
        ],
      },
      {
        kop: "Hoe we aan vakmensen komen",
        alineas: [
          "Vakmensen melden zich bij ons aan of we benaderen ze zelf. We nemen geen bedrijven over uit gekochte bestanden en we zetten niemand op het platform die daar niet om heeft gevraagd.",
          "Elke aanmelding gaat langs dezelfde controle. We controleren de KvK-inschrijving en eerder werk voordat iemand op het platform komt. Dat betekent ook dat we aanmeldingen afwijzen.",
        ],
      },
      {
        kop: "Wat we controleren",
        alineas: [
          "De controle gaat over wie iemand is en wat hij eerder heeft gedaan.",
        ],
        lijst: [
          "De inschrijving bij de KvK.",
          "Eerder werk: foto's van afgeronde opdrachten, een website of klanten die we mogen bellen.",
          "Beoordelingen van klanten na een opdracht via Werkoo.",
          "Het gemiddelde per profiel. Zakt dat onder een 8,0, dan halen we het profiel van het platform.",
        ],
      },
      {
        kop: "Wat onze controle niet is",
        alineas: [
          "We staan niet naast de vakman tijdens het werk en we keuren geen losse opdrachten. Wij kijken naar de inschrijving, naar eerder werk en naar wat klanten na een opdracht over iemand zeggen.",
          "Gaat er toch iets mis, laat het ons weten. We kunnen niet in de plaats van jou of de vakman treden, maar we kijken ernaar en het weegt mee in het profiel.",
        ],
      },
      {
        kop: "Hoe wij ons geld verdienen",
        alineas: [
          "Voor de consument is Werkoo gratis. Aan een aanvraag zitten geen kosten en je hoeft niemand te boeken.",
          "Vakmensen betalen geen abonnement en geen bedrag per aanvraag. Ze betalen pas als ze via Werkoo een opdracht binnenhalen. Wordt een aanvraag niets, dan verdienen wij er ook niets aan.",
          "Dat is het hele verdienmodel. We verkopen geen aanvragen door en we verdienen niets aan het aantal aanvragen dat we versturen.",
        ],
      },
      {
        kop: "Waar we nu staan",
        alineas: [
          "Werkoo is een nieuw platform. Dit zijn de aantallen op dit moment.",
          "In de ene dienst en regio hebben we meer vakmensen dan in de andere. Hebben we voor jouw aanvraag niemand in de buurt, dan zeggen we dat in plaats van je door te sturen naar iemand die het werk niet doet.",
        ],
        lijst: [
          "87 diensten, van dakdekker tot webdesigner.",
          "Ruim 650 aangesloten vakmensen.",
          "Ongeveer 6.300 aanvragen per jaar.",
        ],
      },
      {
        kop: "Contact",
        alineas: [
          "Het team zit in Nederland en is op werkdagen bereikbaar van 09:00 tot 17:30 via hallo@werkoo.nl en 085 - 123 45 67.",
          "Vragen over een aanvraag, een vakman die niet reageert of een aanmelding als vakman: bel of mail. Als we iets niet kunnen oplossen, zeggen we dat.",
        ],
      },
    ],
  },
];

export function getPaginatekst(slug: string): Paginatekst | undefined {
  return paginateksten.find((pagina) => pagina.slug === slug);
}
