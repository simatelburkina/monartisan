-- =====================================================================
-- MON ARTISAN — Schéma de base de données complet (Supabase / PostgreSQL)
-- =====================================================================
-- Convention : toutes les tables métier référencent auth.users via user_id
-- quand elles représentent un compte. RLS activé partout.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "cube";
create extension if not exists "earthdistance"; -- géolocalisation (lat/lng + distance ll_to_earth)

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type user_role as enum ('client', 'artisan', 'admin');
create type account_status as enum ('active', 'pending', 'suspended', 'banned');
create type request_status as enum ('published', 'proposals_received', 'quote_accepted', 'scheduled', 'in_progress', 'completed', 'closed', 'cancelled');
create type request_item_status as enum ('open', 'assigned', 'done', 'cancelled');
create type quote_status as enum ('sent', 'accepted', 'rejected', 'modification_requested', 'expired');
create type booking_status as enum ('scheduled', 'artisan_en_route', 'in_progress', 'completed', 'paid', 'closed', 'disputed');
create type urgency_level as enum ('low', 'normal', 'high', 'urgent');
create type notification_channel as enum ('app', 'sms', 'email', 'whatsapp');
create type notification_type as enum (
  'new_request', 'new_quote', 'quote_accepted', 'quote_rejected', 'new_message',
  'appointment_reminder', 'booking_scheduled', 'booking_completed', 'payment_done',
  'new_review', 'account_verified', 'account_suspended', 'complaint_update'
);
create type payment_status as enum ('pending', 'held', 'released', 'refunded', 'failed');
create type payment_method as enum ('cash', 'mobile_money', 'card', 'platform_wallet');
create type complaint_status as enum ('open', 'investigating', 'resolved', 'rejected');
create type complaint_reason as enum ('not_done', 'not_compliant', 'payment_dispute', 'bad_behavior', 'fraud', 'fake_profile', 'other');
create type document_status as enum ('pending', 'approved', 'rejected');
create type subscription_plan as enum ('free', 'pro', 'premium');

-- ---------------------------------------------------------------------
-- PROFILES (1-1 avec auth.users) — table racine commune
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  status account_status not null default 'active',
  first_name text,
  last_name text,
  display_name text,
  company_name text,
  avatar_url text,
  phone text unique,
  email text,
  address text,
  city text,
  lat double precision,
  lng double precision,
  locale text not null default 'fr',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Compte utilisateur commun (client, artisan ou admin), 1-1 avec auth.users';

-- ---------------------------------------------------------------------
-- CLIENTS (infos spécifiques client)
-- ---------------------------------------------------------------------
create table public.clients (
  id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ARTISANS
-- ---------------------------------------------------------------------
create table public.artisans (
  id uuid primary key references public.profiles(id) on delete cascade,
  headline text,
  description text,
  years_experience int default 0,
  service_radius_km int default 15,
  is_verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id),
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  is_available boolean not null default true,
  subscription_plan subscription_plan not null default 'free',
  subscription_expires_at timestamptz,
  total_earnings numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Métiers/spécialités déclarés par un artisan (plusieurs catégories possibles)
create table public.artisan_categories (
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  hourly_rate numeric(10,2),
  primary key (artisan_id, category_id)
);

-- Zones d'intervention (villes/quartiers)
create table public.artisan_zones (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  city text not null,
  district text,
  created_at timestamptz not null default now()
);

-- Photos de réalisations (portfolio)
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- Disponibilités hebdomadaires (calendrier simple)
create table public.artisan_availability (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6), -- 0=dimanche
  start_time time not null,
  end_time time not null
);

-- ---------------------------------------------------------------------
-- DOCUMENTS (pièces justificatives pour vérification artisan)
-- ---------------------------------------------------------------------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  doc_type text not null, -- cni, registre_commerce, diplome, autre
  file_url text not null,
  status document_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- FAVORIS
-- ---------------------------------------------------------------------
create table public.favorites (
  client_id uuid not null references public.clients(id) on delete cascade,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, artisan_id)
);

-- ---------------------------------------------------------------------
-- REQUESTS (demandes de prestation, potentiellement multi-métiers)
-- ---------------------------------------------------------------------
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text not null,
  address text,
  city text,
  lat double precision,
  lng double precision,
  desired_date date,
  desired_time time,
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  estimated_duration text,
  urgency urgency_level not null default 'normal',
  status request_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Une demande peut regrouper plusieurs prestations (ex: rénovation = peinture + plomberie)
create table public.request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  description text,
  status request_item_status not null default 'open',
  assigned_artisan_id uuid references public.artisans(id),
  created_at timestamptz not null default now()
);

-- Médias joints à une demande (photos / vidéos)
create table public.request_media (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  request_item_id uuid references public.request_items(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'photo', -- photo | video
  created_at timestamptz not null default now()
);

-- Réponses préliminaires d'un artisan à une demande (accepte/refuse/infos complémentaires)
create table public.request_responses (
  id uuid primary key default gen_random_uuid(),
  request_item_id uuid not null references public.request_items(id) on delete cascade,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  decision text not null check (decision in ('interested', 'declined', 'info_requested')),
  message text,
  created_at timestamptz not null default now(),
  unique (request_item_id, artisan_id)
);

-- ---------------------------------------------------------------------
-- QUOTES (devis)
-- ---------------------------------------------------------------------
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_item_id uuid not null references public.request_items(id) on delete cascade,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  description text not null,
  labor_cost numeric(10,2) not null default 0,
  materials_cost numeric(10,2) not null default 0,
  extra_fees numeric(10,2) not null default 0,
  total_amount numeric(10,2) generated always as (labor_cost + materials_cost + extra_fees) stored,
  delay_days int,
  proposed_date date,
  conditions text,
  status quote_status not null default 'sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- BOOKINGS (prestations confirmées, suivi du cycle de vie)
-- ---------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  request_item_id uuid not null references public.request_items(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  status booking_status not null default 'scheduled',
  scheduled_date date,
  scheduled_time time,
  amount numeric(10,2) not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CONVERSATIONS & MESSAGES
-- ---------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  request_id uuid references public.requests(id) on delete set null,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (client_id, artisan_id, request_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  attachment_url text,
  attachment_type text, -- photo | document
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  channel notification_channel not null default 'app',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payer_id uuid not null references public.profiles(id),
  payee_id uuid not null references public.profiles(id),
  amount numeric(10,2) not null,
  method payment_method not null default 'cash',
  status payment_status not null default 'pending',
  platform_fee numeric(10,2) not null default 0,
  paid_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- REVIEWS (notation et avis)
-- ---------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  is_hidden boolean not null default false,
  hidden_reason text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- COMPLAINTS (réclamations / litiges)
-- ---------------------------------------------------------------------
create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  against_id uuid references public.profiles(id),
  booking_id uuid references public.bookings(id) on delete set null,
  reason complaint_reason not null,
  description text not null,
  status complaint_status not null default 'open',
  resolution_note text,
  handled_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- ---------------------------------------------------------------------

-- updated_at auto
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_artisans_updated before update on public.artisans for each row execute function public.set_updated_at();
create trigger trg_requests_updated before update on public.requests for each row execute function public.set_updated_at();
create trigger trg_quotes_updated before update on public.quotes for each row execute function public.set_updated_at();
create trigger trg_bookings_updated before update on public.bookings for each row execute function public.set_updated_at();

-- Création automatique du profil à l'inscription (metadata: role, first_name, last_name, phone)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'client');
begin
  insert into public.profiles (id, role, first_name, last_name, phone, email, display_name)
  values (
    new.id,
    v_role,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.email,
    trim(coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(new.raw_user_meta_data->>'last_name', ''))
  );

  if v_role = 'client' then
    insert into public.clients (id) values (new.id);
  elsif v_role = 'artisan' then
    insert into public.artisans (id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mise à jour de la note moyenne de l'artisan après un avis
create or replace function public.refresh_artisan_rating()
returns trigger language plpgsql as $$
begin
  update public.artisans a
  set rating_count = sub.cnt,
      rating_avg = sub.avg_rating
  from (
    select artisan_id, count(*) cnt, round(avg(rating)::numeric, 2) avg_rating
    from public.reviews
    where artisan_id = coalesce(new.artisan_id, old.artisan_id) and is_hidden = false
    group by artisan_id
  ) sub
  where a.id = sub.artisan_id;
  return coalesce(new, old);
end;
$$;

create trigger trg_reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_artisan_rating();

-- Met à jour last_message_at sur la conversation à chaque nouveau message
create or replace function public.touch_conversation()
returns trigger language plpgsql as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger trg_messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ---------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------
create index idx_artisans_verified on public.artisans (is_verified);
create index idx_artisan_categories_category on public.artisan_categories (category_id);
create index idx_artisan_zones_city on public.artisan_zones (city);
create index idx_requests_client on public.requests (client_id);
create index idx_requests_status on public.requests (status);
create index idx_request_items_request on public.request_items (request_id);
create index idx_request_items_category on public.request_items (category_id);
create index idx_quotes_request_item on public.quotes (request_item_id);
create index idx_quotes_artisan on public.quotes (artisan_id);
create index idx_bookings_client on public.bookings (client_id);
create index idx_bookings_artisan on public.bookings (artisan_id);
create index idx_messages_conversation on public.messages (conversation_id, created_at);
create index idx_notifications_user on public.notifications (user_id, read_at);
create index idx_reviews_artisan on public.reviews (artisan_id);
create index idx_profiles_role on public.profiles (role);

-- Recherche géographique (nearest artisans)
create index idx_profiles_geo on public.profiles using gist (
  ll_to_earth(lat, lng)
) where lat is not null and lng is not null;
