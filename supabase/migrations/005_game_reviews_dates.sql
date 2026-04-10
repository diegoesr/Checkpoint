
alter table public.game_reviews
  add column if not exists started_on date,
  add column if not exists finished_on date,
  add column if not exists is_replay boolean not null default false,
  add column if not exists liked boolean not null default false;

alter table public.game_reviews
  alter column body drop not null;

update public.game_reviews set body = '' where body is null;

alter table public.game_reviews
  alter column body set default '';
