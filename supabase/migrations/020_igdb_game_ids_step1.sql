-- Migración RAWG → IGDB · PASO 1 de 2 (no destructivo).
--
-- Añade la columna igdb_id en todas las tablas que guardan juegos y deja rawg_id
-- como opcional, para que el código nuevo (que solo escribe igdb_id) funcione.
--
-- Orden de despliegue:
--   1. Aplicar este archivo.
--   2. Ejecutar `node --env-file=.env.local scripts/relink-igdb.mjs` (rellena igdb_id
--      buscando cada game_name en IGDB y actualiza la carátula).
--   3. Revisar el informe del script y aplicar 021_igdb_game_ids_step2.sql.

do $$
declare
  t text;
begin
  foreach t in array array[
    'favorite_games',
    'game_activity',
    'game_reviews',
    'game_backlog',
    'user_list_entries'
  ]
  loop
    execute format('alter table public.%I add column if not exists igdb_id int', t);
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'rawg_id'
    ) then
      execute format('alter table public.%I alter column rawg_id drop not null', t);
    end if;
  end loop;
end $$;

-- Índices para las búsquedas por juego (equivalentes a los únicos de rawg_id).
create index if not exists game_backlog_user_igdb on public.game_backlog (user_id, igdb_id);
create index if not exists user_list_entries_list_igdb on public.user_list_entries (list_id, igdb_id);
