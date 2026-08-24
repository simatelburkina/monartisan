import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyMany } from "@/lib/data/notify";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { againstId, bookingId, reason, description } = await req.json();
  if (!reason || !description) return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

  const { data: complaint, error } = await supabase
    .from("complaints")
    .insert({ reporter_id: user.id, against_id: againstId || null, booking_id: bookingId || null, reason, description })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const admin = createAdminClient();
  const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin");
  await notifyMany((admins || []).map((a) => a.id), {
    type: "complaint_update",
    title: "Nouvelle réclamation à traiter",
    body: description.slice(0, 100),
    link: `/admin/complaints/${complaint.id}`,
  });

  return NextResponse.json({ complaint });
}
