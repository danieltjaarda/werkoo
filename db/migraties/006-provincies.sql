-- Werkgebied per provincie, naast (of in plaats van) losse plaatsen. Een
-- vakman vinkt op een kaart aan waar hij werkt; een aanvraag uit een plaats
-- in die provincie komt dan bij hem terecht.
create table if not exists bedrijf_provincies (
  bedrijf_id uuid not null references bedrijven (id) on delete cascade,
  provincie text not null,
  primary key (bedrijf_id, provincie)
);

-- De provincie van de plaats in een aanvraag, opgezocht bij het opslaan; leeg
-- als we hem niet konden bepalen.
alter table aanvragen add column if not exists provincie text not null default '';
