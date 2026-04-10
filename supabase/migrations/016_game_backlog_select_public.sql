-- Lectura del backlog de cualquier usuario autenticado (perfil público), alineado con
-- favorite_games / game_reviews / game_activity (select using true).
drop policy if exists "game_wishlist_select_own" on public.game_backlog;

create policy "game_backlog_select_authenticated"
  on public.game_backlog for select to authenticated
  using (true);
