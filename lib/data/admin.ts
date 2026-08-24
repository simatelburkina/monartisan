import { createClient } from "@/lib/supabase/server";

export async function getAdminStats() {
  const supabase = await createClient();
  const [clients, artisans, requests, bookings, complaintsOpen, pendingDocs] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("artisans").select("*", { count: "exact", head: true }),
    supabase.from("requests").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    clients: clients.count || 0,
    artisans: artisans.count || 0,
    requests: requests.count || 0,
    bookings: bookings.count || 0,
    complaintsOpen: complaintsOpen.count || 0,
    pendingDocs: pendingDocs.count || 0,
  };
}

export async function getAllUsers(search?: string) {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  const { data } = await query;
  return data || [];
}

export async function getAllArtisans() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artisans")
    .select("*, profile:profiles!artisans_id_fkey(*), documents(*)")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getArtisanAdminDetail(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artisans")
    .select(
      `*, profile:profiles!artisans_id_fkey(*), documents(*),
       artisan_categories(hourly_rate, categories(name, icon))`
    )
    .eq("id", id)
    .single();
  return data;
}

export async function getAllRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select("*, client:clients!inner(profile:profiles!clients_id_fkey(display_name)), request_items(id, status, categories(name))")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

export async function getAllBookings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      `*, client:clients!inner(profile:profiles!clients_id_fkey(display_name)),
       artisan:artisans!inner(profile:profiles!artisans_id_fkey(display_name, company_name)),
       request_item:request_items(categories(name))`
    )
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

export async function getAllComplaints() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("complaints")
    .select("*, reporter:profiles!complaints_reporter_id_fkey(display_name), against:profiles!complaints_against_id_fkey(display_name)")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getComplaintDetail(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("complaints")
    .select("*, reporter:profiles!complaints_reporter_id_fkey(*), against:profiles!complaints_against_id_fkey(*)")
    .eq("id", id)
    .single();
  return data;
}

export async function getAllReviews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      `*, client:clients!inner(profile:profiles!clients_id_fkey(display_name)),
       artisan:artisans!inner(profile:profiles!artisans_id_fkey(display_name, company_name))`
    )
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

export async function getAllPayments() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*, booking:bookings(id, amount, status)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}
