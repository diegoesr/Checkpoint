alter table public.game_reviews
  add column if not exists platform text;

alter table public.game_reviews
  drop constraint if exists game_reviews_platform_valid;

alter table public.game_reviews
  add constraint game_reviews_platform_valid check (
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
