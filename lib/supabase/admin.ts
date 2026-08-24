import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client "service role" — usage strictement côté serveur (route handlers admin,
// vérification de documents, envoi de notifications). Ne jamais exposer au client.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
