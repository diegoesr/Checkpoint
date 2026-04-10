drop policy if exists "game_activity_update_own" on public.game_activity;

create policy "game_activity_update_own"
  on public.game_activity for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
