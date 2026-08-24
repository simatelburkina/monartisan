import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/data/notify";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { conversationId, body: text, attachmentUrl, attachmentType } = await req.json();
  if (!conversationId || (!text && !attachmentUrl)) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("client_id, artisan_id")
    .eq("id", conversationId)
    .single();
  if (!conversation) return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: text || null,
      attachment_url: attachmentUrl || null,
      attachment_type: attachmentType || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const recipientId = conversation.client_id === user.id ? conversation.artisan_id : conversation.client_id;
  await notify({
    userId: recipientId,
    type: "new_message",
    title: "Nouveau message",
    body: text?.slice(0, 80),
    link: `/messages/${conversationId}`,
  });

  return NextResponse.json({ message });
}
