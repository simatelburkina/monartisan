import { createClient } from "@/lib/supabase/server";

export async function getClientRequests(clientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select("*, request_items(*, categories(name, icon, slug), quotes(*))")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getRequestDetail(requestId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select(
      `*, request_media(*),
       request_items(*, categories(name, icon, slug),
         quotes(*, artisan:artisans(id, profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url), rating_avg, rating_count, is_verified)),
         request_responses(*, artisan:artisans(id, profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url))))`
    )
    .eq("id", requestId)
    .single();
  return data;
}

// Demandes correspondant aux métiers de l'artisan (feed "nouvelles demandes")
export async function getMatchingRequestsForArtisan(artisanId: string) {
  const supabase = await createClient();
  const { data: cats } = await supabase.from("artisan_categories").select("category_id").eq("artisan_id", artisanId);
  const categoryIds = (cats || []).map((c) => c.category_id);
  if (categoryIds.length === 0) return [];

  const { data } = await supabase
    .from("request_items")
    .select(
      `*, categories(name, icon, slug),
       requests!inner(id, title, description, city, desired_date, urgency, budget_min, budget_max, status, created_at, request_media(media_url)),
       request_responses(artisan_id, decision)`
    )
    .in("category_id", categoryIds)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getArtisanQuotes(artisanId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select(
      `*, request_items(id, description, categories(name, icon, slug), requests(id, title, client_id, city, profiles:clients!inner(profile:profiles!clients_id_fkey(display_name))))`
    )
    .eq("artisan_id", artisanId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getBookingsFor(userId: string, role: "client" | "artisan") {
  const supabase = await createClient();
  const column = role === "client" ? "client_id" : "artisan_id";
  const { data } = await supabase
    .from("bookings")
    .select(
      `*, quote:quotes(description, total_amount),
       request_item:request_items(description, categories(name, icon, slug)),
       client:clients!inner(profile:profiles!clients_id_fkey(display_name, avatar_url, phone)),
       artisan:artisans!inner(profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url, phone), rating_avg),
       review:reviews(id, rating, comment)`
    )
    .eq(column, userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getBookingDetail(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      `*, quote:quotes(*), request_item:request_items(*, categories(name, icon, slug), requests(title, description, address)),
       client:clients!inner(profile:profiles!clients_id_fkey(display_name, avatar_url, phone)),
       artisan:artisans!inner(id, profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url, phone), rating_avg),
       review:reviews(id, rating, comment)`
    )
    .eq("id", id)
    .single();
  return data;
}
