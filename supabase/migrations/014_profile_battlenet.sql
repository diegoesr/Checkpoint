-- Battle.net (BattleTag) para perfil / amigos.
alter table public.profiles
  add column if not exists battlenet_btag text;

comment on column public.profiles.battlenet_btag is 'Battle.net BattleTag (ej. Jugador#1234)';
