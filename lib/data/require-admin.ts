import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" as const, status: 401 as const, supabase, user: null };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return { error: "Non autorisé" as const, status: 403 as const, supabase, user };

  return { error: null, status: 200 as const, supabase, user };
}
