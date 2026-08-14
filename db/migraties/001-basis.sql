-- Accounts, bedrijfsprofielen, aanvragen en reacties: alles wat nodig is om een
-- aanvraag van de bezoeker bij een vakman te krijgen en het antwoord terug.

create table if not exists gebruikers (
  id uuid primary key default gen_random_uuid(),
  -- Altijd in kleine letters opgeslagen; het inloggen normaliseert vooraf.
  email text not null unique,
  wachtwoord_hash text not null,
  naam text not null,
  telefoon text not null default '',
  -- Een particulier doet aanvragen, een bedrijf ontvangt ze.
  soort text not null check (soort in ('particulier', 'bedrijf')),
  aangemaakt_op timestamptz not null default now()
);

create table if not exists sessies (
  -- Willekeurig token uit crypto.randomBytes; staat ook in het cookie.
  id text primary key,
  gebruiker_id uuid not null references gebruikers (id) on delete cascade,
  verloopt_op timestamptz not null,
  aangemaakt_op timestamptz not null default now()
);

create index if not exists sessies_gebruiker_idx on sessies (gebruiker_id);

create table if not exists bedrijven (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid not null unique references gebruikers (id) on delete cascade,
  naam text not null,
  slug text not null unique,
  plaats text not null default '',
  adres text not null default '',
  telefoon text not null default '',
  belofte text not null default '',
  tekst text not null default '',
  jaren integer not null default 0,
  foto text not null default '',
  -- Zolang dit uit staat komt het profiel niet in de openbare lijsten.
  actief boolean not null default false,
  aangemaakt_op timestamptz not null default now()
);

-- Welke diensten dit bedrijf doet; slugs uit src/lib/dienst-data.ts.
create table if not exists bedrijf_diensten (
  bedrijf_id uuid not null references bedrijven (id) on delete cascade,
  dienst text not null,
  primary key (bedrijf_id, dienst)
);

-- Werkgebied: de plaatsen waarvoor dit bedrijf aanvragen wil ontvangen.
create table if not exists bedrijf_plaatsen (
  bedrijf_id uuid not null references bedrijven (id) on delete cascade,
  plaats text not null,
  primary key (bedrijf_id, plaats)
);

-- Dagen waarop het bedrijf al vol zit; vervangt het verzonnen patroon in agenda.ts.
create table if not exists bedrijf_bezet (
  bedrijf_id uuid not null references bedrijven (id) on delete cascade,
  datum date not null,
  primary key (bedrijf_id, datum)
);

create table if not exists aanvragen (
  id uuid primary key default gen_random_uuid(),
  referentie text not null unique,
  -- Leeg als iemand aanvraagt zonder account; koppelt zich zodra hij er een maakt.
  gebruiker_id uuid references gebruikers (id) on delete set null,
  dienst text not null,
  type text not null default '',
  plaats text not null,
  adres text not null default '',
  wensen text not null default '',
  dagen text[] not null default '{}',
  naam text not null,
  email text not null,
  telefoon text not null,
  whatsapp boolean not null default false,
  aangemaakt_op timestamptz not null default now()
);

create index if not exists aanvragen_email_idx on aanvragen (lower(email));
create index if not exists aanvragen_gebruiker_idx on aanvragen (gebruiker_id);

-- Welke bedrijven de aanvraag hebben gekregen, en wat zij ermee deden.
create table if not exists aanvraag_bedrijven (
  aanvraag_id uuid not null references aanvragen (id) on delete cascade,
  bedrijf_id uuid not null references bedrijven (id) on delete cascade,
  status text not null default 'nieuw'
    check (status in ('nieuw', 'in_behandeling', 'gereageerd', 'gewonnen', 'verloren')),
  gewijzigd_op timestamptz not null default now(),
  primary key (aanvraag_id, bedrijf_id)
);

create index if not exists aanvraag_bedrijven_bedrijf_idx on aanvraag_bedrijven (bedrijf_id);

create table if not exists reacties (
  id uuid primary key default gen_random_uuid(),
  aanvraag_id uuid not null references aanvragen (id) on delete cascade,
  bedrijf_id uuid not null references bedrijven (id) on delete cascade,
  bericht text not null,
  prijs text not null default '',
  aangemaakt_op timestamptz not null default now()
);

create index if not exists reacties_aanvraag_idx on reacties (aanvraag_id);
