import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { artisanId } = await req.json();
  const { data: existing } = await supabase
    .from("favorites")
    .select("*")
    .eq("client_id", user.id)
    .eq("artisan_id", artisanId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("client_id", user.id).eq("artisan_id", artisanId);
    return NextResponse.json({ favorited: false });
  }

  await supabase.from("favorites").insert({ client_id: user.id, artisan_id: artisanId });
  return NextResponse.json({ favorited: true });
}
