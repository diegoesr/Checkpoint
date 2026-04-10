-- Listas de usuario (conteo en perfil). 

create table if not exists public.user_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_lists_user_id on public.user_lists (user_id);

alter table public.user_lists enable row level security;

create policy "user_lists_select"
  on public.user_lists for select to authenticated using (true);
create policy "user_lists_mutate_own"
  on public.user_lists for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
