-- Een bedrijfsprofiel kan bestaan voordat er een account aan hangt: wij zetten de
-- eerste profielen zelf klaar en de vakman claimt ze later. Daarom mag
-- gebruiker_id leeg zijn. Uniek blijft het wel, want één account hoort bij één
-- profiel — maar in Postgres zijn meerdere lege waarden in een unieke kolom
-- toegestaan, dus dat werkt vanzelf goed.
alter table bedrijven alter column gebruiker_id drop not null;

-- Score en aantal beoordelingen horen bij het profiel; die tonen we in de lijst.
alter table bedrijven add column if not exists score numeric(3, 1) not null default 0;
alter table bedrijven add column if not exists reviews integer not null default 0;
alter table bedrijven add column if not exists fotos integer not null default 0;
alter table bedrijven add column if not exists top_pro boolean not null default false;
-- Betaalde uitgelichte plek; de kaart toont daar zichtbaar een label bij.
alter table bedrijven add column if not exists uitgelicht boolean not null default false;

-- De troeven op een kaart ("Gratis kennismaking", "Reageert binnen 1 uur").
create table if not exists bedrijf_troeven (
  bedrijf_id uuid not null references bedrijven (id) on delete cascade,
  label text not null,
  soort text not null check (soort in ('aanbod', 'snelheid', 'keurmerk')),
  volgorde integer not null default 0,
  primary key (bedrijf_id, label)
);
