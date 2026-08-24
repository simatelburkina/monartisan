-- =====================================================================
-- MON ARTISAN — Données initiales
-- =====================================================================

insert into public.categories (name, slug, icon, sort_order) values
  ('Plomberie', 'plomberie', '🔧', 1),
  ('Électricité', 'electricite', '💡', 2),
  ('Maçonnerie', 'maconnerie', '🧱', 3),
  ('Peinture', 'peinture', '🎨', 4),
  ('Menuiserie', 'menuiserie', '🪚', 5),
  ('Soudure', 'soudure', '🔩', 6),
  ('Climatisation', 'climatisation', '❄️', 7),
  ('Réparation électroménager', 'reparation-electromenager', '🧺', 8),
  ('Mécanique', 'mecanique', '🚗', 9),
  ('Couture', 'couture', '🧵', 10),
  ('Coiffure', 'coiffure', '💇', 11),
  ('Nettoyage', 'nettoyage', '🧹', 12),
  ('Jardinage', 'jardinage', '🌱', 13),
  ('Informatique', 'informatique', '💻', 14),
  ('Installation et maintenance', 'installation-maintenance', '🛠️', 15),
  ('Transport', 'transport', '🚚', 16),
  ('Autres services', 'autres-services', '✨', 17)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- STORAGE BUCKETS
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('portfolios', 'portfolios', true),
  ('request-media', 'request-media', true),
  ('documents', 'documents', false),
  ('messages', 'messages', false)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_owner_update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_owner_delete" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "portfolios_public_read" on storage.objects for select using (bucket_id = 'portfolios');
create policy "portfolios_owner_write" on storage.objects for insert with check (bucket_id = 'portfolios' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "portfolios_owner_delete" on storage.objects for delete using (bucket_id = 'portfolios' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "request_media_public_read" on storage.objects for select using (bucket_id = 'request-media');
create policy "request_media_auth_write" on storage.objects for insert with check (bucket_id = 'request-media' and auth.role() = 'authenticated');

create policy "documents_owner_read" on storage.objects for select using (bucket_id = 'documents' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()));
create policy "documents_owner_write" on storage.objects for insert with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "messages_participants_read" on storage.objects for select using (bucket_id = 'messages' and auth.role() = 'authenticated');
create policy "messages_participants_write" on storage.objects for insert with check (bucket_id = 'messages' and auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- REALTIME (messagerie et notifications instantanées)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
