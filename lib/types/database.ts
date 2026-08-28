// Types TypeScript reflétant le schéma SQL (supabase/migrations/0001_init.sql).
// À régénérer avec `npx supabase gen types typescript` une fois le projet Supabase lié.

export type UserRole = "client" | "artisan" | "admin";
export type AccountStatus = "active" | "pending" | "suspended" | "banned";
export type RequestStatus =
  | "published"
  | "proposals_received"
  | "quote_accepted"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled";
export type RequestItemStatus = "open" | "assigned" | "done" | "cancelled";
export type QuoteStatus = "sent" | "accepted" | "rejected" | "modification_requested" | "expired";
export type BookingStatus =
  | "scheduled"
  | "artisan_en_route"
  | "in_progress"
  | "completed"
  | "paid"
  | "closed"
  | "disputed";
export type UrgencyLevel = "low" | "normal" | "high" | "urgent";
export type NotificationType =
  | "new_request"
  | "new_quote"
  | "quote_accepted"
  | "quote_rejected"
  | "new_message"
  | "appointment_reminder"
  | "booking_scheduled"
  | "booking_completed"
  | "payment_done"
  | "new_review"
  | "account_verified"
  | "account_suspended"
  | "complaint_update";
export type PaymentStatus = "pending" | "held" | "released" | "refunded" | "failed";
export type PaymentMethod = "cash" | "mobile_money" | "card" | "platform_wallet";
export type ComplaintStatus = "open" | "investigating" | "resolved" | "rejected";
export type ComplaintReason =
  | "not_done"
  | "not_compliant"
  | "payment_dispute"
  | "bad_behavior"
  | "fraud"
  | "fake_profile"
  | "other";
export type DocumentStatus = "pending" | "approved" | "rejected";
export type SubscriptionPlan = "free" | "pro" | "premium";

export interface Profile {
  id: string;
  role: UserRole;
  status: AccountStatus;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  locale: string;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Artisan {
  id: string;
  headline: string | null;
  description: string | null;
  years_experience: number;
  service_radius_km: number;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  subscription_plan: SubscriptionPlan;
  subscription_expires_at: string | null;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface ArtisanWithProfile extends Artisan {
  profile: Profile;
  categories?: Category[];
}

export interface RequestRow {
  id: string;
  client_id: string;
  title: string;
  description: string;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  desired_date: string | null;
  desired_time: string | null;
  budget_min: number | null;
  budget_max: number | null;
  estimated_duration: string | null;
  urgency: UrgencyLevel;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface RequestItem {
  id: string;
  request_id: string;
  category_id: string;
  description: string | null;
  status: RequestItemStatus;
  assigned_artisan_id: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  request_item_id: string;
  artisan_id: string;
  description: string;
  labor_cost: number;
  materials_cost: number;
  extra_fees: number;
  total_amount: number;
  delay_days: number | null;
  proposed_date: string | null;
  conditions: string | null;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  request_item_id: string;
  quote_id: string;
  client_id: string;
  artisan_id: string;
  status: BookingStatus;
  scheduled_date: string | null;
  scheduled_time: string | null;
  amount: number;
  started_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  artisan_id: string;
  request_id: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  channel: "app" | "sms" | "email" | "whatsapp";
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  artisan_id: string;
  rating: number;
  comment: string | null;
  is_hidden: boolean;
  hidden_reason: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  reporter_id: string;
  against_id: string | null;
  booking_id: string | null;
  reason: ComplaintReason;
  description: string;
  status: ComplaintStatus;
  resolution_note: string | null;
  handled_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface Payment {
  id: string;
  booking_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  platform_fee: number;
  paid_at: string | null;
  released_at: string | null;
  created_at: string;
}

export interface Favorite {
  client_id: string;
  artisan_id: string;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  artisan_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface ArtisanZone {
  id: string;
  artisan_id: string;
  city: string;
  district: string | null;
  created_at: string;
}

export interface ArtisanAvailability {
  id: string;
  artisan_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface DocumentRow {
  id: string;
  artisan_id: string;
  doc_type: string;
  file_url: string;
  status: DocumentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

// Minimal `Database` shape so `createBrowserClient<Database>` / `createServerClient<Database>`
// type-check. Table row/insert/update shapes are intentionally loose (any) here; call sites
// use the richer interfaces above for real typing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;
type Table = { Row: AnyRow; Insert: AnyRow; Update: AnyRow };

export interface Database {
  public: {
    Tables: {
      profiles: Table;
      clients: Table;
      artisans: Table;
      artisan_categories: Table;
      artisan_zones: Table;
      portfolio_items: Table;
      artisan_availability: Table;
      documents: Table;
      favorites: Table;
      categories: Table;
      requests: Table;
      request_items: Table;
      request_media: Table;
      request_responses: Table;
      quotes: Table;
      bookings: Table;
      conversations: Table;
      messages: Table;
      notifications: Table;
      payments: Table;
      reviews: Table;
      complaints: Table;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
