import { createBrowserClient } from "@supabase/ssr";

// Non générique volontairement : voir lib/types/database.ts pour le détail.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
