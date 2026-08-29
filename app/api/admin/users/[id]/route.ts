import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/data/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/data/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status, supabase } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { action } = body; // suspend | activate | ban | edit

  if (action === "edit") {
    const { displayName, phone, city, address } = body;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        phone: phone || null,
        city: city || null,
        address: address || null,
      })
      .eq("id", id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const map: Record<string, string> = { suspend: "suspended", activate: "active", ban: "banned" };
  const newStatus = map[action];
  if (!newStatus) return NextResponse.json({ error: "Action invalide" }, { status: 400 });

  const { error: updateError } = await supabase.from("profiles").update({ status: newStatus }).eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (newStatus !== "active") {
    await notify({
      userId: id,
      type: "account_suspended",
      title: "Votre compte a été suspendu par l'administration",
      link: "/",
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const admin = createAdminClient();
  const { error: deleteError } = await admin.auth.admin.deleteUser(id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
