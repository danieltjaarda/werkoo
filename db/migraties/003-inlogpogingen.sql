-- Mislukte inlogpogingen, zodat we kunnen afremmen. Eén rij per e-mailadres; de
-- teller loopt op bij elke misser en gaat op nul zodra het wachtwoord klopt.
create table if not exists inlogpogingen (
  email text primary key,
  aantal integer not null default 0,
  laatste_op timestamptz not null default now()
);
