import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/data/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { verified } = await req.json();
  const { error } = await supabase
    .from("artisans")
    .update({
      is_verified: verified,
      verified_at: verified ? new Date().toISOString() : null,
      verified_by: verified ? user.id : null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await notify({
    userId: id,
    type: "account_verified",
    title: verified ? "Votre profil a été vérifié ✅" : "Votre badge vérifié a été retiré",
    link: "/artisan/profile",
  });

  return NextResponse.json({ ok: true });
}
