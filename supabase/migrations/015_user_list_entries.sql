-- Listas enriquecidas (descripción, orden) + entradas de juegos (RAWG) por lista.

alter table public.user_lists
  add column if not exists description text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.user_list_entries (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.user_lists (id) on delete cascade,
  rawg_id int not null,
  game_name text not null,
  background_image text,
  position int not null,
  created_at timestamptz not null default now(),
  unique (list_id, rawg_id)
);

create index if not exists user_list_entries_list_position
  on public.user_list_entries (list_id, position);

alter table public.user_list_entries enable row level security;

create policy "user_list_entries_select"
  on public.user_list_entries for select
  to authenticated
  using (true);

create policy "user_list_entries_mutate_own_list"
  on public.user_list_entries for all
  to authenticated
  using (
    exists (
      select 1 from public.user_lists ul
      where ul.id = list_id and ul.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_lists ul
      where ul.id = list_id and ul.user_id = auth.uid()
    )
  );
