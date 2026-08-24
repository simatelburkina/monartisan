-- =====================================================================
-- MON ARTISAN — Row Level Security
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.current_role_is(r user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = r);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role_is('admin');
$$;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.artisans enable row level security;
alter table public.artisan_categories enable row level security;
alter table public.artisan_zones enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.artisan_availability enable row level security;
alter table public.documents enable row level security;
alter table public.favorites enable row level security;
alter table public.categories enable row level security;
alter table public.requests enable row level security;
alter table public.request_items enable row level security;
alter table public.request_media enable row level security;
alter table public.request_responses enable row level security;
alter table public.quotes enable row level security;
alter table public.bookings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.complaints enable row level security;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
create policy "profiles_select_public" on public.profiles for select using (true);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id or public.is_admin());
create policy "profiles_admin_all" on public.profiles for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- CLIENTS
-- ---------------------------------------------------------------------
create policy "clients_select_self_or_admin" on public.clients for select using (auth.uid() = id or public.is_admin());
create policy "clients_insert_self" on public.clients for insert with check (auth.uid() = id);
create policy "clients_update_self" on public.clients for update using (auth.uid() = id or public.is_admin());

-- ---------------------------------------------------------------------
-- ARTISANS (profil public, lisible par tous)
-- ---------------------------------------------------------------------
create policy "artisans_select_public" on public.artisans for select using (true);
create policy "artisans_insert_self" on public.artisans for insert with check (auth.uid() = id);
create policy "artisans_update_self_or_admin" on public.artisans for update using (auth.uid() = id or public.is_admin());

create policy "artisan_categories_select_public" on public.artisan_categories for select using (true);
create policy "artisan_categories_write_self" on public.artisan_categories for all
  using (auth.uid() = artisan_id or public.is_admin())
  with check (auth.uid() = artisan_id or public.is_admin());

create policy "artisan_zones_select_public" on public.artisan_zones for select using (true);
create policy "artisan_zones_write_self" on public.artisan_zones for all
  using (auth.uid() = artisan_id or public.is_admin())
  with check (auth.uid() = artisan_id or public.is_admin());

create policy "portfolio_select_public" on public.portfolio_items for select using (true);
create policy "portfolio_write_self" on public.portfolio_items for all
  using (auth.uid() = artisan_id or public.is_admin())
  with check (auth.uid() = artisan_id or public.is_admin());

create policy "availability_select_public" on public.artisan_availability for select using (true);
create policy "availability_write_self" on public.artisan_availability for all
  using (auth.uid() = artisan_id or public.is_admin())
  with check (auth.uid() = artisan_id or public.is_admin());

-- ---------------------------------------------------------------------
-- DOCUMENTS (privés : artisan concerné + admin)
-- ---------------------------------------------------------------------
create policy "documents_select_self_or_admin" on public.documents for select
  using (auth.uid() = artisan_id or public.is_admin());
create policy "documents_insert_self" on public.documents for insert
  with check (auth.uid() = artisan_id);
create policy "documents_update_admin" on public.documents for update using (public.is_admin());

-- ---------------------------------------------------------------------
-- FAVORITES
-- ---------------------------------------------------------------------
create policy "favorites_select_self" on public.favorites for select using (auth.uid() = client_id);
create policy "favorites_write_self" on public.favorites for all
  using (auth.uid() = client_id) with check (auth.uid() = client_id);

-- ---------------------------------------------------------------------
-- CATEGORIES (lecture publique, écriture admin)
-- ---------------------------------------------------------------------
create policy "categories_select_public" on public.categories for select using (true);
create policy "categories_write_admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- REQUESTS
-- ---------------------------------------------------------------------
create policy "requests_select" on public.requests for select
  using (
    auth.uid() = client_id
    or public.is_admin()
    or exists (
      select 1 from public.request_items ri
      where ri.request_id = requests.id
        and (ri.assigned_artisan_id = auth.uid()
             or exists (select 1 from public.artisan_categories ac where ac.artisan_id = auth.uid() and ac.category_id = ri.category_id))
    )
  );
create policy "requests_insert_self" on public.requests for insert with check (auth.uid() = client_id);
create policy "requests_update_self_or_admin" on public.requests for update using (auth.uid() = client_id or public.is_admin());

-- ---------------------------------------------------------------------
-- REQUEST ITEMS (visibles par le client propriétaire, l'artisan assigné,
-- et tout artisan dont le métier correspond à la catégorie demandée)
-- ---------------------------------------------------------------------
create policy "request_items_select" on public.request_items for select
  using (
    public.is_admin()
    or exists (select 1 from public.requests r where r.id = request_items.request_id and r.client_id = auth.uid())
    or assigned_artisan_id = auth.uid()
    or exists (select 1 from public.artisan_categories ac where ac.artisan_id = auth.uid() and ac.category_id = request_items.category_id)
  );
create policy "request_items_insert_owner" on public.request_items for insert
  with check (exists (select 1 from public.requests r where r.id = request_id and r.client_id = auth.uid()));
create policy "request_items_update" on public.request_items for update
  using (
    public.is_admin()
    or exists (select 1 from public.requests r where r.id = request_items.request_id and r.client_id = auth.uid())
    or assigned_artisan_id = auth.uid()
  );

create policy "request_media_select" on public.request_media for select
  using (
    public.is_admin()
    or exists (select 1 from public.requests r where r.id = request_media.request_id and r.client_id = auth.uid())
    or exists (
      select 1 from public.request_items ri
      join public.artisan_categories ac on ac.category_id = ri.category_id
      where ri.request_id = request_media.request_id and ac.artisan_id = auth.uid()
    )
  );
create policy "request_media_insert_owner" on public.request_media for insert
  with check (exists (select 1 from public.requests r where r.id = request_id and r.client_id = auth.uid()));

create policy "request_responses_select" on public.request_responses for select
  using (
    auth.uid() = artisan_id
    or public.is_admin()
    or exists (
      select 1 from public.request_items ri join public.requests r on r.id = ri.request_id
      where ri.id = request_responses.request_item_id and r.client_id = auth.uid()
    )
  );
create policy "request_responses_write_self" on public.request_responses for insert with check (auth.uid() = artisan_id);
create policy "request_responses_update_self" on public.request_responses for update using (auth.uid() = artisan_id);

-- ---------------------------------------------------------------------
-- QUOTES
-- ---------------------------------------------------------------------
create policy "quotes_select" on public.quotes for select
  using (
    auth.uid() = artisan_id
    or public.is_admin()
    or exists (
      select 1 from public.request_items ri join public.requests r on r.id = ri.request_id
      where ri.id = quotes.request_item_id and r.client_id = auth.uid()
    )
  );
create policy "quotes_insert_self" on public.quotes for insert with check (auth.uid() = artisan_id);
create policy "quotes_update" on public.quotes for update
  using (
    auth.uid() = artisan_id
    or public.is_admin()
    or exists (
      select 1 from public.request_items ri join public.requests r on r.id = ri.request_id
      where ri.id = quotes.request_item_id and r.client_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------
create policy "bookings_select" on public.bookings for select
  using (auth.uid() = client_id or auth.uid() = artisan_id or public.is_admin());
create policy "bookings_insert" on public.bookings for insert
  with check (auth.uid() = client_id or public.is_admin());
create policy "bookings_update" on public.bookings for update
  using (auth.uid() = client_id or auth.uid() = artisan_id or public.is_admin());

-- ---------------------------------------------------------------------
-- CONVERSATIONS & MESSAGES
-- ---------------------------------------------------------------------
create policy "conversations_select" on public.conversations for select
  using (auth.uid() = client_id or auth.uid() = artisan_id or public.is_admin());
create policy "conversations_insert" on public.conversations for insert
  with check (auth.uid() = client_id or auth.uid() = artisan_id);
create policy "conversations_update" on public.conversations for update
  using (auth.uid() = client_id or auth.uid() = artisan_id or public.is_admin());

create policy "messages_select" on public.messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and (c.client_id = auth.uid() or c.artisan_id = auth.uid())
    )
  );
create policy "messages_insert" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.client_id = auth.uid() or c.artisan_id = auth.uid())
    )
  );
create policy "messages_update_read" on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and (c.client_id = auth.uid() or c.artisan_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
create policy "notifications_select_self" on public.notifications for select using (auth.uid() = user_id or public.is_admin());
create policy "notifications_update_self" on public.notifications for update using (auth.uid() = user_id or public.is_admin());
create policy "notifications_insert_admin" on public.notifications for insert with check (public.is_admin());

-- ---------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------
create policy "payments_select" on public.payments for select
  using (auth.uid() = payer_id or auth.uid() = payee_id or public.is_admin());
create policy "payments_write_admin" on public.payments for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------
create policy "reviews_select_public" on public.reviews for select using (is_hidden = false or auth.uid() = client_id or public.is_admin());
create policy "reviews_insert_owner" on public.reviews for insert
  with check (
    auth.uid() = client_id
    and exists (select 1 from public.bookings b where b.id = booking_id and b.client_id = auth.uid() and b.status in ('completed','paid','closed'))
  );
create policy "reviews_update" on public.reviews for update using (auth.uid() = client_id or public.is_admin());

-- ---------------------------------------------------------------------
-- COMPLAINTS
-- ---------------------------------------------------------------------
create policy "complaints_select" on public.complaints for select using (auth.uid() = reporter_id or auth.uid() = against_id or public.is_admin());
create policy "complaints_insert_self" on public.complaints for insert with check (auth.uid() = reporter_id);
create policy "complaints_update_admin" on public.complaints for update using (public.is_admin());
