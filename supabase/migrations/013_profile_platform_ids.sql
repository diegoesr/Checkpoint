-- IDs en consolas / launchers para que amigos puedan agregarte.
alter table public.profiles
  add column if not exists psn_id text,
  add column if not exists xbox_gamertag text,
  add column if not exists steam_display text,
  add column if not exists nintendo_friend_code text,
  add column if not exists epic_display_name text;

comment on column public.profiles.psn_id is 'PlayStation Network (ID en línea)';
comment on column public.profiles.xbox_gamertag is 'Xbox Gamertag';
comment on column public.profiles.steam_display is 'Steam: nombre de perfil o código de amigo';
comment on column public.profiles.nintendo_friend_code is 'Nintendo Switch: código de amigo u otro identificador';
comment on column public.profiles.epic_display_name is 'Epic Games (nombre para agregar)';
