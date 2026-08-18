-- Aanmeldwizard voor bedrijven: KvK-nummer, website en postcode horen bij het
-- profiel. KvK en website tonen we niet openbaar; ze zijn er voor de controle
-- die we in de aanmeldtekst beloven.
alter table bedrijven add column if not exists kvk text not null default '';
alter table bedrijven add column if not exists website text not null default '';
alter table bedrijven add column if not exists postcode text not null default '';
