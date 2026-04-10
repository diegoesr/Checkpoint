alter table public.game_activity
  add column if not exists started_on date;

alter table public.game_activity
  add column if not exists playtime_hours numeric(10, 2);

alter table public.game_activity
  add column if not exists platform text;

alter table public.game_activity
  drop constraint if exists game_activity_playtime_hours_range;

alter table public.game_activity
  add constraint game_activity_playtime_hours_range check (
    playtime_hours is null
    or (playtime_hours >= 0 and playtime_hours <= 999999.99)
  );

alter table public.game_activity
  drop constraint if exists game_activity_platform_valid;

alter table public.game_activity
  add constraint game_activity_platform_valid check (
    platform is null
    or platform in (
      'pc',
      'ps5',
      'ps4',
      'xbox_series',
      'xbox_one',
      'switch',
      'nintendo_other',
      'mobile',
      'other'
    )
  );
