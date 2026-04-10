-- Likes de otros usuarios a una reseña 

create table if not exists public.review_likes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.game_reviews (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);

create index if not exists review_likes_review_id_idx
  on public.review_likes (review_id);

create index if not exists review_likes_user_id_idx
  on public.review_likes (user_id);

create index if not exists review_likes_created_desc_idx
  on public.review_likes (created_at desc);

alter table public.review_likes enable row level security;

create policy "review_likes_select"
  on public.review_likes for select to authenticated
  using (true);

create policy "review_likes_insert"
  on public.review_likes for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.game_reviews gr
      where gr.id = review_id
        and gr.user_id is distinct from auth.uid()
    )
  );

create policy "review_likes_delete_own"
  on public.review_likes for delete to authenticated
  using (auth.uid() = user_id);
