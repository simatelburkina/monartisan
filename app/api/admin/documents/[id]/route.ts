import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/data/require-admin";
import { notify } from "@/lib/data/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status, supabase, user } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const { decision, rejectionReason } = await req.json(); // approved | rejected
  const { data: doc } = await supabase
    .from("documents")
    .update({
      status: decision,
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: decision === "rejected" ? rejectionReason : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (doc) {
    await notify({
      userId: doc.artisan_id,
      type: decision === "approved" ? "account_verified" : "complaint_update",
      title: decision === "approved" ? "Document approuvé" : "Document rejeté",
      body: decision === "rejected" ? rejectionReason : undefined,
      link: "/artisan/documents",
    });
  }

  return NextResponse.json({ ok: true });
}
