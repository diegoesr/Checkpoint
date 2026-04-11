-- Permite al usuario quitarse a alguien de sus seguidores (Instagram-style).
-- Borra la fila donde el seguidor es otro y quien recibe el follow es auth.uid().

create policy "follows_delete_as_followed"
  on public.follows for delete
  to authenticated
  using (auth.uid() = following_id);
