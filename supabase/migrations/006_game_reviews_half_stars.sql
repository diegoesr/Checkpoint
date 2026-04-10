
alter table public.game_reviews
  drop constraint if exists game_reviews_rating_range;

alter table public.game_reviews
  alter column rating type numeric(3, 1)
  using (case when rating is null then null else rating::numeric end);

alter table public.game_reviews
  add constraint game_reviews_rating_half_steps check (
    rating is null
    or (
      rating >= 0.5
      and rating <= 5
      and mod(rating * 2, 1::numeric) = 0
    )
  );
