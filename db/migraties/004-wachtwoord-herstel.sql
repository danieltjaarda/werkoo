-- Wachtwoord vergeten: een link met een eenmalig token dat een uur geldig is.
-- We bewaren alleen de sha256 van het token; wie de tabel leest kan er niets mee.
create table if not exists wachtwoord_herstel (
  token_hash text primary key,
  gebruiker_id uuid not null references gebruikers (id) on delete cascade,
  verloopt_op timestamptz not null,
  gebruikt_op timestamptz,
  aangemaakt_op timestamptz not null default now()
);

create index if not exists wachtwoord_herstel_gebruiker_idx on wachtwoord_herstel (gebruiker_id);
