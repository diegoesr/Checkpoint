alter table public.game_reviews
  add column if not exists playtime_hours numeric(10, 2);

alter table public.game_reviews
  drop constraint if exists game_reviews_playtime_hours_range;

alter table public.game_reviews
  add constraint game_reviews_playtime_hours_range check (
    playtime_hours is null
    or (playtime_hours >= 0 and playtime_hours <= 999999.99)
  );
