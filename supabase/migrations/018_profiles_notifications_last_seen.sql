
alter table public.profiles
  add column if not exists notifications_last_seen_at timestamptz;

comment on column public.profiles.notifications_last_seen_at is
  'Al cerrar el panel de notificaciones se actualiza; solo se muestran eventos posteriores.';
