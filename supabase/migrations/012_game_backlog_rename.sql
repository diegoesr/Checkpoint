
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'game_wishlist'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'game_backlog'
  ) then
    alter table public.game_wishlist rename to game_backlog;
  end if;
end $$;

alter index if exists game_wishlist_user_created rename to game_backlog_user_created;
