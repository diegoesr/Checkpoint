-- Tras aplicar 012, la tabla pasa a llamarse public.game_backlog (mismo esquema).
create table if not exists public.game_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rawg_id int not null,
  game_name text not null,
  background_image text,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, rawg_id)
);

create index if not exists game_wishlist_user_created
  on public.game_wishlist (user_id, created_at desc);

alter table public.game_wishlist enable row level security;

create policy "game_wishlist_select_own"
  on public.game_wishlist for select to authenticated
  using (auth.uid() = user_id);

create policy "game_wishlist_insert_own"
  on public.game_wishlist for insert to authenticated
  with check (auth.uid() = user_id);

create policy "game_wishlist_delete_own"
  on public.game_wishlist for delete to authenticated
  using (auth.uid() = user_id);

create policy "game_wishlist_update_own"
  on public.game_wishlist for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
