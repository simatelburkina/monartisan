import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { artisanId, clientId, requestId } = await req.json();

  const finalClientId = profile?.role === "client" ? user.id : clientId;
  const finalArtisanId = profile?.role === "artisan" ? user.id : artisanId;

  if (!finalClientId || !finalArtisanId) {
    return NextResponse.json({ error: "Participants manquants" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("client_id", finalClientId)
    .eq("artisan_id", finalArtisanId)
    .eq("request_id", requestId || null)
    .maybeSingle();

  if (existing) return NextResponse.json({ conversation: existing });

  const { data, error } = await supabase
    .from("conversations")
    .insert({ client_id: finalClientId, artisan_id: finalArtisanId, request_id: requestId || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversation: data });
}
