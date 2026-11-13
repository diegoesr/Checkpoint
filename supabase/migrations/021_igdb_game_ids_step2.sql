-- Migración RAWG → IGDB · PASO 2 de 2 (DESTRUCTIVO).
--
-- Aplicar SOLO después de ejecutar scripts/relink-igdb.mjs y revisar su informe.
-- Las filas que el script no pudo vincular (igdb_id nulo) se BORRAN aquí.
-- Si quieres conservarlas, corrige su igdb_id a mano antes de aplicar este archivo.

-- 1) Filas sin vincular.
delete from public.favorite_games    where igdb_id is null;
delete from public.game_activity     where igdb_id is null;
delete from public.game_reviews      where igdb_id is null;
delete from public.game_backlog      where igdb_id is null;
delete from public.user_list_entries where igdb_id is null;

-- 2) Duplicados: dos ids de RAWG pueden apuntar al mismo juego de IGDB
--    (p. ej. ediciones). Se conserva la entrada más antigua.
delete from public.game_backlog a
  using public.game_backlog b
  where a.user_id = b.user_id
    and a.igdb_id = b.igdb_id
    and (a.created_at, a.id) > (b.created_at, b.id);

delete from public.user_list_entries a
  using public.user_list_entries b
  where a.list_id = b.list_id
    and a.igdb_id = b.igdb_id
    and (a.position, a.id) > (b.position, b.id);

-- 3) igdb_id obligatorio y fuera rawg_id (sus restricciones únicas caen con la columna).
alter table public.favorite_games    alter column igdb_id set not null, drop column if exists rawg_id;
alter table public.game_activity     alter column igdb_id set not null, drop column if exists rawg_id;
alter table public.game_reviews      alter column igdb_id set not null, drop column if exists rawg_id;
alter table public.game_backlog      alter column igdb_id set not null, drop column if exists rawg_id;
alter table public.user_list_entries alter column igdb_id set not null, drop column if exists rawg_id;

-- 4) Unicidad equivalente a la que había con rawg_id.
drop index if exists public.game_backlog_user_igdb;
drop index if exists public.user_list_entries_list_igdb;

alter table public.game_backlog
  add constraint game_backlog_user_igdb_unique unique (user_id, igdb_id);
alter table public.user_list_entries
  add constraint user_list_entries_list_igdb_unique unique (list_id, igdb_id);
