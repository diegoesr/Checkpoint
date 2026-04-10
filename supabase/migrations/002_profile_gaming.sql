alter table public.profiles
  add column if not exists username text,
  add column if not exists bio text;

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username))
  where username is not null and btrim(username) <> '';

create table if not exists public.profile_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  url text not null,
  sort_order int not null default 0
);

create table if not exists public.favorite_games (
  user_id uuid not null references auth.users (id) on delete cascade,
  slot int not null check (slot >= 1 and slot <= 4),
  rawg_id int not null,
  game_name text not null,
  background_image text,
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);

create table if not exists public.game_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rawg_id int not null,
  game_name text not null,
  background_image text,
  played_at timestamptz not null default now(),
  note text
);

create table if not exists public.game_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rawg_id int not null,
  game_name text not null,
  background_image text,
  body text not null,
  rating smallint,
  created_at timestamptz not null default now(),
  constraint game_reviews_rating_range check (rating is null or (rating >= 1 and rating <= 5))
);

create index if not exists game_activity_user_played on public.game_activity (user_id, played_at desc);
create index if not exists game_reviews_user_created on public.game_reviews (user_id, created_at desc);
create index if not exists profile_links_user on public.profile_links (user_id, sort_order);

alter table public.profile_links enable row level security;
alter table public.favorite_games enable row level security;
alter table public.game_activity enable row level security;
alter table public.game_reviews enable row level security;

create policy "profile_links_select"
  on public.profile_links for select to authenticated using (true);
create policy "profile_links_mutate"
  on public.profile_links for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "favorite_games_select"
  on public.favorite_games for select to authenticated using (true);
create policy "favorite_games_mutate"
  on public.favorite_games for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "game_activity_select"
  on public.game_activity for select to authenticated using (true);
create policy "game_activity_mutate"
  on public.game_activity for insert to authenticated with check (auth.uid() = user_id);
create policy "game_activity_delete_own"
  on public.game_activity for delete to authenticated using (auth.uid() = user_id);

create policy "game_reviews_select"
  on public.game_reviews for select to authenticated using (true);
create policy "game_reviews_insert"
  on public.game_reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "game_reviews_update_own"
  on public.game_reviews for update to authenticated using (auth.uid() = user_id);
create policy "game_reviews_delete_own"
  on public.game_reviews for delete to authenticated using (auth.uid() = user_id);
