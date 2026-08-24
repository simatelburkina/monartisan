import { createClient } from "@/lib/supabase/server";

export async function getConversationsForUser(userId: string, role: "client" | "artisan" | "admin") {
  const supabase = await createClient();
  const column = role === "artisan" ? "artisan_id" : "client_id";
  const { data } = await supabase
    .from("conversations")
    .select(
      `id, request_id, last_message_at, created_at,
       client:clients!inner(id, profile:profiles!clients_id_fkey(display_name, avatar_url)),
       artisan:artisans!inner(id, profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url)),
       messages(body, created_at, sender_id, read_at)`
    )
    .eq(column, userId)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  return (data as unknown as Record<string, unknown>[]) || [];
}

export async function getConversationThread(conversationId: string) {
  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `id, client_id, artisan_id, request_id,
       client:clients!inner(id, profile:profiles!clients_id_fkey(display_name, avatar_url)),
       artisan:artisans!inner(id, profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url))`
    )
    .eq("id", conversationId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");

  return { conversation, messages: messages || [] };
}
