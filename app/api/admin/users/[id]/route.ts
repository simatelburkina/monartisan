import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/data/require-admin";
import { notify } from "@/lib/data/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status, supabase } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const { action } = await req.json(); // suspend | activate | ban
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
